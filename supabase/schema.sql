-- NexusSpace Supabase schema and ownership policies.
-- Existing data is not deleted by this script.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'Member' CHECK (role IN ('Admin', 'Lead', 'Member', 'Contributor')),
  bio TEXT,
  website TEXT
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General' CHECK (category IN ('General', 'Web Dev', 'Design', 'Marketing', 'Mobile App', 'AI / Data')),
  status TEXT DEFAULT 'In Progress' CHECK (status IN ('Planning', 'In Progress', 'Completed', 'On Hold')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  cover_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ALTER COLUMN is_public SET DEFAULT false;

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NOT VALID avoids blocking schema setup on pre-existing orphan records. New
-- writes are still checked; validate these constraints after approved cleanup.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey' AND conrelid = 'public.profiles'::regclass) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_user_id_fkey' AND conrelid = 'public.projects'::regclass) THEN
    ALTER TABLE public.projects ADD CONSTRAINT projects_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_user_id_fkey' AND conrelid = 'public.tasks'::regclass) THEN
    ALTER TABLE public.tasks ADD CONSTRAINT tasks_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_files_user_id_fkey' AND conrelid = 'public.project_files'::regclass) THEN
    ALTER TABLE public.project_files ADD CONSTRAINT project_files_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'Admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(COALESCE(NEW.email, ''), '@', 1)),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
    'Member'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile or admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update editable profile fields" ON public.profiles;
CREATE POLICY "Users can view their own profile or admins can view all"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()) AND role = 'Member');
CREATE POLICY "Users can update editable profile fields"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE UPDATE (role) ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, email, avatar_url, bio, website, updated_at)
  ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users can view public projects or projects they own" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can view public projects and admins can view all" ON public.projects;
CREATE POLICY "Project owners can view public projects and admins can view all"
  ON public.projects FOR SELECT TO authenticated
  USING (is_public OR user_id = (SELECT auth.uid()) OR public.is_admin());
CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view tasks of accessible projects" ON public.tasks;
DROP POLICY IF EXISTS "Project owners can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Project owners can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Project owners can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Owners and admins can view tasks" ON public.tasks;
CREATE POLICY "Owners and admins can view tasks"
  ON public.tasks FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR (
      user_id = (SELECT auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = tasks.project_id AND p.user_id = (SELECT auth.uid())
      )
    )
  );
CREATE POLICY "Project owners can insert tasks"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id AND p.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "Project owners can update tasks"
  ON public.tasks FOR UPDATE TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id AND p.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id AND p.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "Project owners can delete tasks"
  ON public.tasks FOR DELETE TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id AND p.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view project files for visible projects" ON public.project_files;
DROP POLICY IF EXISTS "Users can upload project files to owned projects" ON public.project_files;
DROP POLICY IF EXISTS "Users can delete project files of owned projects" ON public.project_files;
DROP POLICY IF EXISTS "Owners and admins can view project files" ON public.project_files;
DROP POLICY IF EXISTS "Owners can upload project files" ON public.project_files;
DROP POLICY IF EXISTS "Owners can delete project files" ON public.project_files;
CREATE POLICY "Owners and admins can view project files"
  ON public.project_files FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR (
      user_id = (SELECT auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_files.project_id AND p.user_id = (SELECT auth.uid())
      )
    )
  );
CREATE POLICY "Owners can upload project files"
  ON public.project_files FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_files.project_id AND p.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "Owners can delete project files"
  ON public.project_files FOR DELETE TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_files.project_id AND p.user_id = (SELECT auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_user_id ON public.project_files(user_id);

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('project-covers', 'project-covers', true),
  ('project-assets', 'project-assets', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Avatar Images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Project Assets are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload project assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own avatar objects" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar objects" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar objects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar objects" ON storage.objects;
DROP POLICY IF EXISTS "Project covers are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own project covers" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own project covers" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own project covers" ON storage.objects;
DROP POLICY IF EXISTS "Project owners can read private attachments" ON storage.objects;
DROP POLICY IF EXISTS "Project members can read legacy cover images" ON storage.objects;
DROP POLICY IF EXISTS "Project owners can upload private attachments" ON storage.objects;
DROP POLICY IF EXISTS "Project owners can update private attachments" ON storage.objects;
DROP POLICY IF EXISTS "Project owners can delete private attachments" ON storage.objects;

CREATE POLICY "Users can view own avatar objects"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar objects"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
CREATE POLICY "Users can update own avatar objects"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
CREATE POLICY "Users can delete own avatar objects"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

CREATE POLICY "Project covers are publicly viewable"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'project-covers');
CREATE POLICY "Users can upload own project covers"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-covers' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
CREATE POLICY "Users can update own project covers"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'project-covers' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text)
  WITH CHECK (bucket_id = 'project-covers' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
CREATE POLICY "Users can delete own project covers"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'project-covers' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

CREATE POLICY "Project owners can read private attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-assets'
    AND (
      public.is_admin()
      OR (
        (storage.foldername(name))[1] = 'attachments'
        AND EXISTS (
          SELECT 1 FROM public.projects p
          WHERE p.id::text = (storage.foldername(name))[2]
            AND p.user_id = (SELECT auth.uid())
        )
      )
      OR (
        (storage.foldername(name))[1] = 'project-covers'
        AND EXISTS (
          SELECT 1 FROM public.projects p
          WHERE (
            p.cover_url = name
            OR substring(p.cover_url from '/storage/v1/object/public/project-assets/(.*)') = name
          )
          AND (p.is_public OR p.user_id = (SELECT auth.uid()))
        )
      )
      OR EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id::text = (storage.foldername(name))[2]
          AND p.user_id = (SELECT auth.uid())
      )
    )
  );
CREATE POLICY "Project owners can upload private attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-assets'
    AND (storage.foldername(name))[3] = (SELECT auth.uid())::text
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[2]
        AND p.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "Project owners can update private attachments"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'project-assets'
    AND (storage.foldername(name))[3] = (SELECT auth.uid())::text
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[2]
        AND p.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    bucket_id = 'project-assets'
    AND (storage.foldername(name))[3] = (SELECT auth.uid())::text
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[2]
        AND p.user_id = (SELECT auth.uid())
    )
  );
CREATE POLICY "Project owners can delete private attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'project-assets'
    AND (storage.foldername(name))[3] = (SELECT auth.uid())::text
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = (storage.foldername(name))[2]
        AND p.user_id = (SELECT auth.uid())
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END
$$;
