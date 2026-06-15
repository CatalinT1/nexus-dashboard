"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Building2, Mail, Phone, MapPin, Tag, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { getOrgId } from "@/lib/supabase/get-org-id";

const tagOptions = ["corporate", "premium", "referral", "monthly", "startup", "creative", "enterprise", "personal"];

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", status: "active",
    street: "", city: "", state: "", zip: "", notes: "",
  });

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const orgId = await getOrgId().catch(() => null);
    if (!orgId) { setError("Could not determine organization. Please reload."); setLoading(false); return; }
    const { error: err } = await supabase.from("clients").insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company || null,
      status: form.status,
      address_street: form.street || null,
      address_city: form.city || null,
      address_state: form.state || null,
      address_zip: form.zip || null,
      address_country: null,
      notes: form.notes || null,
      tags: selectedTags,
      total_appointments: 0,
      total_revenue: 0,
      organization_id: orgId,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push("/clients");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Button variant="ghost" size="sm" asChild className="text-slate-500 -ml-2 mb-3">
          <Link href="/clients"><ArrowLeft className="h-3.5 w-3.5" />Back to Clients</Link>
        </Button>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Client</h1>
        <p className="mt-1 text-sm text-slate-500">Fill in the details to create a new client profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-indigo-500" />Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Full Name <span className="text-red-500">*</span></Label>
              <Input placeholder="Sarah Johnson" value={form.name} onChange={set("name")} required leftIcon={<User className="h-3.5 w-3.5" />} />
            </div>
            <div className="space-y-1.5">
              <Label>Email Address <span className="text-red-500">*</span></Label>
              <Input type="email" placeholder="client@email.com" value={form.email} onChange={set("email")} required leftIcon={<Mail className="h-3.5 w-3.5" />} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number</Label>
              <Input type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set("phone")} leftIcon={<Phone className="h-3.5 w-3.5" />} />
            </div>
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input placeholder="Company name" value={form.company} onChange={set("company")} leftIcon={<Building2 className="h-3.5 w-3.5" />} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((prev) => ({ ...prev, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-indigo-500" />Address (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Street Address</Label>
              <Input placeholder="123 Main Street" value={form.street} onChange={set("street")} />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input placeholder="San Francisco" value={form.city} onChange={set("city")} />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Input placeholder="CA" value={form.state} onChange={set("state")} />
            </div>
            <div className="space-y-1.5">
              <Label>ZIP Code</Label>
              <Input placeholder="94102" value={form.zip} onChange={set("zip")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-indigo-500" />Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-indigo-500" />Notes (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Add any notes about this client..." value={form.notes} onChange={set("notes")} rows={4} />
          </CardContent>
        </Card>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3 pb-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/clients">Cancel</Link>
          </Button>
          <Button type="submit" loading={loading}>
            {!loading && "Create Client"}
          </Button>
        </div>
      </form>
    </div>
  );
}
