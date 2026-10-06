// Clean starter data: keep the built-in admin account, but remove old demo/test projects.

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

export const INITIAL_MOCK_PROJECTS = [];

export const INITIAL_MOCK_TASKS = [];

export const INITIAL_MOCK_FILES = [];
