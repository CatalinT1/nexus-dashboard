"use client";
import React from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Users, Calendar, DollarSign, Star,
  ArrowRight, Clock, CheckCircle2, AlertCircle, XCircle, Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { mockAppointments, mockClients, mockRevenueData, mockClientActivities } from "@/lib/data/mock-data";
import { formatCurrency, formatDate, formatRelativeTime, getInitials } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";

const kpis = [
  {
    label: "Total Revenue",
    value: formatCurrency(mockRevenueData.reduce((s, d) => s + d.revenue, 0)),
    change: 18.2,
    trend: "up" as const,
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    description: "vs last year",
  },
  {
    label: "Active Clients",
    value: mockClients.filter(c => c.status === "active" || c.status === "vip").length,
    change: 12.5,
    trend: "up" as const,
    icon: Users,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    description: "of 8 total",
  },
  {
    label: "Appointments (MTD)",
    value: mockRevenueData[5].appointments,
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

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; badgeVariant: "success" | "default" | "secondary" | "destructive" | "warning" }> = {
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-emerald-500", badgeVariant: "success" },
  scheduled: { label: "Scheduled", icon: Clock, color: "text-indigo-500", badgeVariant: "default" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-slate-400", badgeVariant: "secondary" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-500", badgeVariant: "destructive" },
  "no-show": { label: "No Show", icon: AlertCircle, color: "text-amber-500", badgeVariant: "warning" },
};

export default function DashboardPage() {
  const upcomingAppointments = mockAppointments
    .filter(a => a.status !== "cancelled" && a.status !== "completed")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(new Date(), "long")} · Welcome back, Admin
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

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue for the current year</CardDescription>
              </div>
              <Badge variant="success" className="text-xs">+18.2% YoY</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <RechartsTooltip
                    contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, color: "#f1f5f9", fontSize: 12 }}
                    formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: "#4f46e5" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Appointment breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Monthly count this year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockRevenueData.slice(-6)} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, color: "#f1f5f9", fontSize: 12 }}
                    formatter={(value) => [Number(value), "Appointments"]}
                  />
                  <Bar dataKey="appointments" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

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
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {upcomingAppointments.map((apt, i) => {
                const status = statusConfig[apt.status];
                const StatusIcon = status.icon;
                return (
                  <div key={apt.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50/80 transition-colors">
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: apt.color }}
                    />
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
          </CardContent>
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
          <CardContent className="p-0">
            <div className="px-6 pb-4 space-y-4">
              {mockClientActivities.map((activity, i) => {
                const client = mockClients.find(c => c.id === activity.clientId);
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                      <AvatarFallback className="text-[10px]">{getInitials(client?.name ?? "?")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 line-clamp-1">{activity.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{client?.name} · {formatRelativeTime(activity.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "VIP Clients", value: mockClients.filter(c => c.status === "vip").length, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "New Prospects", value: mockClients.filter(c => c.status === "prospect").length, color: "text-sky-600", bg: "bg-sky-50" },
          { label: "Today's Appts", value: mockAppointments.filter(a => new Date(a.startTime).toDateString() === new Date().toDateString()).length, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Active Staff", value: 3, color: "text-emerald-600", bg: "bg-emerald-50" },
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
