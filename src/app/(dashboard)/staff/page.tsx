"use client";
import React, { useState } from "react";
import { Plus, Star, Calendar, Users, Mail, Phone, MoreHorizontal, Edit, UserX, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockStaff } from "@/lib/data/mock-data";
import { getInitials } from "@/lib/utils";
import type { Staff } from "@/lib/types";

const DAYS_MAP = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const roleColors: Record<string, string> = {
  admin: "bg-violet-50 text-violet-700 border-violet-200",
  manager: "bg-indigo-50 text-indigo-700 border-indigo-200",
  staff: "bg-slate-50 text-slate-700 border-slate-200",
};

function StaffCard({ staff }: { staff: Staff }) {
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
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem className="flex items-center gap-2"><Edit className="h-3.5 w-3.5" />Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-50">
                <UserX className="h-3.5 w-3.5" />{staff.isActive ? "Deactivate" : "Activate"}
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
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
          <p className="mt-1 text-sm text-slate-500">{mockStaff.filter(s => s.isActive).length} active of {mockStaff.length} staff members</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-3.5 w-3.5" />Add Staff Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: mockStaff.length, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Active", value: mockStaff.filter(s => s.isActive).length, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Appointments", value: mockStaff.reduce((s, m) => s + m.totalAppointments, 0), color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Avg. Rating", value: (mockStaff.reduce((s, m) => s + m.rating, 0) / mockStaff.length).toFixed(1), color: "text-amber-600", bg: "bg-amber-50" },
        ].map(stat => (
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

      {/* Staff grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockStaff.map(s => <StaffCard key={s.id} staff={s} />)}
      </div>

      {/* Add staff dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Full Name</Label>
                <Input placeholder="Dr. Jane Smith" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="j.smith@clinic.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select defaultValue="staff">
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
                <Input placeholder="e.g. Primary Care" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => setShowAdd(false)}>Add Staff Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
