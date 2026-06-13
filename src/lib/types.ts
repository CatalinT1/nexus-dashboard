export type UserRole = "admin" | "manager" | "staff";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  joinedAt: string;
  isActive: boolean;
}

export type ClientStatus = "active" | "inactive" | "prospect" | "vip";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: ClientStatus;
  avatar?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  totalAppointments: number;
  totalRevenue: number;
  lastContactAt?: string;
}

export interface ClientActivity {
  id: string;
  clientId: string;
  type: "appointment" | "note" | "email" | "call" | "payment";
  title: string;
  description?: string;
  createdAt: string;
  createdBy: string;
}

export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
export type AppointmentCategory = "consultation" | "follow-up" | "treatment" | "review" | "other";

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  staffId: string;
  staffName: string;
  title: string;
  category: AppointmentCategory;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  notes?: string;
  location?: string;
  color?: string;
  reminders: boolean;
  fee?: number;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  specialization?: string;
  isActive: boolean;
  schedule: {
    workDays: number[];
    startTime: string;
    endTime: string;
  };
  totalAppointments: number;
  rating: number;
}

export interface KPIMetric {
  id: string;
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  trend: "up" | "down" | "neutral";
  prefix?: string;
  suffix?: string;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  href?: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  appointments: number;
}
