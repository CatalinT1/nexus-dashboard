"use client";
import React, { useState } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Clock, User, MapPin,
  Filter, CheckCircle2, XCircle, AlertCircle, Calendar,
  List, Grid3X3, DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { mockAppointments, mockStaff } from "@/lib/data/mock-data";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8am–5pm

const statusConfig: Record<AppointmentStatus, {
  label: string; variant: "success"|"default"|"secondary"|"destructive"|"warning"; icon: React.ElementType; dot: string
}> = {
  confirmed: { label: "Confirmed", variant: "success", icon: CheckCircle2, dot: "bg-emerald-500" },
  scheduled: { label: "Scheduled", variant: "default", icon: Clock, dot: "bg-indigo-500" },
  completed: { label: "Completed", variant: "secondary", icon: CheckCircle2, dot: "bg-slate-400" },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle, dot: "bg-red-500" },
  "no-show": { label: "No Show", variant: "warning", icon: AlertCircle, dot: "bg-amber-500" },
};

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const days: { date: Date; currentMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, daysInPrevMonth - i), currentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), currentMonth: true });
  }
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ date: new Date(year, month + 1, d), currentMonth: false });
  }
  return days;
}

function getAppointmentsForDate(date: Date) {
  return mockAppointments.filter(a => {
    const d = new Date(a.startTime);
    return d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate();
  });
}

export default function AppointmentsPage() {
  const today = new Date("2026-06-12");
  const [view, setView] = useState<"month" | "week" | "list">("month");
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [staffFilter, setStaffFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);

  const navigate = (dir: -1 | 1) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (view === "month") d.setMonth(d.getMonth() + dir);
      else d.setDate(d.getDate() + 7 * dir);
      return d;
    });
  };

  const filteredApts = mockAppointments.filter(a => {
    if (staffFilter !== "all" && a.staffId !== staffFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });

  const upcomingApts = [...mockAppointments]
    .filter(a => new Date(a.startTime) >= today && a.status !== "cancelled")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="mt-1 text-sm text-slate-500">{mockAppointments.filter(a => a.status !== "cancelled").length} active appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 gap-0.5">
            {(["month", "week", "list"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  view === v ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {v === "month" ? <Grid3X3 className="h-3 w-3" /> : v === "week" ? <Calendar className="h-3 w-3" /> : <List className="h-3 w-3" />}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <Button size="sm"><Plus className="h-3.5 w-3.5" />New Appointment</Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Today", value: getAppointmentsForDate(today).length, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "This Week", value: mockAppointments.filter(a => { const d = new Date(a.startTime); return d >= today && d <= new Date(today.getTime() + 7*86400000); }).length, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Confirmed", value: mockAppointments.filter(a => a.status === "confirmed").length, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending", value: mockAppointments.filter(a => a.status === "scheduled").length, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg} shrink-0`}>
                <span className={`text-base font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <p className="text-xs font-medium text-slate-600">{stat.label} appointments</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={staffFilter} onValueChange={setStaffFilter}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="All Staff" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Staff</SelectItem>
            {mockStaff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Calendar/View */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <Card>
            {/* Nav */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <ChevronLeft className="h-4 w-4 text-slate-500" />
              </button>
              <h2 className="text-sm font-semibold text-slate-900">
                {MONTHS[month]} {year}
              </h2>
              <button onClick={() => navigate(1)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {view === "month" && (
              <CardContent className="p-3">
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {DAYS.map(d => (
                    <div key={d} className="py-2 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      {d}
                    </div>
                  ))}
                </div>
                {/* Days grid */}
                <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
                  {days.map(({ date, currentMonth }, i) => {
                    const apts = getAppointmentsForDate(date).filter(a => {
                      if (staffFilter !== "all" && a.staffId !== staffFilter) return false;
                      if (statusFilter !== "all" && a.status !== statusFilter) return false;
                      return true;
                    });
                    const isToday = date.toDateString() === today.toDateString();
                    return (
                      <div
                        key={i}
                        className={cn(
                          "min-h-20 bg-white p-1.5 cursor-pointer hover:bg-indigo-50/30 transition-colors",
                          !currentMonth && "bg-slate-50/60",
                        )}
                      >
                        <div className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold mb-1 mx-auto",
                          isToday ? "bg-indigo-600 text-white" : currentMonth ? "text-slate-700" : "text-slate-300"
                        )}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-0.5">
                          {apts.slice(0, 3).map(apt => (
                            <button
                              key={apt.id}
                              onClick={() => setSelectedApt(apt)}
                              className="w-full text-left rounded px-1 py-0.5 text-[10px] font-medium truncate transition-opacity hover:opacity-80"
                              style={{ backgroundColor: `${apt.color}20`, color: apt.color }}
                            >
                              {apt.clientName}
                            </button>
                          ))}
                          {apts.length > 3 && (
                            <p className="text-[10px] text-slate-400 px-1">+{apts.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}

            {view === "list" && (
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {filteredApts
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map(apt => {
                      const status = statusConfig[apt.status];
                      return (
                        <button
                          key={apt.id}
                          onClick={() => setSelectedApt(apt)}
                          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: apt.color }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-900 truncate">{apt.clientName}</p>
                              <Badge variant={status.variant} className="text-[10px] h-4 px-1.5 shrink-0">{status.label}</Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{apt.title} · {apt.staffName}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-medium text-slate-700">{formatDate(apt.startTime, "short")}</p>
                            <p className="text-xs text-slate-400">{new Date(apt.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
                          </div>
                          {apt.fee && <p className="text-sm font-semibold text-slate-900 shrink-0 hidden sm:block">{formatCurrency(apt.fee)}</p>}
                        </button>
                      );
                    })}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Sidebar: upcoming */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {upcomingApts.slice(0, 6).map(apt => {
                  const status = statusConfig[apt.status];
                  return (
                    <button
                      key={apt.id}
                      onClick={() => setSelectedApt(apt)}
                      className="w-full flex items-start gap-3 px-5 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors text-left"
                    >
                      <div className="h-2 w-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: apt.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{apt.clientName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{apt.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(apt.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {new Date(apt.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Categories</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2">
                {[
                  { label: "Consultation", color: "#4f46e5" },
                  { label: "Follow-up", color: "#0891b2" },
                  { label: "Treatment", color: "#059669" },
                  { label: "Review", color: "#7c3aed" },
                ].map(cat => (
                  <div key={cat.label} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-slate-600">{cat.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Appointment detail modal */}
      <Dialog open={!!selectedApt} onOpenChange={() => setSelectedApt(null)}>
        {selectedApt && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedApt.color }} />
                <DialogTitle>{selectedApt.title}</DialogTitle>
              </div>
              <DialogDescription>
                <Badge variant={statusConfig[selectedApt.status].variant} className="mt-1">
                  {statusConfig[selectedApt.status].label}
                </Badge>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-1">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50">
                  <User className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Client</p>
                  <p className="text-sm font-medium text-slate-900">{selectedApt.clientName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-50">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[8px]">{getInitials(selectedApt.staffName)}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Staff</p>
                  <p className="text-sm font-medium text-slate-900">{selectedApt.staffName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-50">
                  <Clock className="h-3.5 w-3.5 text-sky-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Date & Time</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDate(selectedApt.startTime, "long")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(selectedApt.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                    {" — "}
                    {new Date(selectedApt.endTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                  </p>
                </div>
              </div>

              {selectedApt.location && (
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Location</p>
                    <p className="text-sm font-medium text-slate-900">{selectedApt.location}</p>
                  </div>
                </div>
              )}

              {selectedApt.fee && (
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50">
                    <DollarSign className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Fee</p>
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(selectedApt.fee)}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <DialogFooter className="gap-2">
              {selectedApt.status !== "completed" && selectedApt.status !== "cancelled" && (
                <>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    Cancel
                  </Button>
                  <Button variant="success" size="sm">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Confirm
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedApt(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
