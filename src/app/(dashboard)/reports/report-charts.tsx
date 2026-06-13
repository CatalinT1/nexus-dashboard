"use client";
import React, { useState } from "react";
import { Download, TrendingUp, TrendingDown, DollarSign, Users, Calendar, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import type { RevenueData, Client, Staff } from "@/lib/types";

const categoryData = [
  { name: "Consultation", value: 38, fill: "#4f46e5" },
  { name: "Follow-up", value: 28, fill: "#0891b2" },
  { name: "Treatment", value: 22, fill: "#059669" },
  { name: "Review", value: 12, fill: "#7c3aed" },
];

type Props = {
  revenueData: RevenueData[];
  topClients: Client[];
  topStaff: Staff[];
  totalRevenue: number;
  totalAppointments: number;
  activeClients: number;
};

export function ReportCharts({ revenueData, topClients, topStaff, totalRevenue, totalAppointments, activeClients }: Props) {
  const [period, setPeriod] = useState("year");
  const avgRevPerApt = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

  const kpis = [
    { label: "Total Revenue", value: formatCurrency(totalRevenue), change: "+18.2%", up: true, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Appointments", value: totalAppointments, change: "+12.5%", up: true, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Avg Rev / Appt", value: formatCurrency(avgRevPerApt), change: "+5.1%", up: true, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Active Clients", value: activeClients, change: "+8.3%", up: true, icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 justify-end">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" />Export</Button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{kpi.label}</p>
                    <p className="mt-2 text-xl font-bold text-slate-900 tracking-tight">{kpi.value}</p>
                    <div className="mt-1 flex items-center gap-1">
                      {kpi.up ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                      <span className={`text-xs font-semibold ${kpi.up ? "text-emerald-600" : "text-red-600"}`}>{kpi.change}</span>
                    </div>
                  </div>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${kpi.bg}`}>
                    <Icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue across the year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, color: "#f1f5f9", fontSize: 12 }} formatter={(v) => [formatCurrency(Number(v)), "Revenue"]} />
                      <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fill="url(#rev)" dot={false} activeDot={{ r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By Category</CardTitle>
                <CardDescription>Appointment type breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                        {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, color: "#f1f5f9", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 space-y-1.5">
                  {categoryData.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: c.fill }} />
                        <span className="text-slate-600">{c.name}</span>
                      </div>
                      <span className="font-medium text-slate-900">{c.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Appointments</CardTitle>
              <CardDescription>Total appointments booked per month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, color: "#f1f5f9", fontSize: 12 }} />
                    <Bar dataKey="appointments" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Clients by Revenue</CardTitle>
              <CardDescription>Highest-value clients this period</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {topClients.map((client, i) => (
                  <div key={client.id} className="flex items-center gap-4 px-6 py-4">
                    <span className="text-sm font-bold text-slate-300 w-5 shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{client.name}</p>
                      <p className="text-xs text-slate-500">{client.company || "Individual"} · {client.totalAppointments} appointments</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(client.totalRevenue)}</p>
                      <div className="mt-0.5 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden ml-auto">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${topClients[0] ? (client.totalRevenue / topClients[0].totalRevenue) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
              <CardDescription>Appointments and ratings by staff member</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {topStaff.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-4 px-6 py-4">
                    <span className="text-sm font-bold text-slate-300 w-5 shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.specialization}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{s.rating}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{s.totalAppointments}</p>
                      <p className="text-xs text-slate-400">appointments</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
