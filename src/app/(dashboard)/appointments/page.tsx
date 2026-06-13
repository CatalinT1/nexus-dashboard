"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Clock, User, MapPin,
  Filter, CheckCircle2, XCircle, AlertCircle, Calendar,
  List, Grid3X3, DollarSign, Edit, Trash2, FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { mapAppointment, mapStaff } from "@/lib/supabase/mappers";
import { formatCurrency, formatDate, getInitials, cn } from "@/lib/utils";
import type { Appointment, AppointmentStatus, AppointmentCategory, Staff } from "@/lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const COLORS = ["#6366f1","#0891b2","#059669","#7c3aed","#db2777","#ea580c","#ca8a04","#64748b"];

const statusConfig: Record<AppointmentStatus, {
  label: string; variant: "success"|"default"|"secondary"|"destructive"|"warning"; icon: React.ElementType; dot: string
}> = {
  confirmed:  { label: "Confirmed",  variant: "success",     icon: CheckCircle2, dot: "bg-emerald-500" },
  scheduled:  { label: "Scheduled",  variant: "default",     icon: Clock,        dot: "bg-indigo-500"  },
  completed:  { label: "Completed",  variant: "secondary",   icon: CheckCircle2, dot: "bg-slate-400"   },
  cancelled:  { label: "Cancelled",  variant: "destructive", icon: XCircle,      dot: "bg-red-500"     },
  "no-show":  { label: "No Show",    variant: "warning",     icon: AlertCircle,  dot: "bg-amber-500"   },
};

const categoryOptions: { value: AppointmentCategory; label: string }[] = [
  { value: "consultation", label: "Consultation" },
  { value: "follow-up",    label: "Follow-up"    },
  { value: "treatment",    label: "Treatment"    },
  { value: "review",       label: "Review"       },
  { value: "other",        label: "Other"        },
];

type ClientOption = { id: string; name: string; email: string };

type AptForm = {
  clientId: string; staffId: string; title: string;
  category: AppointmentCategory; date: string;
  startTime: string; endTime: string; location: string;
  fee: string; notes: string; reminders: boolean; color: string;
};

const defaultAptForm: AptForm = {
  clientId: "", staffId: "", title: "",
  category: "consultation", date: "", startTime: "", endTime: "",
  location: "", fee: "", notes: "", reminders: false, color: "#6366f1",
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

function getAppointmentsForDate(appointments: Appointment[], date: Date) {
  return appointments.filter((a) => {
    const d = new Date(a.startTime);
    return d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate();
  });
}

function AptFormFields({
  form, setForm, clientOptions, staffList, clientsLoading,
}: {
  form: AptForm;
  setForm: React.Dispatch<React.SetStateAction<AptForm>>;
  clientOptions: ClientOption[];
  staffList: Staff[];
  clientsLoading: boolean;
}) {
  const activeStaff = staffList.filter((s) => s.isActive);
  return (
    <div className="space-y-5 py-2">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Appointment Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 col-span-2">
            <Label>Title</Label>
            <Input placeholder="e.g. Annual Health Consultation" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v as AppointmentCategory }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categoryOptions.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-1.5 pt-1 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c} type="button"
                  onClick={() => setForm((p) => ({ ...p, color: c }))}
                  className={cn("h-6 w-6 rounded-full border-2 transition-all", form.color === c ? "border-slate-800 scale-110" : "border-transparent")}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Client & Staff</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Client</Label>
            <Select value={form.clientId} onValueChange={(v) => setForm((p) => ({ ...p, clientId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder={clientsLoading ? "Loading..." : "Select client"} />
              </SelectTrigger>
              <SelectContent>
                {clientOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Staff Member</Label>
            <Select value={form.staffId} onValueChange={(v) => setForm((p) => ({ ...p, staffId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
              <SelectContent>
                {activeStaff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span>{s.name}</span>
                    {s.specialization && <span className="text-slate-400 ml-1 text-xs">· {s.specialization}</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Schedule</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 col-span-2">
            <Label>Date</Label>
            <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Start Time</Label>
            <Input type="time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>End Time</Label>
            <Input type="time" value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Additional</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input placeholder="e.g. Room 101" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Fee ($)</Label>
            <Input type="number" step="0.01" min="0" placeholder="0.00" value={form.fee} onChange={(e) => setForm((p) => ({ ...p, fee: e.target.value }))} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Notes</Label>
            <Textarea placeholder="Internal notes..." rows={2} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Switch id="reminders" checked={form.reminders} onCheckedChange={(v) => setForm((p) => ({ ...p, reminders: v }))} />
            <Label htmlFor="reminders" className="cursor-pointer">Send reminders</Label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const today = new Date();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"month" | "week" | "list">("month");
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [staffFilter, setStaffFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Client options (lazy loaded)
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);
  const [clientsLoaded, setClientsLoaded] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);

  // Create
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<AptForm>(defaultAptForm);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<AptForm>(defaultAptForm);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete
  const [showDeleteApt, setShowDeleteApt] = useState(false);
  const [aptDeleting, setAptDeleting] = useState(false);

  // Status action
  const [actionSaving, setActionSaving] = useState(false);

  // Edit target ID (set before opening edit dialog, after closing detail dialog)
  const [editTargetId, setEditTargetId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("appointments").select("*").order("start_time", { ascending: true }),
      supabase.from("staff").select("*"),
    ]).then(([{ data: apts }, { data: staff }]) => {
      if (apts) setAppointments(apts.map(mapAppointment));
      if (staff) setStaffList(staff.map(mapStaff));
      setLoading(false);
    });
  }, []);

  const loadClients = async () => {
    if (clientsLoaded) return;
    setClientsLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("clients").select("id, name, email").order("name");
    if (data) setClientOptions(data as ClientOption[]);
    setClientsLoaded(true);
    setClientsLoading(false);
  };

  const openCreateDialog = async () => {
    setCreateForm(defaultAptForm);
    setCreateError("");
    setShowCreate(true);
    await loadClients();
  };

  const openEditDialog = async (apt: Appointment) => {
    const d = new Date(apt.startTime);
    const dateStr = d.toISOString().slice(0, 10);
    const startStr = d.toTimeString().slice(0, 5);
    const endStr = new Date(apt.endTime).toTimeString().slice(0, 5);
    setEditForm({
      clientId: apt.clientId, staffId: apt.staffId,
      title: apt.title, category: apt.category,
      date: dateStr, startTime: startStr, endTime: endStr,
      location: apt.location ?? "", fee: apt.fee ? String(apt.fee) : "",
      notes: apt.notes ?? "", reminders: apt.reminders,
      color: apt.color ?? "#6366f1",
    });
    setEditError("");
    setShowEdit(true);
    setSelectedApt(null);
    await loadClients();
  };

  const buildTimestamps = (date: string, start: string, end: string) => ({
    start: new Date(`${date}T${start}:00`).toISOString(),
    end:   new Date(`${date}T${end}:00`).toISOString(),
  });

  const handleCreate = async () => {
    const client = clientOptions.find((c) => c.id === createForm.clientId);
    const staff = staffList.find((s) => s.id === createForm.staffId);
    if (!client || !staff || !createForm.title || !createForm.date || !createForm.startTime || !createForm.endTime) {
      setCreateError("Please fill in all required fields.");
      return;
    }
    setCreateSaving(true);
    setCreateError("");
    const supabase = createClient();
    const { start, end } = buildTimestamps(createForm.date, createForm.startTime, createForm.endTime);
    const { data, error: err } = await supabase
      .from("appointments")
      .insert({
        client_id: client.id, staff_id: staff.id,
        client_name: client.name, staff_name: staff.name,
        title: createForm.title, category: createForm.category,
        status: "scheduled", start_time: start, end_time: end,
        location: createForm.location || null,
        fee: createForm.fee ? parseFloat(createForm.fee) : null,
        notes: createForm.notes || null,
        reminders: createForm.reminders, color: createForm.color,
      })
      .select().single();
    setCreateSaving(false);
    if (err) { setCreateError(err.message); return; }
    if (data) setAppointments((prev) => [...prev, mapAppointment(data)].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    setShowCreate(false);
    setCreateForm(defaultAptForm);
  };

  const handleEdit = async () => {
    const client = clientOptions.find((c) => c.id === editForm.clientId);
    const staff = staffList.find((s) => s.id === editForm.staffId);
    if (!client || !staff || !editForm.title || !editForm.date || !editForm.startTime || !editForm.endTime) {
      setEditError("Please fill in all required fields.");
      return;
    }
    setEditSaving(true);
    setEditError("");
    const supabase = createClient();
    const { start, end } = buildTimestamps(editForm.date, editForm.startTime, editForm.endTime);
    const { data, error: err } = await supabase
      .from("appointments")
      .update({
        client_id: client.id, staff_id: staff.id,
        client_name: client.name, staff_name: staff.name,
        title: editForm.title, category: editForm.category,
        start_time: start, end_time: end,
        location: editForm.location || null,
        fee: editForm.fee ? parseFloat(editForm.fee) : null,
        notes: editForm.notes || null,
        reminders: editForm.reminders, color: editForm.color,
      })
      .eq("id", editTargetId!)
      .select().single();
    setEditSaving(false);
    if (err) { setEditError(err.message); return; }
    if (data) {
      const mapped = mapAppointment(data);
      setAppointments((prev) => prev.map((a) => a.id === editTargetId ? mapped : a));
    }
    setShowEdit(false);
    setEditTargetId(null);
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    setActionSaving(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("appointments").update({ status }).eq("id", id).select().single();
    setActionSaving(false);
    if (data) {
      const mapped = mapAppointment(data);
      setAppointments((prev) => prev.map((a) => a.id === id ? mapped : a));
      setSelectedApt(mapped);
    }
  };

  const handleDeleteApt = async () => {
    if (!selectedApt) return;
    setAptDeleting(true);
    const supabase = createClient();
    await supabase.from("appointments").delete().eq("id", selectedApt.id);
    setAptDeleting(false);
    setAppointments((prev) => prev.filter((a) => a.id !== selectedApt.id));
    setSelectedApt(null);
    setShowDeleteApt(false);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);

  const navigate = (dir: -1 | 1) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === "month") d.setMonth(d.getMonth() + dir);
      else d.setDate(d.getDate() + 7 * dir);
      return d;
    });
  };

  const filteredApts = appointments.filter((a) => {
    if (staffFilter !== "all" && a.staffId !== staffFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });

  const upcomingApts = [...appointments]
    .filter((a) => new Date(a.startTime) >= today && a.status !== "cancelled")
    .slice(0, 8);

  const weekMs = 7 * 86400000;

  const openEditFor = (apt: Appointment) => {
    setEditTargetId(apt.id);
    openEditDialog(apt);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="mt-1 text-sm text-slate-500">
            {appointments.filter((a) => a.status !== "cancelled").length} active appointments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 gap-0.5">
            {(["month", "week", "list"] as const).map((v) => (
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
          <Button size="sm" onClick={openCreateDialog}><Plus className="h-3.5 w-3.5" />New Appointment</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Today",      value: getAppointmentsForDate(appointments, today).length,  color: "text-indigo-600", bg: "bg-indigo-50"  },
          { label: "This Week",  value: appointments.filter((a) => { const d = new Date(a.startTime); return d >= today && d <= new Date(today.getTime() + weekMs); }).length, color: "text-violet-600", bg: "bg-violet-50"  },
          { label: "Confirmed",  value: appointments.filter((a) => a.status === "confirmed").length,  color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending",    value: appointments.filter((a) => a.status === "scheduled").length,  color: "text-amber-600",  bg: "bg-amber-50"  },
        ].map((stat) => (
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

      <div className="flex items-center gap-3 flex-wrap">
        <Select value={staffFilter} onValueChange={setStaffFilter}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="All Staff" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Staff</SelectItem>
            {staffList.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
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

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <Card>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                  <ChevronLeft className="h-4 w-4 text-slate-500" />
                </button>
                <h2 className="text-sm font-semibold text-slate-900">{MONTHS[month]} {year}</h2>
                <button onClick={() => navigate(1)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              {view === "month" && (
                <CardContent className="p-3">
                  <div className="grid grid-cols-7 mb-1">
                    {DAYS.map((d) => (
                      <div key={d} className="py-2 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
                    {days.map(({ date, currentMonth }, i) => {
                      const apts = getAppointmentsForDate(filteredApts, date);
                      const isToday = date.toDateString() === today.toDateString();
                      return (
                        <div key={i} className={cn("min-h-20 bg-white p-1.5 cursor-pointer hover:bg-indigo-50/30 transition-colors", !currentMonth && "bg-slate-50/60")}>
                          <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold mb-1 mx-auto", isToday ? "bg-indigo-600 text-white" : currentMonth ? "text-slate-700" : "text-slate-300")}>
                            {date.getDate()}
                          </div>
                          <div className="space-y-0.5">
                            {apts.slice(0, 3).map((apt) => (
                              <button
                                key={apt.id}
                                onClick={() => setSelectedApt(apt)}
                                className="w-full text-left rounded px-1 py-0.5 text-[10px] font-medium truncate transition-opacity hover:opacity-80"
                                style={{ backgroundColor: `${apt.color ?? "#6366f1"}20`, color: apt.color ?? "#6366f1" }}
                              >
                                {apt.clientName}
                              </button>
                            ))}
                            {apts.length > 3 && <p className="text-[10px] text-slate-400 px-1">+{apts.length - 3} more</p>}
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
                    {filteredApts.map((apt) => {
                      const status = statusConfig[apt.status as AppointmentStatus] ?? statusConfig.scheduled;
                      return (
                        <button
                          key={apt.id}
                          onClick={() => setSelectedApt(apt)}
                          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: apt.color ?? "#6366f1" }} />
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

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Upcoming</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {upcomingApts.slice(0, 6).map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => setSelectedApt(apt)}
                      className="w-full flex items-start gap-3 px-5 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors text-left"
                    >
                      <div className="h-2 w-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: apt.color ?? "#6366f1" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{apt.clientName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{apt.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(apt.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {new Date(apt.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                        </p>
                      </div>
                    </button>
                  ))}
                  {upcomingApts.length === 0 && <p className="px-5 py-4 text-xs text-slate-400">No upcoming appointments</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Categories</CardTitle></CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2">
                  {[
                    { label: "Consultation", color: "#4f46e5" },
                    { label: "Follow-up",    color: "#0891b2" },
                    { label: "Treatment",    color: "#059669" },
                    { label: "Review",       color: "#7c3aed" },
                    { label: "Other",        color: "#64748b" },
                  ].map((cat) => (
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
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedApt} onOpenChange={() => setSelectedApt(null)}>
        {selectedApt && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedApt.color ?? "#6366f1" }} />
                <DialogTitle>{selectedApt.title}</DialogTitle>
              </div>
              <DialogDescription className="sr-only">{selectedApt.title} details</DialogDescription>
              <Badge variant={(statusConfig[selectedApt.status as AppointmentStatus] ?? statusConfig.scheduled).variant} className="mt-1 w-fit">
                {(statusConfig[selectedApt.status as AppointmentStatus] ?? statusConfig.scheduled).label}
              </Badge>
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
                  <p className="text-sm font-medium text-slate-900">{formatDate(selectedApt.startTime, "long")}</p>
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
              {selectedApt.notes && (
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Notes</p>
                    <p className="text-sm text-slate-700">{selectedApt.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <DialogFooter className="flex-wrap gap-2">
              <Button
                variant="outline" size="sm"
                className="text-red-500 border-red-200 hover:bg-red-50 mr-auto"
                onClick={() => setShowDeleteApt(true)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
              <Button variant="outline" size="sm" onClick={() => openEditFor(selectedApt)}>
                <Edit className="h-3.5 w-3.5" /> Edit
              </Button>
              {selectedApt.status !== "completed" && selectedApt.status !== "cancelled" && (
                <>
                  <Button
                    variant="outline" size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    loading={actionSaving}
                    onClick={() => handleStatusChange(selectedApt.id, "cancelled")}
                  >
                    {!actionSaving && "Cancel"}
                  </Button>
                  <Button
                    variant="success" size="sm"
                    loading={actionSaving}
                    onClick={() => handleStatusChange(selectedApt.id, "confirmed")}
                  >
                    {!actionSaving && <><CheckCircle2 className="h-3.5 w-3.5" /> Confirm</>}
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedApt(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription className="sr-only">Create a new appointment</DialogDescription>
          </DialogHeader>
          <AptFormFields
            form={createForm} setForm={setCreateForm}
            clientOptions={clientOptions} staffList={staffList}
            clientsLoading={clientsLoading}
          />
          {createError && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{createError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={createSaving}>{!createSaving && "Create Appointment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription className="sr-only">Edit appointment details</DialogDescription>
          </DialogHeader>
          <AptFormFields
            form={editForm} setForm={setEditForm}
            clientOptions={clientOptions} staffList={staffList}
            clientsLoading={clientsLoading}
          />
          {editError && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{editError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleEdit} loading={editSaving}>{!editSaving && "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Appointment Dialog */}
      <Dialog open={showDeleteApt} onOpenChange={setShowDeleteApt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedApt?.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteApt(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteApt} loading={aptDeleting}>
              {!aptDeleting && "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
