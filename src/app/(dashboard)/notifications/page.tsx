"use client";
import React, { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { mapNotification } from "@/lib/supabase/mappers";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { Notification } from "@/lib/types";

const PAGE_SIZE = 20;

const typeIcon: Record<string, React.ElementType> = {
  info:    Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error:   XCircle,
};

const typeColor: Record<string, string> = {
  info:    "bg-sky-100 text-sky-600",
  success: "bg-emerald-100 text-emerald-600",
  warning: "bg-amber-100 text-amber-600",
  error:   "bg-red-100 text-red-600",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [loadingMore, setLoadingMore]     = useState(false);
  const [hasMore, setHasMore]             = useState(false);
  const [offset, setOffset]               = useState(0);

  const fetchPage = async (from: number, replace: boolean) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    const mapped = (data ?? []).map(mapNotification);
    setNotifications((prev) => replace ? mapped : [...prev, ...mapped]);
    setHasMore(mapped.length === PAGE_SIZE);
    setOffset(from + mapped.length);
  };

  useEffect(() => {
    fetchPage(0, true).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (!unread.length) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).in("id", unread);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await fetchPage(offset, false);
    setLoadingMore(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-3.5 w-3.5" />Mark all read
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">No notifications yet</p>
            <p className="text-xs text-slate-400 mt-1">We&apos;ll let you know when something happens</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => {
              const Icon = typeIcon[notif.type] ?? Bell;
              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  className={cn(
                    "flex items-start gap-4 px-5 py-4 transition-colors",
                    !notif.isRead ? "bg-indigo-50/40 hover:bg-indigo-50/70 cursor-pointer" : "hover:bg-slate-50/50"
                  )}
                >
                  <div className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full mt-0.5",
                    typeColor[notif.type]
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm truncate",
                        notif.isRead ? "font-normal text-slate-700" : "font-semibold text-slate-900"
                      )}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                        {!notif.isRead && (
                          <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                      className="shrink-0 p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors mt-0.5"
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {hasMore && (
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore
              ? <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />Loading…</>
              : "Load more"}
          </Button>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <p className="text-center text-[11px] text-slate-400">
          Showing {notifications.length} notification{notifications.length > 1 ? "s" : ""}
          {hasMore ? " — scroll down for more" : " — that's all"}
        </p>
      )}
    </div>
  );
}
