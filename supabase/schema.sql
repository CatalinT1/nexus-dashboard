-- ============================================================
-- Nexus Dashboard — Supabase Schema
-- Run this in Supabase SQL Editor FIRST, before seed.sql
-- ============================================================

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'prospect', 'vip');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show');
CREATE TYPE appointment_category AS ENUM ('consultation', 'follow-up', 'treatment', 'review', 'other');
CREATE TYPE activity_type AS ENUM ('appointment', 'note', 'email', 'call', 'payment');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');

-- ============================================================
-- profiles (synced with auth.users)
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  role        user_role NOT NULL DEFAULT 'staff',
  avatar      TEXT,
  phone       TEXT,
  department  TEXT,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read profiles"
  ON profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ============================================================
-- clients
-- ============================================================
CREATE TABLE clients (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  email              TEXT NOT NULL,
  phone              TEXT NOT NULL DEFAULT '',
  company            TEXT,
  status             client_status NOT NULL DEFAULT 'active',
  avatar             TEXT,
  address_street     TEXT,
  address_city       TEXT,
  address_state      TEXT,
  address_zip        TEXT,
  address_country    TEXT,
  notes              TEXT,
  tags               TEXT[] NOT NULL DEFAULT '{}',
  total_appointments INTEGER NOT NULL DEFAULT 0,
  total_revenue      NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_contact_at    TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read clients"
  ON clients FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admin/manager can insert clients"
  ON clients FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );
CREATE POLICY "Admin/manager can update clients"
  ON clients FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- ============================================================
-- staff
-- ============================================================
CREATE TABLE staff (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  email              TEXT NOT NULL,
  role               user_role NOT NULL DEFAULT 'staff',
  avatar             TEXT,
  phone              TEXT,
  specialization     TEXT,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  work_days          INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}',
  start_time         TEXT NOT NULL DEFAULT '09:00',
  end_time           TEXT NOT NULL DEFAULT '17:00',
  total_appointments INTEGER NOT NULL DEFAULT 0,
  rating             NUMERIC(3,1) NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read staff"
  ON staff FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admin/manager can manage staff"
  ON staff FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- ============================================================
-- appointments
-- ============================================================
CREATE TABLE appointments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  staff_id     UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
  client_name  TEXT NOT NULL,
  staff_name   TEXT NOT NULL,
  title        TEXT NOT NULL,
  category     appointment_category NOT NULL DEFAULT 'consultation',
  status       appointment_status NOT NULL DEFAULT 'scheduled',
  start_time   TIMESTAMPTZ NOT NULL,
  end_time     TIMESTAMPTZ NOT NULL,
  notes        TEXT,
  location     TEXT,
  color        TEXT,
  reminders    BOOLEAN NOT NULL DEFAULT FALSE,
  fee          NUMERIC(10,2),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read appointments"
  ON appointments FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admin/manager can manage appointments"
  ON appointments FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- ============================================================
-- client_activities
-- ============================================================
CREATE TABLE client_activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type        activity_type NOT NULL DEFAULT 'note',
  title       TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by  TEXT NOT NULL DEFAULT ''
);
ALTER TABLE client_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read activities"
  ON client_activities FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated users can insert activities"
  ON client_activities FOR INSERT TO authenticated WITH CHECK (TRUE);

-- ============================================================
-- notifications
-- ============================================================
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type       notification_type NOT NULL DEFAULT 'info',
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  href       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own or global notifications"
  ON notifications FOR SELECT TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Admin can insert notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- revenue_data
-- ============================================================
CREATE TABLE revenue_data (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month        TEXT NOT NULL,
  month_order  INTEGER NOT NULL,
  year         INTEGER NOT NULL,
  revenue      NUMERIC(12,2) NOT NULL DEFAULT 0,
  appointments INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE revenue_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read revenue data"
  ON revenue_data FOR SELECT TO authenticated USING (TRUE);

-- ============================================================
-- Auto-create profile on sign-up
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
