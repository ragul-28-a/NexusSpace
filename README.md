# NexusSpace - Full-Stack Workspace & Project Management SaaS Platform

NexusSpace is a production-ready, full-stack collaborative workspace application built with **React**, **Vite**, **Supabase** (Authentication, Database, Storage, and Row Level Security), **Lucide Icons**, and a responsive dark glassmorphism user interface tailored for mobile, tablet, and laptop screens.

---

## ✨ Key Features

- **🔐 User Authentication**: Register, Login, and Logout powered by Supabase Auth with client-side form validation.
- **🗄️ Relational Database**: Multi-tenant database model featuring `profiles`, `projects`, `tasks`, and `project_files` with cascading foreign key relationships.
- **🛡️ Row Level Security (RLS)**: Enforces strict data ownership and permission checks at the database layer (`supabase/schema.sql`).
- **🖼️ Supabase Storage Integration**: File attachment uploads and cover artwork image uploads with instant preview and CDN link resolution.
- **📱 Fully Responsive UI**: Mobile-friendly navigation drawer, touch-optimized card layouts, and desktop glassmorphism interface.
- **⚡ Vercel Ready**: Preconfigured with `vercel.json` SPA rewrite rules and zero-config deployment.

---

## 🚀 Quick Start (Local Development)

1. **Create your local environment file**:
   ```bash
   copy .env.example .env
   ```
   Then add your live Supabase values.

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## 🌐 Deploying to Vercel

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Deploy NexusSpace to Vercel"
   git push -u origin main
   ```
2. Import the repository in [Vercel Dashboard](https://vercel.com/new).
3. In **Project Settings → Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon/public key
4. Redeploy the project.
5. Vercel will automatically build and publish your full-stack app with the live Supabase backend.

---

## 🗄️ Supabase SQL Database Setup

To link your live Supabase cloud backend:
1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** -> **New Query**.
3. Copy and run the script from `supabase/schema.sql`.
