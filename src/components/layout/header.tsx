"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, Plus, ChevronDown, User, Settings, LogOut, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { mapNotification } from "@/lib/supabase/mappers";
import { formatRelativeTime, getInitials, cn } from "@/lib/utils";
import type { Notification } from "@/lib/types";

const notificationIconColor: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-600",
  warning: "bg-amber-100 text-amber-600",
  info: "bg-sky-100 text-sky-600",
  error: "bg-red-100 text-red-600",
};

type HeaderUser = { name: string; email: string; role: string; avatar?: string };
type SearchResult = {
  clients: { id: string; name: string; email: string }[];
  appointments: { id: string; title: string; client_name: string; start_time: string }[];
};

export function Header({ user }: { user: HeaderUser }) {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult>({ clients: [], appointments: [] });
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setNotifications(data.map(mapNotification));
      });
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSearchResults({ clients: [], appointments: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const supabase = createClient();
      const [{ data: clients }, { data: apts }] = await Promise.all([
        supabase.from("clients").select("id, name, email").ilike("name", `%${query}%`).limit(5),
        supabase.from("appointments")
          .select("id, title, client_name, start_time")
          .ilike("title", `%${query}%`)
          .limit(5),
      ]);
      setSearchResults({
        clients: (clients ?? []) as SearchResult["clients"],
        appointments: (apts ?? []) as SearchResult["appointments"],
      });
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasResults = searchResults.clients.length > 0 || searchResults.appointments.length > 0;

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSearchSelect = (path: string) => {
    setQuery("");
    setSearchOpen(false);
    router.push(path);
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 gap-4 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <Input
          placeholder="Search clients, appointments..."
          leftIcon={<Search className="h-3.5 w-3.5" />}
          className={cn("h-8 bg-slate-50 border-slate-200 text-sm", query && "pr-7")}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
          onFocus={() => query.length >= 2 && setSearchOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setSearchResults({ clients: [], appointments: [] }); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        {/* Search results dropdown */}
        {searchOpen && (hasResults || searching || query.length >= 2) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {searching && (
              <p className="px-3 py-3 text-xs text-slate-500 text-center">Searching…</p>
            )}
            {!searching && query.length >= 2 && !hasResults && (
              <p className="px-3 py-3 text-xs text-slate-500 text-center">No results for &ldquo;{query}&rdquo;</p>
            )}
            {searchResults.clients.length > 0 && (
              <div>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                  Clients
                </p>
                {searchResults.clients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSearchSelect(`/clients/${c.id}`)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 shrink-0">
                      {getInitials(c.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{c.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{c.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchResults.appointments.length > 0 && (
              <div>
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100 border-t border-slate-100">
                  Appointments
                </p>
                {searchResults.appointments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleSearchSelect("/appointments")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <Search className="h-3 w-3 text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{a.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{a.client_name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Quick add */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/clients/new">New Client</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/appointments?new=1">New Appointment</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-semibold text-slate-900">Notifications</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                {unreadCount > 0 && <Badge variant="default" className="text-[10px] h-4 px-1.5">{unreadCount} new</Badge>}
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-3 py-4 text-xs text-slate-500 text-center">No notifications</p>
              ) : notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkRead(notif.id)}
                  className={cn(
                    "flex items-start gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors",
                    !notif.isRead && "bg-indigo-50/50"
                  )}
                >
                  <div className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs mt-0.5",
                    notificationIconColor[notif.type]
                  )}>
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && (
                    <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  )}
                </div>
              ))}
            </div>
            <DropdownMenuSeparator />
            <div className="px-3 py-2">
              <Link
                href="/notifications"
                className="block w-full text-xs text-indigo-600 hover:text-indigo-700 font-medium text-center transition-colors"
              >
                View all notifications
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100 transition-colors">
              <Avatar className="h-7 w-7">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                <AvatarFallback className="text-[10px]">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900 leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{user.role}</p>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-3.5 w-3.5" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
