"use client";
import React, { useState } from "react";
import { Camera, Save, Mail, Phone, Building2, MapPin, Calendar, Shield } from "lucide-react";
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

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your personal information and preferences</p>
        </div>
        <Button onClick={handleSave} variant={saved ? "success" : "default"} size="sm">
          <Save className="h-3.5 w-3.5" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Profile card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">AW</AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Admin User</h2>
              <p className="text-sm text-slate-500">admin@nexus.com</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="vip" className="gap-1">
                  <Shield className="h-3 w-3" />Administrator
                </Badge>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <CardDescription>Update your name, contact details, and location</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>First Name</Label>
                <Input defaultValue="Admin" />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input defaultValue="User" />
              </div>
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Input type="email" defaultValue="admin@nexus.com" leftIcon={<Mail className="h-3.5 w-3.5" />} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input defaultValue="+1 (555) 000-0001" leftIcon={<Phone className="h-3.5 w-3.5" />} />
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input defaultValue="Administration" leftIcon={<Building2 className="h-3.5 w-3.5" />} />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input defaultValue="San Francisco, CA" leftIcon={<MapPin className="h-3.5 w-3.5" />} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Bio</Label>
                <Textarea defaultValue="Platform administrator responsible for managing clients, appointments, and staff operations." rows={3} />
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
              <CardTitle className="text-sm">Security Settings</CardTitle>
              <CardDescription>Manage your password and account security</CardDescription>
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
              <Button variant="outline" size="sm">Change Password</Button>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-1">Active Sessions</h4>
                <p className="text-xs text-slate-500 mb-3">You are logged in on these devices</p>
                {[
                  { device: "Chrome on Windows", location: "San Francisco, CA", current: true, time: "Now" },
                  { device: "Safari on iPhone", location: "San Francisco, CA", current: false, time: "2 hours ago" },
                ].map((session, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{session.device}</p>
                      <p className="text-xs text-slate-500">{session.location} · {session.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.current && <Badge variant="success" className="text-[10px]">Current</Badge>}
                      {!session.current && <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600">Revoke</Button>}
                    </div>
                  </div>
                ))}
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
                  { action: "Logged in", detail: "Chrome on Windows · San Francisco, CA", time: "Just now" },
                  { action: "Updated client profile", detail: "Sarah Johnson", time: "2 hours ago" },
                  { action: "Created appointment", detail: "Emma Rodriguez · Consultation", time: "Yesterday" },
                  { action: "Exported client data", detail: "CSV export · 8 records", time: "2 days ago" },
                  { action: "Changed password", detail: "Security update", time: "1 week ago" },
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
