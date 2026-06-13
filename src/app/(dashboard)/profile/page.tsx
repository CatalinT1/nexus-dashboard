"use client";
import React, { useState, useEffect } from "react";
import { Camera, Save, Mail, Phone, Building2, MapPin, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import type { DbProfile } from "@/lib/supabase/db-types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", department: "" });

  // password change
  const [pwForm, setPwForm] = useState({ newPassword: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwDone, setPwDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("profiles").select("*").eq("id", user.id).single<DbProfile>().then(({ data }) => {
        if (data) {
          setProfile(data);
          setForm({ name: data.name, phone: data.phone ?? "", department: data.department ?? "" });
        }
      });
    });
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase
      .from("profiles")
      .update({ name: form.name, phone: form.phone || null, department: form.department || null })
      .eq("id", profile.id);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) { setPwError("Passwords do not match."); return; }
    if (pwForm.newPassword.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    setPwSaving(true);
    setPwError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password: pwForm.newPassword });
    setPwSaving(false);
    if (err) { setPwError(err.message); return; }
    setPwDone(true);
    setPwForm({ newPassword: "", confirm: "" });
    setTimeout(() => setPwDone(false), 3000);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your personal information and preferences</p>
        </div>
        <Button onClick={handleSave} variant={saved ? "success" : "default"} size="sm" loading={saving}>
          {!saving && <Save className="h-3.5 w-3.5" />}
          {!saving && (saved ? "Saved!" : "Save Changes")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">{getInitials(profile?.name ?? "U")}</AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{profile?.name ?? "Loading..."}</h2>
              <p className="text-sm text-slate-500">{profile?.email ?? ""}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="vip" className="gap-1">
                  <Shield className="h-3 w-3" />{profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Staff"}
                </Badge>
                <Badge variant={profile?.is_active ? "success" : "secondary"}>
                  {profile?.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Personal Information</CardTitle>
              <CardDescription>Update your name and contact details</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={set("name")} />
              </div>
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Input type="email" value={profile?.email ?? ""} disabled leftIcon={<Mail className="h-3.5 w-3.5" />} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input value={form.phone} onChange={set("phone")} leftIcon={<Phone className="h-3.5 w-3.5" />} />
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input value={form.department} onChange={set("department")} leftIcon={<Building2 className="h-3.5 w-3.5" />} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Date Format</Label>
                <Select defaultValue="mdy">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Time Format</Label>
                <Select defaultValue="12h">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Change Password</CardTitle>
              <CardDescription>Set a new password for your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="Repeat new password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                />
              </div>
              {pwError && <p className="text-xs text-red-500">{pwError}</p>}
              {pwDone && <p className="text-xs text-emerald-600 font-medium">Password updated successfully!</p>}
              <Button variant="outline" size="sm" onClick={handleChangePassword} loading={pwSaving}>
                {!pwSaving && "Change Password"}
              </Button>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-1">Active Sessions</h4>
                <p className="text-xs text-slate-500 mb-3">You are logged in on these devices</p>
                <div className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Current session</p>
                    <p className="text-xs text-slate-500">Browser · Now</p>
                  </div>
                  <Badge variant="success" className="text-[10px]">Current</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Activity</CardTitle>
              <CardDescription>Your recent actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Logged in", detail: "Browser session", time: "Just now" },
                  { action: "Profile viewed", detail: "My Profile page", time: "Now" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.action}</p>
                      <p className="text-xs text-slate-500">{item.detail}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{item.time}</span>
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
