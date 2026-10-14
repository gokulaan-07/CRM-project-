import { 
  User, Lead, Customer, Deal, Activity, Task, Notification, 
  DashboardStats, AnalyticsData, LeadStatus, DealStage 
} from '../types';

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
    const res = await fetch(`${API_BASE}/seed/reset`, { 
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Authentication
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('crm_token', data.token);
    }
    return data;
  },

  register: async (userData: { name: string; email: string; password?: string; role?: string; phone?: string; department?: string }): Promise<{ token: string; user: User }> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('crm_token', data.token);
    }
    return data;
  },

  switchUser: async (userId: string): Promise<{ token: string; user: User }> => {
    const res = await fetch(`${API_BASE}/auth/switch-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to switch user');
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('crm_token', data.token);
    }
    return data;
  },

  getMe: async (): Promise<User | null> => {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('crm_token');
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create user');
    }
    return res.json();
  },

  updateUserStatus: async (id: string, status: string, role?: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, role })
    });
    return res.json();
  },

  // Leads
  getLeads: async (): Promise<Lead[]> => {
    try {
      const res = await fetch(`${API_BASE}/leads`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  getLeadById: async (id: string): Promise<Lead> => {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  createLead: async (leadData: Partial<Lead>, _currentUserId?: string): Promise<Lead> => {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(leadData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create lead');
    }
    return res.json();
  },

  updateLead: async (id: string, updates: Partial<Lead>, _currentUserId?: string): Promise<Lead> => {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update lead');
    }
    return res.json();
  },

  updateLeadStatus: async (id: string, status: LeadStatus, _currentUserId?: string): Promise<Lead> => {
    const res = await fetch(`${API_BASE}/leads/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update lead status');
    }
    return res.json();
  },

  convertLeadToCustomer: async (id: string, _currentUserId?: string): Promise<{ customer: Customer; lead: Lead }> => {
    const res = await fetch(`${API_BASE}/leads/${id}/convert`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to convert lead to customer');
    }
    return res.json();
  },

  deleteLead: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    const res = await fetch(`${API_BASE}/customers/${id}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  createCustomer: async (custData: Partial<Customer>): Promise<Customer> => {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(custData)
    });
    return res.json();
  },

  updateCustomer: async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    const res = await fetch(`${API_BASE}/customers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Deals
  getDeals: async (): Promise<Deal[]> => {
    try {
      const res = await fetch(`${API_BASE}/deals`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  createDeal: async (dealData: Partial<Deal>): Promise<Deal> => {
    const res = await fetch(`${API_BASE}/deals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dealData)
    });
    return res.json();
  },

  updateDeal: async (id: string, updates: Partial<Deal>): Promise<Deal> => {
    const res = await fetch(`${API_BASE}/deals/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  updateDealStage: async (id: string, stage: DealStage): Promise<Deal> => {
    const res = await fetch(`${API_BASE}/deals/${id}/stage`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stage })
    });
    return res.json();
  },

  deleteDeal: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/deals/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
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
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  createActivity: async (actData: Partial<Activity>, _currentUserId?: string): Promise<Activity> => {
    const res = await fetch(`${API_BASE}/activities`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(actData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create activity');
    }
    return res.json();
  },

  // Tasks & Follow-ups
  getTasks: async (): Promise<Task[]> => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  createTask: async (taskData: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create task');
    }
    return res.json();
  },

  toggleTaskStatus: async (id: string, status: string): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  deleteTask: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Notifications
  getNotifications: async (userId?: string): Promise<Notification[]> => {
    try {
      const url = userId ? `${API_BASE}/notifications?userId=${userId}` : `${API_BASE}/notifications`;
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  markNotificationRead: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, { 
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  markAllNotificationsRead: async (userId?: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  // Stats & Analytics (from MongoDB)
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getAnalytics: async (): Promise<AnalyticsData> => {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: getAuthHeaders()
    });
    return res.json();
  }
};
