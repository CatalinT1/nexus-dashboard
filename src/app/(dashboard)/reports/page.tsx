import React from "react";
import { createClient } from "@/lib/supabase/server";
import { mapClient, mapStaff, mapRevenueData } from "@/lib/supabase/mappers";
import { ReportCharts } from "./report-charts";

export default async function ReportsPage() {
  const supabase = await createClient();

  const [
    { data: rawRevenue },
    { data: rawClients },
    { data: rawStaff },
    { count: activeClients },
  ] = await Promise.all([
    supabase.from("revenue_data").select("*").order("month_order", { ascending: true }),
    supabase.from("clients").select("*").order("total_revenue", { ascending: false }).limit(5),
    supabase.from("staff").select("*").order("total_appointments", { ascending: false }),
    supabase.from("clients").select("*", { count: "exact", head: true }).neq("status", "inactive"),
  ]);

  const revenueData = (rawRevenue ?? []).map(mapRevenueData);
  const topClients = (rawClients ?? []).map(mapClient);
  const topStaff = (rawStaff ?? []).map(mapStaff);
  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalAppointments = revenueData.reduce((s, d) => s + d.appointments, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Business performance overview</p>
      </div>
      <ReportCharts
        revenueData={revenueData}
        topClients={topClients}
        topStaff={topStaff}
        totalRevenue={totalRevenue}
        totalAppointments={totalAppointments}
        activeClients={activeClients ?? 0}
      />
    </div>
  );
}
