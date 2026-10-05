-- ==========================================
-- NEXUSSPACE SEED DATA FOR SUPABASE CLOUD DB
-- ==========================================
-- Run this script in your Supabase SQL Editor to populate sample projects, tasks, and files!

-- 1. SEED PROFILES (Admin & Member Profile)
INSERT INTO public.profiles (id, full_name, avatar_url, role, bio, website)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Workspace Admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300', 'Admin', 'Super Administrator managing NexusSpace platform projects.', 'https://nexusspace.io'),
  ('b0000000-0000-0000-0000-000000000002', 'Alex Rivera', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', 'Lead', 'Senior Full-Stack Architect & Product Designer.', 'https://alexrivera.dev')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED 10 SAMPLE PROJECTS
INSERT INTO public.projects (id, user_id, title, description, category, status, priority, cover_url, is_public)
VALUES
  ('c0000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000001', 'AI Predictive Analytics Dashboard', 'Enterprise analytics platform featuring real-time telemetry, machine learning predictions, and automated client reporting modules.', 'AI / Data', 'In Progress', 'High', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800', true),
  ('c0000000-0000-0000-0000-000000000102', 'a0000000-0000-0000-0000-000000000001', 'EcoShop Mobile Shopping App', 'Cross-platform mobile application focusing on sustainable brands, carbon offset tracking, and instant checkout.', 'Mobile App', 'Completed', 'Medium', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800', true),
  ('c0000000-0000-0000-0000-000000000103', 'a0000000-0000-0000-0000-000000000001', 'Glassmorphism React Design System', 'A comprehensive modern React UI kit designed with subtle backdrops, rich micro-animations, and full accessibility support.', 'Design', 'Planning', 'Urgent', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800', true),
  ('c0000000-0000-0000-0000-000000000104', 'a0000000-0000-0000-0000-000000000001', 'Cloud Infrastructure Monitoring API', 'High-throughput microservices monitoring system with automated anomaly detection and instant Slack alerting.', 'Web Dev', 'In Progress', 'High', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800', true),
  ('c0000000-0000-0000-0000-000000000105', 'a0000000-0000-0000-0000-000000000001', 'SaaS Subscription & Billing Engine', 'Stripe integrated subscription engine with tiered pricing, multi-currency support, and usage-based metering.', 'Web Dev', 'Completed', 'Urgent', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800', true),
  ('c0000000-0000-0000-0000-000000000106', 'a0000000-0000-0000-0000-000000000001', 'Global Marketing Strategy Portal', 'Centralized marketing asset repository, campaign schedule tracker, and ROI analytics platform.', 'Marketing', 'On Hold', 'Low', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800', true),
  ('c0000000-0000-0000-0000-000000000107', 'a0000000-0000-0000-0000-000000000001', 'Cybersecurity Compliance Auditor', 'Automated vulnerability scanner checking SOC2, HIPAA, and ISO27001 compliance standards across repositories.', 'AI / Data', 'In Progress', 'Urgent', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800', true),
  ('c0000000-0000-0000-0000-000000000108', 'a0000000-0000-0000-0000-000000000001', 'Fitness & Nutrition Health Tracker', 'Personalized AI wellness assistant providing meal recommendations, workout plans, and biometric sync.', 'Mobile App', 'Planning', 'Medium', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800', true),
  ('c0000000-0000-0000-0000-000000000109', 'a0000000-0000-0000-0000-000000000001', '3D Interactive Product Catalog', 'Web-based WebGL product customizer enabling customers to view 3D models with texture modification.', 'Design', 'Completed', 'High', 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800', true),
  ('c0000000-0000-0000-0000-000000000110', 'a0000000-0000-0000-0000-000000000001', 'Real-Time Team Collaboration Suite', 'Integrated voice, video chat, canvas whiteboard, and markdown workspace for remote product teams.', 'Web Dev', 'In Progress', 'High', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800', true)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED TASKS
INSERT INTO public.tasks (id, project_id, user_id, title, is_completed, priority, due_date)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000001', 'Configure Supabase Auth & Row Level Security Policies', true, 'High', '2026-10-10'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000001', 'Connect telemetry analytics endpoint', false, 'Medium', '2026-10-15'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000102', 'a0000000-0000-0000-0000-000000000001', 'Implement carbon offset calculator algorithm', true, 'High', '2026-10-01')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED PROJECT FILES
INSERT INTO public.project_files (id, project_id, user_id, file_name, file_url, file_size, file_type)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000001', 'Architecture-Specification.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 1428570, 'application/pdf'),
  ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000001', 'Analytics-Wireframe.png', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800', 2450120, 'image/png')
ON CONFLICT (id) DO NOTHING;
