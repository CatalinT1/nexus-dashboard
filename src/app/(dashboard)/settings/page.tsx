"use client";
import React, { useState, useEffect } from "react";
import { Save, Building2, Bell, Shield, Palette, Globe, CreditCard, Key, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { getOrgId } from "@/lib/supabase/get-org-id";
import { useTheme } from "next-themes";

type NotificationPrefs = {
  emailAppt: boolean; emailReminder: boolean; emailPayment: boolean;
  pushAppt: boolean;  pushReminder: boolean;  pushPayment: boolean;
};

const DEFAULT_NOTIF: NotificationPrefs = {
  emailAppt: true, emailReminder: true, emailPayment: false,
  pushAppt: true,  pushReminder: false, pushPayment: true,
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState("");
  const [userId, setUserId]       = useState<string | null>(null);

  const [orgForm, setOrgForm] = useState({
    businessName: "", businessEmail: "", businessPhone: "",
    businessWebsite: "", description: "",
  });
  const [timezone, setTimezone]       = useState("utc");
  const [notifications, setNotifications] = useState<NotificationPrefs>(DEFAULT_NOTIF);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const orgId = await getOrgId().catch(() => null);
      if (!orgId) { setLoading(false); return; }

      const [{ data: profile }, { data: orgSettings }] = await Promise.all([
        supabase.from("profiles").select("notification_prefs, timezone").eq("id", user.id).single(),
        supabase.from("org_settings").select("*").eq("organization_id", orgId).single(),
      ]);

      if (profile?.notification_prefs) {
        setNotifications({ ...DEFAULT_NOTIF, ...(profile.notification_prefs as Partial<NotificationPrefs>) });
      }
      if (profile?.timezone) setTimezone(profile.timezone as string);
      if (orgSettings) {
        const s = orgSettings as Record<string, string>;
        setOrgForm({
          businessName:    s.business_name    ?? "",
          businessEmail:   s.business_email   ?? "",
          businessPhone:   s.business_phone   ?? "",
          businessWebsite: s.business_website ?? "",
          description:     s.description      ?? "",
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setSaveError("");
    try {
      const supabase = createClient();
      const orgId = await getOrgId();
      const [{ error: orgErr }, { error: profileErr }] = await Promise.all([
        supabase.from("org_settings").upsert(
          {
            organization_id: orgId,
            business_name:    orgForm.businessName,
            business_email:   orgForm.businessEmail,
            business_phone:   orgForm.businessPhone,
            business_website: orgForm.businessWebsite,
            description:      orgForm.description,
            updated_at:       new Date().toISOString(),
          },
          { onConflict: "organization_id" }
        ),
        supabase.from("profiles").update({
          notification_prefs: notifications,
          timezone,
        }).eq("id", userId),
      ]);

      if (orgErr || profileErr) {
        setSaveError((orgErr ?? profileErr)?.message ?? "Failed to save");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof orgForm) => ({
    value: orgForm[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setOrgForm((p) => ({ ...p, [key]: e.target.value })),
  });

  const notifSwitch = (key: keyof NotificationPrefs) => ({
    checked: notifications[key],
    onCheckedChange: (v: boolean) => setNotifications((p) => ({ ...p, [key]: v })),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your workspace preferences</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={handleSave}
            variant={saved ? "success" : "default"}
            size="sm"
            disabled={saving || loading}
          >
            {saving
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</>
              : <><Save className="h-3.5 w-3.5" />{saved ? "Saved!" : "Save Changes"}</>}
          </Button>
          {saveError && <p className="text-[11px] text-red-600 max-w-xs text-right">{saveError}</p>}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto sm:inline-grid sm:grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-indigo-500" />Business Profile
                </CardTitle>
                <CardDescription>Update your business information</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Business Name</Label>
                  <Input {...field("businessName")} placeholder="e.g. Nexus Clinic" />
                </div>
                <div className="space-y-1.5">
                  <Label>Business Email</Label>
                  <Input type="email" {...field("businessEmail")} placeholder="contact@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input {...field("businessPhone")} placeholder="+1 (555) 000-1234" />
                </div>
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input {...field("businessWebsite")} placeholder="https://example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time (ET)</SelectItem>
                      <SelectItem value="cst">Central Time (CT)</SelectItem>
                      <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                      <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Business Description</Label>
                  <Textarea {...field("description")} rows={3} placeholder="Describe your business…" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Palette className="h-4 w-4 text-indigo-500" />Appearance
                </CardTitle>
                <CardDescription>Customize the look of your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Dark Mode</p>
                    <p className="text-xs text-slate-500">Switch between light and dark themes</p>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Compact Sidebar</p>
                    <p className="text-xs text-slate-500">Show icons only in the navigation</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div>
                  <Label className="mb-2 block">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-48">
                      <Globe className="h-3.5 w-3.5 mr-2 text-slate-400" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (US)</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4 text-indigo-500" />Email Notifications
                </CardTitle>
                <CardDescription>Choose which emails you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {([
                  { key: "emailAppt",     label: "New Appointment",        desc: "When a new appointment is booked" },
                  { key: "emailReminder", label: "Appointment Reminders",  desc: "24 hours before scheduled appointments" },
                  { key: "emailPayment",  label: "Payment Notifications",  desc: "When payments are received or failed" },
                ] as const).map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <Switch {...notifSwitch(item.key)} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4 text-violet-500" />Push Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {([
                  { key: "pushAppt",     label: "New Appointment", desc: "Browser push for new bookings" },
                  { key: "pushReminder", label: "Reminders",       desc: "30 minutes before appointments" },
                  { key: "pushPayment",  label: "Payments",        desc: "Instant payment notifications" },
                ] as const).map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <Switch {...notifSwitch(item.key)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Key className="h-4 w-4 text-indigo-500" />Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm New Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button variant="outline" size="sm">Update Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-indigo-500" />Two-Factor Authentication
                </CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">2FA Status</p>
                    <p className="text-xs text-slate-500">Protect your account with authenticator app</p>
                  </div>
                  <Badge variant="secondary">Not enabled</Badge>
                </div>
                <Button variant="outline" size="sm" className="mt-4">Enable 2FA</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-indigo-500" />Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-slate-900">Professional</p>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">$99/month · Billed annually</p>
                    <p className="text-xs text-slate-400 mt-1">Next billing date: July 12, 2026</p>
                  </div>
                  <Button variant="outline" size="sm">Upgrade</Button>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                  {[
                    { label: "Staff members", used: 4, limit: 10 },
                    { label: "Clients", used: 10, limit: 500 },
                    { label: "Storage", used: 0, limit: 50, unit: "GB" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-sm font-bold text-slate-900">
                        {item.used}{item.unit ?? ""} <span className="text-slate-400 font-normal">/ {item.limit}{item.unit ?? ""}</span>
                      </p>
                      <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.max(2, (item.used / item.limit) * 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
