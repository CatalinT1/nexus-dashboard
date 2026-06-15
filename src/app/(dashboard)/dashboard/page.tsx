import React from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Users, Calendar, DollarSign, Star,
  ArrowRight, Clock, CheckCircle2, AlertCircle, XCircle, Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { mapAppointment, mapClientActivity, mapRevenueData } from "@/lib/supabase/mappers";
import { formatCurrency, formatDate, formatRelativeTime, getInitials } from "@/lib/utils";
import { DashboardCharts } from "./charts";
import type { Appointment, ClientActivity, RevenueData } from "@/lib/types";

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; badgeVariant: "success" | "default" | "secondary" | "destructive" | "warning" }> = {
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-emerald-500", badgeVariant: "success" },
  scheduled: { label: "Scheduled", icon: Clock, color: "text-indigo-500", badgeVariant: "default" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-slate-400", badgeVariant: "secondary" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-500", badgeVariant: "destructive" },
  "no-show": { label: "No Show", icon: AlertCircle, color: "text-amber-500", badgeVariant: "warning" },
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Start of today in ISO (UTC) — scopes all appointment queries to future/today only
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [
    { data: rawAppointments },
    { data: rawActivities },
    { data: rawRevenue },
    { data: rawClientStatuses },
    { count: activeStaff },
  ] = await Promise.all([
    // Only fetch upcoming + today; only columns the dashboard needs; limit to 20
    supabase
      .from("appointments")
      .select("id,client_id,client_name,staff_id,staff_name,title,category,status,start_time,end_time,fee,color,reminders,notes,location,created_at,updated_at")
      .gte("start_time", todayStart.toISOString())
      .not("status", "in", '("cancelled","completed")')
      .order("start_time", { ascending: true })
      .limit(20),
    // Only the 3 columns needed for the activity feed
    supabase
      .from("client_activities")
      .select("id,client_id,type,title,description,created_at,created_by")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("revenue_data").select("*").order("month_order", { ascending: true }),
    // One status-only query replaces 4 separate COUNT queries
    supabase.from("clients").select("status"),
    supabase.from("staff").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  // Derive all four counts from one result set
  const clientStatuses = rawClientStatuses ?? [];
  const totalClients   = clientStatuses.length;
  const activeClients  = clientStatuses.filter((c) => c.status === "active" || c.status === "vip").length;
  const vipClients     = clientStatuses.filter((c) => c.status === "vip").length;
  const prospectClients = clientStatuses.filter((c) => c.status === "prospect").length;

  const appointments: Appointment[] = (rawAppointments ?? []).map(mapAppointment);
  const activities: ClientActivity[] = (rawActivities ?? []).map(mapClientActivity);
  const revenueData: RevenueData[] = (rawRevenue ?? []).map(mapRevenueData);

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const mtdAppointments = revenueData.at(-1)?.appointments ?? 0;

  // Already scoped to upcoming (gte today, not cancelled/completed) — just take first 5
  const upcomingAppointments = appointments.slice(0, 5);

  const todayEndStr = todayEnd.toISOString();
  const todayAppointments = appointments.filter(
    (a) => a.startTime < todayEndStr
  ).length;

  const kpis = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      change: 18.2,
      trend: "up" as const,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      description: "vs last year",
    },
    {
      label: "Active Clients",
      value: activeClients ?? 0,
      change: 12.5,
      trend: "up" as const,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      description: `of ${totalClients ?? 0} total`,
    },
    {
      label: "Appointments (MTD)",
      value: mtdAppointments,
      change: 8.3,
      trend: "up" as const,
      icon: Calendar,
      color: "text-violet-600",
      bg: "bg-violet-50",
      description: "this month",
    },
    {
      label: "Avg. Rating",
      value: "4.8",
      change: 0.2,
      trend: "up" as const,
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50",
      description: "client satisfaction",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(new Date(), "long")} · Welcome back
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Export</Button>
          <Button size="sm" asChild>
            <Link href="/appointments"><Plus className="h-3.5 w-3.5" />New Appointment</Link>
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="relative overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{kpi.label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</p>
                    <div className="mt-1 flex items-center gap-1">
                      {kpi.trend === "up"
                        ? <TrendingUp className="h-3 w-3 text-emerald-500" />
                        : <TrendingDown className="h-3 w-3 text-red-500" />}
                      <span className={`text-xs font-semibold ${kpi.trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                        +{kpi.change}%
                      </span>
                      <span className="text-xs text-slate-400">{kpi.description}</span>
                    </div>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>
                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DashboardCharts revenueData={revenueData} />

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Upcoming appointments */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Appointments</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/appointments" className="text-indigo-600 hover:text-indigo-700 text-xs">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {upcomingAppointments.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-slate-400">No upcoming appointments</p>
            ) : upcomingAppointments.map((apt) => {
              const status = statusConfig[apt.status] ?? statusConfig.scheduled;
              return (
                <div key={apt.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50/80 transition-colors">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: apt.color ?? "#6366f1" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">{apt.clientName}</p>
                      <Badge variant={status.badgeVariant} className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{apt.title} · {apt.staffName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-slate-700">
                      {new Date(apt.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(apt.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                    </p>
                  </div>
                  {apt.fee && (
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(apt.fee)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/clients" className="text-indigo-600 hover:text-indigo-700 text-xs">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <div className="px-6 pb-4 space-y-4">
            {activities.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">No recent activity</p>
            ) : activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                  <AvatarFallback className="text-[10px]">{getInitials(activity.createdBy)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 line-clamp-1">{activity.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{formatRelativeTime(activity.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "VIP Clients", value: vipClients ?? 0, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "New Prospects", value: prospectClients ?? 0, color: "text-sky-600", bg: "bg-sky-50" },
          { label: "Today's Appts", value: todayAppointments, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Active Staff", value: activeStaff ?? 0, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg} shrink-0`}>
                <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <p className="text-xs font-medium text-slate-600">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
