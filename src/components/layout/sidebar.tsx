"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Calendar, UserCog, BarChart3,
  Settings, ChevronLeft, ChevronRight, LogOut, Zap,
  Bell, HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/clients", icon: Users, label: "Clients", badge: "128" },
  { href: "/appointments", icon: Calendar, label: "Appointments", badge: "4" },
  { href: "/staff", icon: UserCog, label: "Staff" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
];

const bottomNavItems = [
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/help", icon: HelpCircle, label: "Help & Support" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex flex-col h-full bg-[#0f172a] transition-all duration-300 ease-in-out select-none",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-white/5",
          collapsed && "justify-center px-0"
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
            <Zap className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-sm font-bold text-white tracking-tight">Nexus</span>
              <span className="block text-[10px] text-slate-500 leading-none mt-0.5">Pro Dashboard</span>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors"
        >
          {collapsed
            ? <ChevronRight className="h-3 w-3 text-slate-500" />
            : <ChevronLeft className="h-3 w-3 text-slate-500" />}
        </button>

        {/* Main nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Main Menu
            </p>
          )}
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <NavItem
                key={item.href}
                item={item}
                active={active}
                collapsed={collapsed}
              />
            );
          })}
        </nav>

        {/* Bottom nav */}
        <div className="px-2 pb-2 space-y-0.5 border-t border-white/5 pt-2">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <NavItem
                key={item.href}
                item={item}
                active={active}
                collapsed={collapsed}
              />
            );
          })}
        </div>

        {/* User profile */}
        <div className={cn(
          "flex items-center gap-3 border-t border-white/5 p-3",
          collapsed && "justify-center"
        )}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs">AW</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@nexus.com</p>
            </div>
          )}
          {!collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors">
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

function NavItem({
  item,
  active,
  collapsed,
}: {
  item: { href: string; icon: React.ElementType; label: string; badge?: string };
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  const content = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
        active
          ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 pl-[10px]"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent pl-[10px]",
        collapsed && "justify-center px-0 py-2 border-l-0 pl-0"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-indigo-400" : "text-slate-500")} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate font-medium">{item.label}</span>
          {item.badge && (
            <span className={cn(
              "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
              active ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-700 text-slate-300"
            )}>
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.badge && <Badge variant="secondary" className="h-4 text-[10px] px-1">{item.badge}</Badge>}
        </TooltipContent>
      </Tooltip>
    );
  }
  return content;
}
