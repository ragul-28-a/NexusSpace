-- ==========================================
-- NEXUSSPACE COMPLETE SEED DATA FOR ALL TABLES
-- ==========================================

-- 1. POPULATE PROFILES TABLE
INSERT INTO public.profiles (id, full_name, email, avatar_url, role, bio, website)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Workspace Admin', 'admin@nexusspace.io', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300', 'Admin', 'Super Administrator managing platform projects.', 'https://nexusspace.io'),
  ('00000000-0000-0000-0000-000000000002', 'Alex Rivera', 'alex.dev@nexusspace.io', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', 'Lead', 'Senior Product Engineer & UI Designer.', 'https://alexrivera.dev')
ON CONFLICT (id) DO NOTHING;

-- 2. POPULATE TASKS TABLE
INSERT INTO public.tasks (id, project_id, user_id, title, is_completed, priority, due_date)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Configure Supabase Auth & Row Level Security Policies', true, 'High', '2026-10-10'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Connect telemetry analytics endpoint', false, 'Medium', '2026-10-15'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Implement carbon offset calculator algorithm', true, 'High', '2026-10-01')
ON CONFLICT (id) DO NOTHING;

-- 3. POPULATE PROJECT FILES TABLE
INSERT INTO public.project_files (id, project_id, user_id, file_name, file_url, file_size, file_type)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Architecture-Specification.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 1428570, 'application/pdf'),
  ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Analytics-Wireframe.png', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800', 2450120, 'image/png')
ON CONFLICT (id) DO NOTHING;
