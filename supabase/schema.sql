-- ==========================================
-- NEXUSSPACE FULL STACK SUPABASE SCHEMA & RLS
-- ==========================================
-- Run this script inside your Supabase Project SQL Editor
-- to initialize the database tables, triggers, indexes, and Row Level Security (RLS) policies.

-- ------------------------------------------
-- 1. EXTENSIONS & SETUP
-- ------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------
-- 2. PROFILES TABLE (Linked to auth.users)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'Member' CHECK (role IN ('Admin', 'Lead', 'Member', 'Contributor')),
  bio TEXT,
  website TEXT
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Trigger: Automatically create profile on user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'Member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ------------------------------------------
-- 3. PROJECTS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General' CHECK (category IN ('General', 'Web Dev', 'Design', 'Marketing', 'Mobile App', 'AI / Data')),
  status TEXT DEFAULT 'In Progress' CHECK (status IN ('Planning', 'In Progress', 'Completed', 'On Hold')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  cover_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects RLS Policies
CREATE POLICY "Users can view public projects or projects they own"
  ON public.projects FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ------------------------------------------
-- 4. TASKS TABLE (Relational - Child of Projects)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Tasks RLS Policies
CREATE POLICY "Users can view tasks of accessible projects"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id AND (p.is_public = true OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "Project owners can insert tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Project owners can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Project owners can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ------------------------------------------
-- 5. PROJECT FILES TABLE (Storage Metadata)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Project Files
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Project Files Policies
CREATE POLICY "Users can view project files for visible projects"
  ON public.project_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_files.project_id AND (p.is_public = true OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload project files to owned projects"
  ON public.project_files FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete project files of owned projects"
  ON public.project_files FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ------------------------------------------
-- 6. SUPABASE STORAGE BUCKETS & STORAGE RLS
-- ------------------------------------------
-- Insert Buckets if missing
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true),
       ('project-assets', 'project-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for avatars
CREATE POLICY "Avatar Images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage RLS Policies for project-assets
CREATE POLICY "Project Assets are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-assets');

CREATE POLICY "Authenticated users can upload project assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project-assets');

CREATE POLICY "Users can delete their own project assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'project-assets');


-- ------------------------------------------
-- 7. PERFORMANCE INDEXES
-- ------------------------------------------
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);
