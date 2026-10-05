// Seed Data for Admin Account & Initial Sample Projects

export const ADMIN_USER = {
  id: "usr-admin-001",
  email: "admin@nexusspace.io",
  user_metadata: {
    full_name: "Workspace Admin",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"
  }
};

export const INITIAL_MOCK_PROFILES = [
  {
    id: "usr-admin-001",
    full_name: "Workspace Admin",
    email: "admin@nexusspace.io",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    role: "Admin",
    bio: "Super Administrator with global access to all user projects and platform analytics.",
    website: "https://nexusspace.io"
  }
];

// 10 Sample Projects for Admin View
export const INITIAL_MOCK_PROJECTS = [
  {
    id: "proj-101",
    user_id: "usr-admin-001",
    title: "AI Predictive Analytics Dashboard",
    description: "Enterprise analytics platform featuring real-time telemetry, machine learning predictions, and custom client reporting modules.",
    category: "AI / Data",
    status: "In Progress",
    priority: "High",
    cover_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "proj-102",
    user_id: "usr-admin-001",
    title: "EcoShop Mobile Shopping App",
    description: "Cross-platform mobile application focusing on sustainable brands, carbon offset tracking, and instant checkout.",
    category: "Mobile App",
    status: "Completed",
    priority: "Medium",
    cover_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800",
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "proj-103",
    user_id: "usr-admin-001",
    title: "Glassmorphism React Design System",
    description: "A comprehensive modern React UI kit designed with subtle backdrops, rich micro-animations, and full accessibility support.",
    category: "Design",
    status: "Planning",
    priority: "Urgent",
    cover_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "proj-104",
    user_id: "usr-admin-001",
    title: "Cloud Infrastructure Monitoring API",
    description: "High-throughput microservices monitoring system with automated anomaly detection and instant Slack alerting.",
    category: "Web Dev",
    status: "In Progress",
    priority: "High",
    cover_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "proj-105",
    user_id: "usr-admin-001",
    title: "SaaS Subscription & Billing Engine",
    description: "Stripe integrated subscription engine with tiered pricing, multi-currency support, and usage-based metering.",
    category: "Web Dev",
    status: "Completed",
    priority: "Urgent",
    cover_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800",
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "proj-106",
    user_id: "usr-admin-001",
    title: "Global Marketing Strategy Portal",
    description: "Centralized marketing asset repository, campaign schedule tracker, and ROI analytics platform.",
    category: "Marketing",
    status: "On Hold",
    priority: "Low",
    cover_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "proj-107",
    user_id: "usr-admin-001",
    title: "Cybersecurity Compliance Auditor",
    description: "Automated vulnerability scanner checking SOC2, HIPAA, and ISO27001 compliance standards across repositories.",
    category: "AI / Data",
    status: "In Progress",
    priority: "Urgent",
    cover_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "proj-108",
    user_id: "usr-admin-001",
    title: "Fitness & Nutrition Health Tracker",
    description: "Personalized AI wellness assistant providing meal recommendations, workout plans, and biometric sync.",
    category: "Mobile App",
    status: "Planning",
    priority: "Medium",
    cover_url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800",
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "proj-109",
    user_id: "usr-admin-001",
    title: "3D Interactive Product Catalog",
    description: "Web-based WebGL product customizer enabling customers to view 3D models with texture modification.",
    category: "Design",
    status: "Completed",
    priority: "High",
    cover_url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800",
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "proj-110",
    user_id: "usr-admin-001",
    title: "Real-Time Team Collaboration Suite",
    description: "Integrated voice, video chat, canvas whiteboard, and markdown workspace for remote product teams.",
    category: "Web Dev",
    status: "In Progress",
    priority: "High",
    cover_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
    is_public: true,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_MOCK_TASKS = [
  {
    id: "task-01",
    project_id: "proj-101",
    user_id: "usr-admin-001",
    title: "Configure Supabase Auth & Row Level Security Policies",
    is_completed: true,
    priority: "High",
    due_date: "2026-10-10",
    created_at: new Date().toISOString()
  },
  {
    id: "task-02",
    project_id: "proj-101",
    user_id: "usr-admin-001",
    title: "Connect telemetry analytics endpoint",
    is_completed: false,
    priority: "Medium",
    due_date: "2026-10-15",
    created_at: new Date().toISOString()
  }
];

export const INITIAL_MOCK_FILES = [
  {
    id: "file-01",
    project_id: "proj-101",
    user_id: "usr-admin-001",
    file_name: "Architecture-Specification.pdf",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_size: 1428570,
    file_type: "application/pdf",
    created_at: new Date().toISOString()
  }
];
