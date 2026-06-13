import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Mail, Phone, MapPin, Building2, Calendar,
  DollarSign, Edit, Star, MessageSquare,
  PhoneCall, CreditCard, Clock, CheckCircle2, Tag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import { mapClient, mapClientActivity, mapAppointment } from "@/lib/supabase/mappers";
import { formatCurrency, formatDate, formatRelativeTime, getInitials } from "@/lib/utils";
import type { ClientStatus } from "@/lib/types";

const statusVariant: Record<ClientStatus, "success" | "default" | "secondary" | "destructive" | "vip"> = {
  active: "success", vip: "vip", prospect: "default", inactive: "secondary",
};

const activityIcons: Record<string, React.ElementType> = {
  appointment: Calendar,
  note: MessageSquare,
  email: Mail,
  call: PhoneCall,
  payment: CreditCard,
};

const activityColors: Record<string, string> = {
  appointment: "bg-indigo-100 text-indigo-600",
  note: "bg-amber-100 text-amber-600",
  email: "bg-sky-100 text-sky-600",
  call: "bg-emerald-100 text-emerald-600",
  payment: "bg-violet-100 text-violet-600",
};

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: rawClient }, { data: rawActivities }, { data: rawAppointments }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase.from("client_activities").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("appointments").select("*").eq("client_id", id).order("start_time", { ascending: false }),
  ]);

  if (!rawClient) notFound();

  const client = mapClient(rawClient);
  const activities = (rawActivities ?? []).map(mapClientActivity);
  const clientAppointments = (rawAppointments ?? []).map(mapAppointment);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="text-slate-500 -ml-2">
          <Link href="/clients"><ArrowLeft className="h-3.5 w-3.5" />Clients</Link>
        </Button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-700 font-medium">{client.name}</span>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarFallback className="text-lg">{getInitials(client.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">{client.name}</h1>
                  {client.company && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-sm text-slate-500">{client.company}</span>
                    </div>
                  )}
                </div>
                <Badge variant={statusVariant[client.status]} className="mt-1">
                  {client.status === "vip" && <Star className="h-3 w-3" />}
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-4">
                <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />{client.email}
                </a>
                <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />{client.phone}
                </a>
                {client.address && (
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {client.address.city}, {client.address.state}
                  </span>
                )}
              </div>
              {client.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {client.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs gap-1">
                      <Tag className="h-2.5 w-2.5" />{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" asChild>
                <Link href="/appointments"><Calendar className="h-3.5 w-3.5" />Book Appointment</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatCurrency(client.totalRevenue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Appointments", value: client.totalAppointments, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Member Since", value: formatDate(client.createdAt, "short"), icon: Clock, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Last Contact", value: client.lastContactAt ? formatRelativeTime(client.lastContactAt) : "—", icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg} shrink-0`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className="text-sm font-bold text-slate-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-5">
                {activities.length > 0 ? activities.map((activity) => {
                  const Icon = activityIcons[activity.type] ?? MessageSquare;
                  return (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${activityColors[activity.type] ?? "bg-slate-100 text-slate-600"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400">{activity.createdBy}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-400">{formatRelativeTime(activity.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-slate-400 text-center py-8">No activity recorded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardContent className="p-0">
              {clientAppointments.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {clientAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: apt.color ?? "#6366f1" }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{apt.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{apt.staffName} · {formatDate(apt.startTime, "long")}</p>
                      </div>
                      <Badge variant={apt.status === "completed" ? "secondary" : apt.status === "cancelled" ? "destructive" : "success"}>
                        {apt.status}
                      </Badge>
                      {apt.fee && <span className="text-sm font-semibold text-slate-900">{formatCurrency(apt.fee)}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">No appointments found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="p-6">
              {client.notes ? (
                <p className="text-sm text-slate-700 leading-relaxed">{client.notes}</p>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">No notes added yet.</p>
              )}
              <Separator className="my-4" />
              <Button variant="outline" size="sm"><MessageSquare className="h-3.5 w-3.5" />Add Note</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
