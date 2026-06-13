import type { Client, Staff, Appointment, ClientActivity, Notification, RevenueData } from "@/lib/types";
import type { DbClient, DbStaff, DbAppointment, DbClientActivity, DbNotification, DbRevenueData } from "./db-types";

export function mapClient(row: DbClient): Client {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company ?? undefined,
    status: row.status,
    avatar: row.avatar ?? undefined,
    address: row.address_street
      ? {
          street: row.address_street,
          city: row.address_city ?? "",
          state: row.address_state ?? "",
          zip: row.address_zip ?? "",
          country: row.address_country ?? "",
        }
      : undefined,
    notes: row.notes ?? undefined,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totalAppointments: row.total_appointments,
    totalRevenue: Number(row.total_revenue),
    lastContactAt: row.last_contact_at ?? undefined,
  };
}

export function mapStaff(row: DbStaff): Staff {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar: row.avatar ?? undefined,
    phone: row.phone ?? undefined,
    specialization: row.specialization ?? undefined,
    isActive: row.is_active,
    schedule: {
      workDays: row.work_days ?? [1, 2, 3, 4, 5],
      startTime: row.start_time,
      endTime: row.end_time,
    },
    totalAppointments: row.total_appointments,
    rating: Number(row.rating),
  };
}

export function mapAppointment(row: DbAppointment): Appointment {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    staffId: row.staff_id,
    staffName: row.staff_name,
    title: row.title,
    category: row.category as Appointment["category"],
    status: row.status as Appointment["status"],
    startTime: row.start_time,
    endTime: row.end_time,
    notes: row.notes ?? undefined,
    location: row.location ?? undefined,
    color: row.color ?? undefined,
    reminders: row.reminders,
    fee: row.fee ?? undefined,
  };
}

export function mapClientActivity(row: DbClientActivity): ClientActivity {
  return {
    id: row.id,
    clientId: row.client_id,
    type: row.type as ClientActivity["type"],
    title: row.title,
    description: row.description ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

export function mapNotification(row: DbNotification): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    isRead: row.is_read,
    href: row.href ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapRevenueData(row: DbRevenueData): RevenueData {
  return {
    month: row.month,
    revenue: Number(row.revenue),
    appointments: row.appointments,
  };
}
