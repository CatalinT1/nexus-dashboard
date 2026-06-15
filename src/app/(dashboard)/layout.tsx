import React from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/server";
import type { DbProfile } from "@/lib/supabase/db-types";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email, role, avatar")
    .eq("id", user.id)
    .single<Pick<DbProfile, "name" | "email" | "role" | "avatar">>();

  const headerUser = {
    name: profile?.name ?? user.email?.split("@")[0] ?? "User",
    email: profile?.email ?? user.email ?? "",
    role: profile?.role ?? "staff",
    avatar: profile?.avatar ?? undefined,
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar user={headerUser} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header user={headerUser} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
