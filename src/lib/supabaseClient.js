import { createClient } from '@supabase/supabase-js';
import {
  ADMIN_USER,
  INITIAL_MOCK_PROFILES,
  INITIAL_MOCK_PROJECTS,
  INITIAL_MOCK_TASKS,
  INITIAL_MOCK_FILES
} from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseUrl.trim() !== ''
);

let realSupabase = null;

if (isLiveSupabaseConfigured) {
  realSupabase = createClient(supabaseUrl, supabaseAnonKey);
}

// -------------------------------------------------------------
// LOCAL STORAGE BACKED MOCK SUPABASE ENGINE (ADMIN & USER ROLES)
// -------------------------------------------------------------
class LocalStorageMockSupabase {
  constructor() {
    this.authListeners = [];
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem('nexus_profiles')) {
      localStorage.setItem('nexus_profiles', JSON.stringify(INITIAL_MOCK_PROFILES));
    }
    if (!localStorage.getItem('nexus_projects')) {
      localStorage.setItem('nexus_projects', JSON.stringify(INITIAL_MOCK_PROJECTS));
    }
    if (!localStorage.getItem('nexus_tasks')) {
      localStorage.setItem('nexus_tasks', JSON.stringify(INITIAL_MOCK_TASKS));
    }
    if (!localStorage.getItem('nexus_files')) {
      localStorage.setItem('nexus_files', JSON.stringify(INITIAL_MOCK_FILES));
    }
    // Default session: null (requires login or signup)
    if (!localStorage.getItem('nexus_user') && !localStorage.getItem('nexus_has_initialized')) {
      localStorage.setItem('nexus_has_initialized', 'true');
    }
  }

  get user() {
    const raw = localStorage.getItem('nexus_user');
    return raw ? JSON.parse(raw) : null;
  }

  set user(val) {
    if (val) {
      localStorage.setItem('nexus_user', JSON.stringify(val));
    } else {
      localStorage.removeItem('nexus_user');
    }
  }

  // AUTH API
  auth = {
    getSession: async () => {
      const u = this.user;
      return { data: { session: u ? { user: u, access_token: 'mock-jwt-token' } : null }, error: null };
    },
    getUser: async () => {
      return { data: { user: this.user }, error: null };
    },
    signUp: async ({ email, password, options = {} }) => {
      await new Promise(r => setTimeout(r, 400));
      const newUser = {
        id: `usr-${Date.now()}`,
        email,
        user_metadata: options.data || { full_name: email.split('@')[0] }
      };
      this.user = newUser;

      // Add user profile with role 'Member'
      const profiles = JSON.parse(localStorage.getItem('nexus_profiles') || '[]');
      const newProfile = {
        id: newUser.id,
        full_name: newUser.user_metadata.full_name || email.split('@')[0],
        email: email,
        avatar_url: newUser.user_metadata.avatar_url || '',
        role: 'Member',
        bio: '',
        website: ''
      };
      profiles.push(newProfile);
      localStorage.setItem('nexus_profiles', JSON.stringify(profiles));

      this.notifyAuth('SIGNED_IN', { user: newUser });
      return { data: { user: newUser, session: { user: newUser } }, error: null };
    },
    signInWithPassword: async ({ email, password }) => {
      await new Promise(r => setTimeout(r, 400));

      const profiles = JSON.parse(localStorage.getItem('nexus_profiles') || '[]');
      
      // Admin Authentication Check
      if (email.toLowerCase() === 'admin@nexusspace.io') {
        const adminUser = ADMIN_USER;
        this.user = adminUser;
        if (!profiles.find(p => p.id === adminUser.id)) {
          profiles.push(INITIAL_MOCK_PROFILES[0]);
          localStorage.setItem('nexus_profiles', JSON.stringify(profiles));
        }
        this.notifyAuth('SIGNED_IN', { user: adminUser });
        return { data: { user: adminUser, session: { user: adminUser } }, error: null };
      }

      // Regular User Login
      let existingProfile = profiles.find(p => p.email && p.email.toLowerCase() === email.toLowerCase());
      let loggedUser;

      if (existingProfile) {
        loggedUser = {
          id: existingProfile.id,
          email: existingProfile.email,
          user_metadata: { full_name: existingProfile.full_name }
        };
      } else {
        loggedUser = {
          id: `usr-${Date.now()}`,
          email,
          user_metadata: { full_name: email.split('@')[0] }
        };
        profiles.push({
          id: loggedUser.id,
          full_name: email.split('@')[0],
          email: email,
          avatar_url: '',
          role: 'Member'
        });
        localStorage.setItem('nexus_profiles', JSON.stringify(profiles));
      }

      this.user = loggedUser;
      this.notifyAuth('SIGNED_IN', { user: loggedUser });
      return { data: { user: loggedUser, session: { user: loggedUser } }, error: null };
    },
    signOut: async () => {
      await new Promise(r => setTimeout(r, 300));
      this.user = null;
      this.notifyAuth('SIGNED_OUT', null);
      return { error: null };
    },
    onAuthStateChange: (callback) => {
      this.authListeners.push(callback);
      callback(this.user ? 'SIGNED_IN' : 'SIGNED_OUT', this.user ? { user: this.user } : null);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              this.authListeners = this.authListeners.filter(l => l !== callback);
            }
          }
        }
      };
    }
  };

  notifyAuth(event, session) {
    this.authListeners.forEach(l => l(event, session));
  }

  // DATABASE QUERY BUILDER API WITH ROLE PERMISSIONS
  from(table) {
    const self = this;
    let storageKey = `nexus_${table}`;
    let items = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const currentUser = this.user;

    let filters = [];
    let sortField = null;
    let sortAscending = true;

    const builder = {
      select(queryStr = '*') {
        return builder;
      },
      eq(field, value) {
        filters.push(item => item[field] === value);
        return builder;
      },
      order(field, { ascending = true } = {}) {
        sortField = field;
        sortAscending = ascending;
        return builder;
      },
      async then(resolve) {
        await new Promise(r => setTimeout(r, 200));
        let result = [...items];

        // ROLE-BASED ACCESS CONTROL (RLS Simulation)
        if (table === 'projects') {
          const profiles = JSON.parse(localStorage.getItem('nexus_profiles') || '[]');
          const currentProfile = currentUser ? profiles.find(p => p.id === currentUser.id) : null;
          const isAdmin = currentProfile?.role === 'Admin' || currentUser?.email === 'admin@nexusspace.io';

          if (!isAdmin) {
            // Regular user: ONLY show projects created by this user!
            if (currentUser) {
              result = result.filter(p => p.user_id === currentUser.id);
            } else {
              result = []; // Unauthenticated users see 0 projects
            }
          }
          // Admin sees ALL projects across all users!
        }

        // Apply any manual .eq() filters
        filters.forEach(fn => {
          result = result.filter(fn);
        });

        // Apply ordering
        if (sortField) {
          result.sort((a, b) => {
            if (a[sortField] < b[sortField]) return sortAscending ? -1 : 1;
            if (a[sortField] > b[sortField]) return sortAscending ? 1 : -1;
            return 0;
          });
        }

        resolve({ data: result, error: null });
      },
      insert(newRecords) {
        const records = Array.isArray(newRecords) ? newRecords : [newRecords];
        const inserted = records.map(rec => ({
          id: rec.id || `id-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...rec
        }));
        items.push(...inserted);
        localStorage.setItem(storageKey, JSON.stringify(items));
        return {
          async then(resolve) {
            await new Promise(r => setTimeout(r, 250));
            resolve({ data: Array.isArray(newRecords) ? inserted : inserted[0], error: null });
          },
          select() {
            return {
              async then(resolve) {
                await new Promise(r => setTimeout(r, 250));
                resolve({ data: Array.isArray(newRecords) ? inserted : inserted[0], error: null });
              }
            };
          }
        };
      },
      update(updates) {
        return {
          eq(field, value) {
            let updatedItem = null;
            items = items.map(item => {
              if (item[field] === value) {
                updatedItem = { ...item, ...updates, updated_at: new Date().toISOString() };
                return updatedItem;
              }
              return item;
            });
            localStorage.setItem(storageKey, JSON.stringify(items));
            return {
              async then(resolve) {
                await new Promise(r => setTimeout(r, 250));
                resolve({ data: updatedItem ? [updatedItem] : [], error: null });
              },
              select() {
                return {
                  async then(resolve) {
                    await new Promise(r => setTimeout(r, 250));
                    resolve({ data: updatedItem ? [updatedItem] : [], error: null });
                  }
                };
              }
            };
          }
        };
      },
      delete() {
        return {
          eq(field, value) {
            items = items.filter(item => item[field] !== value);
            localStorage.setItem(storageKey, JSON.stringify(items));
            return {
              async then(resolve) {
                await new Promise(r => setTimeout(r, 250));
                resolve({ data: null, error: null });
              }
            };
          }
        };
      }
    };

    return builder;
  }

  // STORAGE API
  storage = {
    from(bucketName) {
      return {
        upload: async (path, file) => {
          await new Promise(r => setTimeout(r, 400));
          const mockUrl = URL.createObjectURL(file);
          return { data: { path }, error: null, publicUrl: mockUrl };
        },
        getPublicUrl: (path) => {
          return { data: { publicUrl: `https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800` } };
        },
        remove: async (paths) => {
          await new Promise(r => setTimeout(r, 200));
          return { data: paths, error: null };
        }
      };
    }
  };
}

export const mockSupabase = new LocalStorageMockSupabase();

export const supabase = isLiveSupabaseConfigured ? realSupabase : mockSupabase;
