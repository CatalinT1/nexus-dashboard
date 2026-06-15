"use client";
import React, { useState, useEffect } from "react";
import { Plus, Star, Mail, Phone, MoreHorizontal, UserX, UserCheck, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { getOrgId } from "@/lib/supabase/get-org-id";
import { mapStaff } from "@/lib/supabase/mappers";
import { getInitials, cn } from "@/lib/utils";
import type { Staff, UserRole } from "@/lib/types";

const DAYS_MAP = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const roleColors: Record<string, string> = {
  admin: "bg-violet-50 text-violet-700 border-violet-200",
  manager: "bg-indigo-50 text-indigo-700 border-indigo-200",
  staff: "bg-slate-50 text-slate-700 border-slate-200",
};

type EditForm = {
  name: string; email: string; phone: string; role: UserRole;
  specialization: string; workDays: number[]; startTime: string; endTime: string;
};

const defaultEditForm: EditForm = {
  name: "", email: "", phone: "", role: "staff",
  specialization: "", workDays: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00",
};

function StaffCard({
  staff, onEdit, onDelete, onToggleActive, toggling,
}: {
  staff: Staff;
  onEdit: (s: Staff) => void;
  onDelete: (s: Staff) => void;
  onToggleActive: (s: Staff) => void;
  toggling: boolean;
}) {
  return (
    <Card className="hover:shadow-md transition-all group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="text-sm">{getInitials(staff.name)}</AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${staff.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{staff.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{staff.specialization}</p>
              <span className={`inline-flex items-center mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium border ${roleColors[staff.role]}`}>
                {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="flex items-center gap-2" onClick={() => onEdit(staff)}>
                <Edit className="h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => onToggleActive(staff)}
                disabled={toggling}
              >
                {staff.isActive
                  ? <><UserX className="h-3.5 w-3.5" /> Deactivate</>
                  : <><UserCheck className="h-3.5 w-3.5" /> Activate</>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-50"
                onClick={() => onDelete(staff)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">{staff.email}</span>
          </div>
          {staff.phone && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Phone className="h-3 w-3 text-slate-400 shrink-0" />{staff.phone}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-sm font-bold text-slate-900">{staff.totalAppointments}</p>
              <p className="text-[10px] text-slate-400">Appts</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 flex items-center justify-center gap-0.5">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />{staff.rating}
              </p>
              <p className="text-[10px] text-slate-400">Rating</p>
            </div>
            <div>
              <div className="flex justify-center gap-0.5">
                {DAYS_MAP.map((d, i) => (
                  <div
                    key={d}
                    className={`h-1.5 w-1.5 rounded-full ${staff.schedule.workDays.includes(i) ? "bg-indigo-500" : "bg-slate-200"}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Schedule</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Add dialog
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "staff", specialization: "" });

  // Edit dialog
  const [showEdit, setShowEdit] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editTarget, setEditTarget] = useState<Staff | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(defaultEditForm);

  // Delete dialog
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.from("staff").select("*").then(({ data }) => {
      if (data) setStaffList(data.map(mapStaff));
      setLoading(false);
    });
  }, []);

  const handleAdd = async () => {
    setSaving(true);
    setError("");
    const supabase = createClient();
    const orgId = await getOrgId().catch(() => null);
    if (!orgId) { setError("Could not determine organization."); setSaving(false); return; }
    const { data, error: err } = await supabase
      .from("staff")
      .insert({
        name: form.name, email: form.email,
        phone: form.phone || null, role: form.role,
        specialization: form.specialization || null,
        is_active: true, work_days: [1, 2, 3, 4, 5],
        start_time: "09:00", end_time: "17:00",
        total_appointments: 0, rating: 0,
        organization_id: orgId,
      })
      .select().single();
    setSaving(false);
    if (err) { setError(err.message); return; }
    if (data) setStaffList((prev) => [...prev, mapStaff(data)]);
    setShowAdd(false);
    setForm({ name: "", email: "", phone: "", role: "staff", specialization: "" });
  };

  const openEdit = (staff: Staff) => {
    setEditTarget(staff);
    setEditForm({
      name: staff.name, email: staff.email,
      phone: staff.phone ?? "", role: staff.role,
      specialization: staff.specialization ?? "",
      workDays: [...staff.schedule.workDays],
      startTime: staff.schedule.startTime,
      endTime: staff.schedule.endTime,
    });
    setEditError("");
    setShowEdit(true);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditSaving(true);
    setEditError("");
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("staff")
      .update({
        name: editForm.name, email: editForm.email,
        phone: editForm.phone || null, role: editForm.role,
        specialization: editForm.specialization || null,
        work_days: editForm.workDays,
        start_time: editForm.startTime,
        end_time: editForm.endTime,
      })
      .eq("id", editTarget.id)
      .select().single();
    setEditSaving(false);
    if (err) { setEditError(err.message); return; }
    if (data) setStaffList((prev) => prev.map((s) => s.id === editTarget.id ? mapStaff(data) : s));
    setShowEdit(false);
    setEditTarget(null);
  };

  const handleToggleActive = async (staff: Staff) => {
    setTogglingId(staff.id);
    const supabase = createClient();
    const { data } = await supabase
      .from("staff")
      .update({ is_active: !staff.isActive })
      .eq("id", staff.id)
      .select().single();
    if (data) setStaffList((prev) => prev.map((s) => s.id === staff.id ? mapStaff(data) : s));
    setTogglingId(null);
  };

  const openDelete = (staff: Staff) => {
    setDeleteTarget(staff);
    setDeleteError("");
    setShowDelete(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    const supabase = createClient();
    const { error: err } = await supabase.from("staff").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    if (err) { setDeleteError(err.message); return; }
    setStaffList((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    setShowDelete(false);
    setDeleteTarget(null);
  };

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleWorkDay = (day: number) =>
    setEditForm((p) => ({
      ...p,
      workDays: p.workDays.includes(day)
        ? p.workDays.filter((d) => d !== day)
        : [...p.workDays, day].sort((a, b) => a - b),
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            {staffList.filter((s) => s.isActive).length} active of {staffList.length} staff members
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-3.5 w-3.5" />Add Staff Member
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: staffList.length, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Active", value: staffList.filter((s) => s.isActive).length, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Appointments", value: staffList.reduce((s, m) => s + m.totalAppointments, 0), color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Avg. Rating", value: staffList.length ? (staffList.reduce((s, m) => s + m.rating, 0) / staffList.length).toFixed(1) : "—", color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg} shrink-0`}>
                <span className={`text-base font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <p className="text-xs font-medium text-slate-600">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {staffList.map((s) => (
            <StaffCard
              key={s.id}
              staff={s}
              onEdit={openEdit}
              onDelete={openDelete}
              onToggleActive={handleToggleActive}
              toggling={togglingId === s.id}
            />
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription className="sr-only">Add a new staff member</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Full Name</Label>
                <Input placeholder="Dr. Jane Smith" value={form.name} onChange={setField("name")} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="j.smith@clinic.com" value={form.email} onChange={setField("email")} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={setField("phone")} />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Specialization</Label>
                <Input placeholder="e.g. Primary Care" value={form.specialization} onChange={setField("specialization")} />
              </div>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} loading={saving}>{!saving && "Add Staff Member"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription className="sr-only">Edit {editTarget?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Full Name</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={editForm.role} onValueChange={(v) => setEditForm((p) => ({ ...p, role: v as UserRole }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Specialization</Label>
                <Input value={editForm.specialization} onChange={(e) => setEditForm((p) => ({ ...p, specialization: e.target.value }))} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Work Days</Label>
                <div className="flex gap-1.5">
                  {DAYS_MAP.map((d, i) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleWorkDay(i)}
                      className={cn(
                        "h-8 w-10 rounded-md text-xs font-medium border transition-all",
                        editForm.workDays.includes(i)
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Input type="time" value={editForm.startTime} onChange={(e) => setEditForm((p) => ({ ...p, startTime: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>End Time</Label>
                <Input type="time" value={editForm.endTime} onChange={(e) => setEditForm((p) => ({ ...p, endTime: e.target.value }))} />
              </div>
            </div>
            {editError && <p className="text-xs text-red-500">{editError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleEdit} loading={editSaving}>{!editSaving && "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{deleteError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={deleting}
            >
              {!deleting && "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
