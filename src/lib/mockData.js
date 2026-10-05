// Initial Seed Data for Demo / Fallback Mode when live Supabase env vars are empty

export const INITIAL_MOCK_USER = {
  id: "usr-demo-001",
  email: "alex.dev@nexusspace.io",
  user_metadata: {
    full_name: "Alex Rivera",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"
  }
};

export const INITIAL_MOCK_PROFILES = [
  {
    id: "usr-demo-001",
    full_name: "Alex Rivera",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    role: "Lead",
    bio: "Full-stack engineer & product architect passionate about high-performance apps.",
    website: "https://alexrivera.dev"
  }
];

export const INITIAL_MOCK_PROJECTS = [
  {
    id: "proj-101",
    user_id: "usr-demo-001",
    title: "AI-Powered Analytics Dashboard",
    description: "Next-generation analytics platform featuring real-time telemetry, predictive insights, and automated client reporting modules.",
    category: "AI / Data",
    status: "In Progress",
    priority: "High",
    cover_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "proj-102",
    user_id: "usr-demo-001",
    title: "EcoShop Mobile Experience",
    description: "Cross-platform mobile e-commerce application focusing on sustainable brands, carbon footprint tracking, and instant checkout.",
    category: "Mobile App",
    status: "Completed",
    priority: "Medium",
    cover_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800",
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "proj-103",
    user_id: "usr-demo-001",
    title: "Glassmorphism UI Component Library",
    description: "A comprehensive modern React UI kit designed with subtle backdrops, rich micro-animations, and full accessibility support.",
    category: "Design",
    status: "Planning",
    priority: "Urgent",
    cover_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_MOCK_TASKS = [
  {
    id: "task-01",
    project_id: "proj-101",
    user_id: "usr-demo-001",
    title: "Implement Supabase Auth with Google OAuth provider",
    is_completed: true,
    priority: "High",
    due_date: "2026-10-10",
    created_at: new Date().toISOString()
  },
  {
    id: "task-02",
    project_id: "proj-101",
    user_id: "usr-demo-001",
    title: "Design dynamic charting widget with Recharts",
    is_completed: false,
    priority: "Medium",
    due_date: "2026-10-15",
    created_at: new Date().toISOString()
  },
  {
    id: "task-03",
    project_id: "proj-102",
    user_id: "usr-demo-001",
    title: "Configure Row Level Security policies for user orders",
    is_completed: true,
    priority: "High",
    due_date: "2026-10-01",
    created_at: new Date().toISOString()
  }
];

export const INITIAL_MOCK_FILES = [
  {
    id: "file-01",
    project_id: "proj-101",
    user_id: "usr-demo-001",
    file_name: "Architecture-Specification.pdf",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_size: 1428570,
    file_type: "application/pdf",
    created_at: new Date().toISOString()
  },
  {
    id: "file-02",
    project_id: "proj-101",
    user_id: "usr-demo-001",
    file_name: "Dashboard-Wireframe.png",
    file_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    file_size: 2450120,
    file_type: "image/png",
    created_at: new Date().toISOString()
  }
];
