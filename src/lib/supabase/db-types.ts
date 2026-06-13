export type DbProfile = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  avatar: string | null;
  phone: string | null;
  department: string | null;
  joined_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DbClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  status: "active" | "inactive" | "prospect" | "vip";
  avatar: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  address_country: string | null;
  notes: string | null;
  tags: string[];
  total_appointments: number;
  total_revenue: number;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DbStaff = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  avatar: string | null;
  phone: string | null;
  specialization: string | null;
  is_active: boolean;
  work_days: number[];
  start_time: string;
  end_time: string;
  total_appointments: number;
  rating: number;
  created_at: string;
  updated_at: string;
};

export type DbAppointment = {
  id: string;
  client_id: string;
  client_name: string;
  staff_id: string;
  staff_name: string;
  title: string;
  category: string;
  status: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  location: string | null;
  color: string | null;
  reminders: boolean;
  fee: number | null;
  created_at: string;
  updated_at: string;
};

export type DbClientActivity = {
  id: string;
  client_id: string;
  type: string;
  title: string;
  description: string | null;
  created_at: string;
  created_by: string;
};

export type DbNotification = {
  id: string;
  user_id: string | null;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  is_read: boolean;
  href: string | null;
  created_at: string;
};

export type DbRevenueData = {
  id: string;
  month: string;
  month_order: number;
  year: number;
  revenue: number;
  appointments: number;
};
