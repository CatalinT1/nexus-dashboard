"use client";
import React, { useState, useEffect } from "react";
import { UserPlus, ShieldCheck, Users, UserCheck, MoreHorizontal, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getInitials, formatDate } from "@/lib/utils";
import type { DbProfile } from "@/lib/supabase/db-types";
import type { UserRole } from "@/lib/types";

const roleVariant: Record<UserRole, "vip" | "default" | "secondary"> = {
  admin:   "vip",
  manager: "default",
  staff:   "secondary",
};

export default function UsersPage() {
  const [profiles, setProfiles] = useState<DbProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Invite dialog
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "staff" as UserRole });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  // Inline role/status updating
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("profiles").select("*").order("joined_at", { ascending: true }),
      supabase.auth.getUser(),
    ]).then(([{ data }, { data: { user } }]) => {
      if (data) setProfiles(data as DbProfile[]);
      if (user) setCurrentUserId(user.id);
      setLoading(false);
    });
  }, []);

  const updateProfile = async (targetId: string, updates: { role?: UserRole; is_active?: boolean }) => {
    setUpdatingId(targetId);
    const res = await fetch("/api/admin/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId, ...updates }),
    });
    const json = await res.json();
    setUpdatingId(null);
    if (json.profile) {
      setProfiles((prev) => prev.map((p) => p.id === targetId ? json.profile as DbProfile : p));
    }
  };

  const handleInvite = async () => {
    if (!inviteForm.email) { setInviteError("Email is required."); return; }
    setInviting(true);
    setInviteError("");
    setInviteSuccess("");
    const res = await fetch("/api/admin/invite-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inviteForm),
    });
    const json = await res.json();
    setInviting(false);
    if (json.error) { setInviteError(json.error); return; }
    setInviteSuccess(`Invite sent to ${inviteForm.email}. They'll appear here once they accept.`);
    setInviteForm({ name: "", email: "", role: "staff" });
  };

  const totalActive = profiles.filter((p) => p.is_active).length;
  const totalAdmins = profiles.filter((p) => p.role === "admin").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-slate-500">{profiles.length} team members · {totalActive} active</p>
        </div>
        <Button size="sm" onClick={() => { setShowInvite(true); setInviteError(""); setInviteSuccess(""); }}>
          <UserPlus className="h-3.5 w-3.5" />Invite User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Users",   value: profiles.length,  icon: Users,       color: "text-indigo-600",  bg: "bg-indigo-50"  },
          { label: "Active",        value: totalActive,       icon: UserCheck,   color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Admins",        value: totalAdmins,       icon: ShieldCheck, color: "text-violet-600",  bg: "bg-violet-50"  },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg} shrink-0`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-lg font-bold text-slate-900">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden xl:table-cell">Joined</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.map((profile) => {
                  const isCurrentUser = profile.id === currentUserId;
                  const isUpdating = updatingId === profile.id;
                  return (
                    <tr key={profile.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs">{getInitials(profile.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900">
                              {profile.name}
                              {isCurrentUser && (
                                <span className="ml-1.5 text-[10px] text-slate-400">(you)</span>
                              )}
                            </p>
                            {profile.department && (
                              <p className="text-xs text-slate-400">{profile.department}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="h-3 w-3 text-slate-400 shrink-0" />{profile.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isCurrentUser ? (
                          <Badge variant={roleVariant[profile.role as UserRole]}>
                            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                          </Badge>
                        ) : (
                          <Select
                            value={profile.role}
                            onValueChange={(v) => updateProfile(profile.id, { role: v as UserRole })}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="h-7 w-28 text-xs border-transparent hover:border-slate-200 focus:border-indigo-300 transition-colors">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Badge variant={profile.is_active ? "success" : "secondary"}>
                          {profile.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-xs text-slate-500">{formatDate(profile.joined_at, "short")}</span>
                      </td>
                      <td className="px-4 py-3">
                        {!isCurrentUser && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              {profile.is_active ? (
                                <DropdownMenuItem
                                  onClick={() => updateProfile(profile.id, { is_active: false })}
                                  disabled={isUpdating}
                                >
                                  Deactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => updateProfile(profile.id, { is_active: true })}
                                  disabled={isUpdating}
                                >
                                  Activate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              They&apos;ll receive an email with a link to set up their account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                placeholder="Jane Smith"
                value={inviteForm.name}
                onChange={(e) => setInviteForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="jane@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={inviteForm.role} onValueChange={(v) => setInviteForm((p) => ({ ...p, role: v as UserRole }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin — full access</SelectItem>
                  <SelectItem value="manager">Manager — manage clients, staff & appointments</SelectItem>
                  <SelectItem value="staff">Staff — view only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {inviteError && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{inviteError}</p>}
            {inviteSuccess && <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{inviteSuccess}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button onClick={handleInvite} loading={inviting}>
              {!inviting && <><UserPlus className="h-3.5 w-3.5" />Send Invite</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
