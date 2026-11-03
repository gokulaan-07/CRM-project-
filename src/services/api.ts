import { 
  User, Lead, Customer, Deal, Activity, Task, Notification, 
  DashboardStats, AnalyticsData, LeadStatus, DealStage 
} from '../types';
import { mockStorage } from './mockStorage';

const API_BASE = '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('crm_token');
}

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Database Health / Seed Reset
  resetSeed: async (): Promise<{ message: string }> => {
    try {
      const res = await fetch(`${API_BASE}/seed/reset`, { 
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    localStorage.removeItem('crm_mock_store_v1');
    mockStorage.getStore();
    return { message: 'Database reset to initial seed data successfully' };
  },

  // Authentication
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) localStorage.setItem('crm_token', data.token);
        return data;
      }
    } catch {
      // fallback to offline auth
    }

    const user = mockStorage.findUserByEmail(email) || mockStorage.getUsers()[0];
    const token = `offline_token_${user._id}`;
    localStorage.setItem('crm_token', token);
    localStorage.setItem('crm_offline_user', JSON.stringify(user));
    return { token, user };
  },

  register: async (userData: { name: string; email: string; password?: string; role?: string; phone?: string; department?: string }): Promise<{ token: string; user: User }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) localStorage.setItem('crm_token', data.token);
        return data;
      }
    } catch {
      // offline
    }

    const user = mockStorage.createUser(userData as Partial<User>);
    const token = `offline_token_${user._id}`;
    localStorage.setItem('crm_token', token);
    localStorage.setItem('crm_offline_user', JSON.stringify(user));
    return { token, user };
  },

  switchUser: async (userId: string): Promise<{ token: string; user: User }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/switch-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) localStorage.setItem('crm_token', data.token);
        return data;
      }
    } catch {
      // offline
    }

    const user = mockStorage.getUserById(userId) || mockStorage.getUsers()[0];
    const token = `offline_token_${user._id}`;
    localStorage.setItem('crm_token', token);
    localStorage.setItem('crm_offline_user', JSON.stringify(user));
    return { token, user };
  },

  getMe: async (): Promise<User | null> => {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }

    const cached = localStorage.getItem('crm_offline_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    return mockStorage.getUsers()[0] || null;
  },

  logout: () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_offline_user');
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // offline
    }
    return mockStorage.getUsers();
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.createUser(userData);
  },

  updateUserStatus: async (id: string, status: string, role?: string): Promise<User> => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, role })
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    const user = mockStorage.getUserById(id);
    if (user) {
      user.status = status as any;
      if (role) user.role = role as any;
    }
    return user || mockStorage.getUsers()[0];
  },

  // Leads
  getLeads: async (): Promise<Lead[]> => {
    try {
      const res = await fetch(`${API_BASE}/leads`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // offline
    }
    return mockStorage.getLeads();
  },

  getLeadById: async (id: string): Promise<Lead> => {
    try {
      const res = await fetch(`${API_BASE}/leads/${id}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    const lead = mockStorage.getLeadById(id);
    if (!lead) throw new Error('Lead not found');
    return lead;
  },

  createLead: async (leadData: Partial<Lead>, _currentUserId?: string): Promise<Lead> => {
    try {
      const res = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(leadData)
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.createLead(leadData);
  },

  updateLead: async (id: string, updates: Partial<Lead>, _currentUserId?: string): Promise<Lead> => {
    try {
      const res = await fetch(`${API_BASE}/leads/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.updateLead(id, updates);
  },

  updateLeadStatus: async (id: string, status: LeadStatus, _currentUserId?: string): Promise<Lead> => {
    try {
      const res = await fetch(`${API_BASE}/leads/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.updateLead(id, { status });
  },

  convertLeadToCustomer: async (id: string, _currentUserId?: string): Promise<{ customer: Customer; lead: Lead }> => {
    try {
      const res = await fetch(`${API_BASE}/leads/${id}/convert`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.convertLead(id);
  },

  deleteLead: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await fetch(`${API_BASE}/leads/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    mockStorage.deleteLead(id);
    return { message: 'Lead deleted' };
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // offline
    }
    return mockStorage.getCustomers();
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    const c = mockStorage.getCustomerById(id);
    if (!c) throw new Error('Customer not found');
    return c;
  },

  createCustomer: async (custData: Partial<Customer>): Promise<Customer> => {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(custData)
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.createCustomer(custData);
  },

  updateCustomer: async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.updateCustomer(id, updates);
  },

  // Deals
  getDeals: async (): Promise<Deal[]> => {
    try {
      const res = await fetch(`${API_BASE}/deals`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // offline
    }
    return mockStorage.getDeals();
  },

  createDeal: async (dealData: Partial<Deal>): Promise<Deal> => {
    try {
      const res = await fetch(`${API_BASE}/deals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dealData)
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.createDeal(dealData);
  },

  updateDeal: async (id: string, updates: Partial<Deal>): Promise<Deal> => {
    try {
      const res = await fetch(`${API_BASE}/deals/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.updateDeal(id, updates);
  },

  updateDealStage: async (id: string, stage: DealStage): Promise<Deal> => {
    try {
      const res = await fetch(`${API_BASE}/deals/${id}/stage`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stage })
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.updateDeal(id, { stage });
  },

  deleteDeal: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await fetch(`${API_BASE}/deals/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    mockStorage.deleteDeal(id);
    return { message: 'Deal deleted' };
  },

  // Activities & Communication
  getActivities: async (filter?: { leadId?: string; customerId?: string; type?: string }): Promise<Activity[]> => {
    try {
      const query = new URLSearchParams();
      if (filter?.leadId) query.append('leadId', filter.leadId);
      if (filter?.customerId) query.append('customerId', filter.customerId);
      if (filter?.type) query.append('type', filter.type);
      const res = await fetch(`${API_BASE}/activities?${query.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // offline
    }
    return mockStorage.getActivities(filter);
  },

  createActivity: async (actData: Partial<Activity>, _currentUserId?: string): Promise<Activity> => {
    try {
      const res = await fetch(`${API_BASE}/activities`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(actData)
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.createActivity(actData);
  },

  // Tasks & Follow-ups
  getTasks: async (): Promise<Task[]> => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // offline
    }
    return mockStorage.getTasks();
  },

  createTask: async (taskData: Partial<Task>): Promise<Task> => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData)
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.createTask(taskData);
  },

  toggleTaskStatus: async (id: string, status: string): Promise<Task> => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.toggleTask(id, status);
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.updateTask(id, updates);
  },

  deleteTask: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    mockStorage.deleteTask(id);
    return { message: 'Task deleted' };
  },

  // Notifications
  getNotifications: async (userId?: string): Promise<Notification[]> => {
    try {
      const url = userId ? `${API_BASE}/notifications?userId=${userId}` : `${API_BASE}/notifications`;
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // offline
    }
    return mockStorage.getNotifications(userId);
  },

  markNotificationRead: async (id: string): Promise<{ success: boolean }> => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, { 
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    mockStorage.markNotificationRead(id);
    return { success: true };
  },

  markAllNotificationsRead: async (userId?: string): Promise<{ success: boolean }> => {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId })
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    mockStorage.markAllNotificationsRead(userId);
    return { success: true };
  },

  // Stats & Analytics
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.getDashboardStats();
  },

  getAnalytics: async (): Promise<AnalyticsData> => {
    try {
      const res = await fetch(`${API_BASE}/analytics`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return res.json();
    } catch {
      // offline
    }
    return mockStorage.getAnalytics();
  }
};
