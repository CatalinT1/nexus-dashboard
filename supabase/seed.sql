-- ============================================================
-- Nexus Dashboard — Seed Data
-- Run this AFTER schema.sql
-- ============================================================

-- ============================================================
-- Staff (4 members)
-- ============================================================
INSERT INTO staff (id, name, email, role, phone, specialization, is_active, work_days, start_time, end_time, total_appointments, rating) VALUES
  ('aa000001-0000-0000-0000-000000000001', 'Dr. Michael Chen',    'mchen@nexus.com',      'admin',   '+1 (415) 555-0101', 'Internal Medicine',  TRUE,  '{1,2,3,4,5}', '08:00', '17:00', 48, 4.9),
  ('aa000001-0000-0000-0000-000000000002', 'Dr. Sarah Rodriguez', 'srodriguez@nexus.com', 'manager', '+1 (415) 555-0102', 'Family Medicine',    TRUE,  '{1,2,3,4,5}', '09:00', '18:00', 62, 4.8),
  ('aa000001-0000-0000-0000-000000000003', 'James Wilson',        'jwilson@nexus.com',    'staff',   '+1 (415) 555-0103', 'Physical Therapy',   TRUE,  '{1,2,3,4}',   '07:00', '15:00', 35, 4.7),
  ('aa000001-0000-0000-0000-000000000004', 'Dr. Aisha Patel',     'apatel@nexus.com',     'staff',   '+1 (415) 555-0104', 'Dermatology',        FALSE, '{2,3,4,5}',   '10:00', '18:00', 29, 4.6);

-- ============================================================
-- Clients (8 clients)
-- ============================================================
INSERT INTO clients (id, name, email, phone, company, status, address_street, address_city, address_state, address_zip, address_country, notes, tags, total_appointments, total_revenue, last_contact_at) VALUES
  ('c1000001-0000-0000-0000-000000000001', 'Sarah Johnson',   'sarah.johnson@email.com',    '+1 (555) 234-5678', 'Johnson Consulting',  'vip',      '123 Main St',     'San Francisco', 'CA', '94102', 'US', 'Premium client, prefers morning appointments.', '{"premium","corporate","referral"}', 12, 8400.00,  NOW() - INTERVAL '2 days'),
  ('c1000001-0000-0000-0000-000000000002', 'Michael Torres',  'michael.torres@company.com', '+1 (555) 345-6789', 'Torres & Associates', 'active',   '456 Market St',   'San Francisco', 'CA', '94103', 'US', 'Monthly check-up schedule.',                   '{"monthly","corporate"}',           8,  3200.00,  NOW() - INTERVAL '5 days'),
  ('c1000001-0000-0000-0000-000000000003', 'Emma Rodriguez',  'emma.r@gmail.com',           '+1 (555) 456-7890', NULL,                  'active',   '789 Valencia St', 'Oakland',       'CA', '94601', 'US', NULL,                                           '{"referral"}',                      5,  2100.00,  NOW() - INTERVAL '10 days'),
  ('c1000001-0000-0000-0000-000000000004', 'David Kim',       'dkim@techcorp.io',           '+1 (555) 567-8901', 'TechCorp IO',         'active',   '321 Howard St',   'San Jose',      'CA', '95110', 'US', 'Prefers Dr. Chen.',                            '{"corporate","enterprise"}',        6,  2800.00,  NOW() - INTERVAL '3 days'),
  ('c1000001-0000-0000-0000-000000000005', 'Lisa Chen',       'lisa.chen@startup.co',       '+1 (555) 678-9012', 'StartupCo',           'prospect', '654 Mission St',  'San Francisco', 'CA', '94105', 'US', 'Interested in long-term plan.',                '{"startup","prospect"}',            1,  350.00,   NOW() - INTERVAL '1 day'),
  ('c1000001-0000-0000-0000-000000000006', 'Robert Martinez', 'r.martinez@gmail.com',       '+1 (555) 789-0123', NULL,                  'inactive', NULL,              NULL,            NULL, NULL,    NULL, 'Moved out of area.',                           '{}',                                3,  1200.00,  NOW() - INTERVAL '60 days'),
  ('c1000001-0000-0000-0000-000000000007', 'Jennifer Park',   'jpark@mediagroup.com',       '+1 (555) 890-1234', 'Park Media Group',    'vip',      '987 Embarcadero', 'San Francisco', 'CA', '94111', 'US', 'VIP — priority scheduling.',                   '{"vip","premium","creative"}',      15, 12500.00, NOW() - INTERVAL '1 day'),
  ('c1000001-0000-0000-0000-000000000008', 'Alex Thompson',   'alex.t@personal.net',        '+1 (555) 901-2345', NULL,                  'active',   '111 Castro St',   'San Francisco', 'CA', '94114', 'US', NULL,                                           '{"personal"}',                      4,  1600.00,  NOW() - INTERVAL '7 days');

-- ============================================================
-- Appointments (10 appointments relative to today)
-- ============================================================
INSERT INTO appointments (id, client_id, staff_id, client_name, staff_name, title, category, status, start_time, end_time, notes, location, color, reminders, fee) VALUES
  ('a1000001-0000-0000-0000-000000000001', 'c1000001-0000-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000001', 'Sarah Johnson',   'Dr. Michael Chen',    'Annual Health Consultation', 'consultation', 'confirmed', NOW() + INTERVAL '1 day 9 hours',           NOW() + INTERVAL '1 day 10 hours',                      'Annual review',      'Room 101', '#4f46e5', TRUE,  350.00),
  ('a1000001-0000-0000-0000-000000000002', 'c1000001-0000-0000-0000-000000000002', 'aa000001-0000-0000-0000-000000000002', 'Michael Torres',  'Dr. Sarah Rodriguez', 'Monthly Follow-up',          'follow-up',    'scheduled', NOW() + INTERVAL '1 day 14 hours',          NOW() + INTERVAL '1 day 15 hours',                      NULL,                 'Room 203', '#0891b2', TRUE,  280.00),
  ('a1000001-0000-0000-0000-000000000003', 'c1000001-0000-0000-0000-000000000007', 'aa000001-0000-0000-0000-000000000001', 'Jennifer Park',   'Dr. Michael Chen',    'VIP Treatment Session',      'treatment',    'confirmed', NOW() + INTERVAL '2 days 10 hours',         NOW() + INTERVAL '2 days 11 hours 30 minutes',          'Priority session',   'Suite A',  '#7c3aed', TRUE,  750.00),
  ('a1000001-0000-0000-0000-000000000004', 'c1000001-0000-0000-0000-000000000003', 'aa000001-0000-0000-0000-000000000002', 'Emma Rodriguez',  'Dr. Sarah Rodriguez', 'Routine Check-up',           'follow-up',    'scheduled', NOW() + INTERVAL '3 days 9 hours',          NOW() + INTERVAL '3 days 9 hours 45 minutes',           NULL,                 'Room 102', '#059669', FALSE, 200.00),
  ('a1000001-0000-0000-0000-000000000005', 'c1000001-0000-0000-0000-000000000004', 'aa000001-0000-0000-0000-000000000003', 'David Kim',       'James Wilson',        'Physical Therapy Session',   'treatment',    'confirmed', NOW() + INTERVAL '3 days 11 hours',         NOW() + INTERVAL '3 days 12 hours',                     'Session 4 of 8',     'PT Room',  '#0891b2', TRUE,  180.00),
  ('a1000001-0000-0000-0000-000000000006', 'c1000001-0000-0000-0000-000000000005', 'aa000001-0000-0000-0000-000000000002', 'Lisa Chen',       'Dr. Sarah Rodriguez', 'Initial Consultation',       'consultation', 'scheduled', NOW() + INTERVAL '4 days 13 hours',         NOW() + INTERVAL '4 days 14 hours',                     'New patient eval',   'Room 201', '#4f46e5', TRUE,  350.00),
  ('a1000001-0000-0000-0000-000000000007', 'c1000001-0000-0000-0000-000000000008', 'aa000001-0000-0000-0000-000000000001', 'Alex Thompson',   'Dr. Michael Chen',    'Lab Results Review',         'review',       'scheduled', NOW() + INTERVAL '5 days 10 hours',         NOW() + INTERVAL '5 days 10 hours 30 minutes',          NULL,                 'Room 101', '#7c3aed', FALSE, 150.00),
  ('a1000001-0000-0000-0000-000000000008', 'c1000001-0000-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000002', 'Sarah Johnson',   'Dr. Sarah Rodriguez', 'Specialist Referral Review', 'review',       'completed', NOW() - INTERVAL '2 days 10 hours',         NOW() - INTERVAL '2 days 9 hours',                      'Completed successfully', 'Room 203', '#059669', TRUE, 400.00),
  ('a1000001-0000-0000-0000-000000000009', 'c1000001-0000-0000-0000-000000000002', 'aa000001-0000-0000-0000-000000000001', 'Michael Torres',  'Dr. Michael Chen',    'Blood Panel Follow-up',      'follow-up',    'completed', NOW() - INTERVAL '5 days 9 hours',          NOW() - INTERVAL '5 days 8 hours 30 minutes',           NULL,                 'Room 101', '#4f46e5', FALSE, 280.00),
  ('a1000001-0000-0000-0000-000000000010', 'c1000001-0000-0000-0000-000000000006', 'aa000001-0000-0000-0000-000000000003', 'Robert Martinez', 'James Wilson',        'Physical Assessment',        'consultation', 'cancelled', NOW() - INTERVAL '10 days 14 hours',        NOW() - INTERVAL '10 days 13 hours',                    'Client cancelled',   'PT Room',  '#0891b2', FALSE, NULL);

-- ============================================================
-- Client Activities (5 entries)
-- ============================================================
INSERT INTO client_activities (id, client_id, type, title, description, created_at, created_by) VALUES
  ('ac000001-0000-0000-0000-000000000001', 'c1000001-0000-0000-0000-000000000001', 'appointment', 'Annual consultation booked',  'Booked for next week',      NOW() - INTERVAL '1 day',   'Dr. Michael Chen'),
  ('ac000001-0000-0000-0000-000000000002', 'c1000001-0000-0000-0000-000000000007', 'payment',     'Payment received — $750.00', 'VIP session fee collected', NOW() - INTERVAL '2 hours',  'System'),
  ('ac000001-0000-0000-0000-000000000003', 'c1000001-0000-0000-0000-000000000003', 'note',        'Client requested PM slots',  'Prefers afternoon',         NOW() - INTERVAL '3 days',   'Dr. Sarah Rodriguez'),
  ('ac000001-0000-0000-0000-000000000004', 'c1000001-0000-0000-0000-000000000004', 'call',        'Reminder call placed',       NULL,                        NOW() - INTERVAL '4 days',   'James Wilson'),
  ('ac000001-0000-0000-0000-000000000005', 'c1000001-0000-0000-0000-000000000002', 'email',       'Lab results sent via email', 'PDF attached',              NOW() - INTERVAL '5 days',   'Dr. Michael Chen');

-- ============================================================
-- Notifications (5 global notifications)
-- ============================================================
INSERT INTO notifications (id, user_id, type, title, message, is_read, href, created_at) VALUES
  ('ab000001-0000-0000-0000-000000000001', NULL, 'success', 'New client registered', 'Lisa Chen has joined as a prospect.',             FALSE, '/clients/c1000001-0000-0000-0000-000000000005', NOW() - INTERVAL '30 minutes'),
  ('ab000001-0000-0000-0000-000000000002', NULL, 'info',    'Appointment confirmed', 'Sarah Johnson confirmed her annual consultation.', FALSE, '/appointments',                                 NOW() - INTERVAL '2 hours'),
  ('ab000001-0000-0000-0000-000000000003', NULL, 'warning', 'Payment overdue',       'Invoice #2024-089 for $280.00 is overdue.',        TRUE,  '/clients',                                      NOW() - INTERVAL '1 day'),
  ('ab000001-0000-0000-0000-000000000004', NULL, 'info',    'Staff schedule updated','James Wilson updated availability for next week.', TRUE,  '/staff',                                        NOW() - INTERVAL '2 days'),
  ('ab000001-0000-0000-0000-000000000005', NULL, 'success', 'Monthly report ready',  'June 2026 performance report is available.',       TRUE,  '/reports',                                      NOW() - INTERVAL '3 days');

-- ============================================================
-- Revenue Data (12 months of 2026)
-- ============================================================
INSERT INTO revenue_data (id, month, month_order, year, revenue, appointments) VALUES
  ('ed000001-0000-0000-0000-000000000001', 'Jan', 1,  2026, 18500.00, 42),
  ('ed000001-0000-0000-0000-000000000002', 'Feb', 2,  2026, 21200.00, 48),
  ('ed000001-0000-0000-0000-000000000003', 'Mar', 3,  2026, 19800.00, 45),
  ('ed000001-0000-0000-0000-000000000004', 'Apr', 4,  2026, 24300.00, 55),
  ('ed000001-0000-0000-0000-000000000005', 'May', 5,  2026, 22100.00, 50),
  ('ed000001-0000-0000-0000-000000000006', 'Jun', 6,  2026, 26800.00, 62),
  ('ed000001-0000-0000-0000-000000000007', 'Jul', 7,  2026, 23500.00, 53),
  ('ed000001-0000-0000-0000-000000000008', 'Aug', 8,  2026, 28100.00, 64),
  ('ed000001-0000-0000-0000-000000000009', 'Sep', 9,  2026, 25600.00, 58),
  ('ed000001-0000-0000-0000-000000000010', 'Oct', 10, 2026, 30200.00, 68),
  ('ed000001-0000-0000-0000-000000000011', 'Nov', 11, 2026, 27900.00, 63),
  ('ed000001-0000-0000-0000-000000000012', 'Dec', 12, 2026, 32400.00, 72);
