import {
  User, Lead, Customer, Deal, Activity, Task, Notification,
  DashboardStats, AnalyticsData, LeadStatus, DealStage
} from '../types';

const STORAGE_KEY = 'crm_mock_store_v1';

export interface CRMStoreData {
  users: User[];
  leads: Lead[];
  customers: Customer[];
  deals: Deal[];
  activities: Activity[];
  tasks: Task[];
  notifications: Notification[];
}

const initialUsers: User[] = [
  {
    _id: 'usr_gokul',
    name: 'Gokulaan',
    email: 'gokulaan9c@gmail.com',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43210',
    department: 'Sales & Management',
    createdAt: '2026-01-15T09:00:00.000Z'
  },
  {
    _id: 'usr_priya',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    role: 'sales',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43211',
    department: 'Enterprise Sales',
    createdAt: '2026-02-01T09:00:00.000Z'
  },
  {
    _id: 'usr_arun',
    name: 'Arun Patel',
    email: 'arun.patel@example.com',
    role: 'sales',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43212',
    department: 'Inside Sales',
    createdAt: '2026-02-15T09:00:00.000Z'
  },
  {
    _id: 'usr_ananya',
    name: 'Ananya Rao',
    email: 'ananya.rao@example.com',
    role: 'sales',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43213',
    department: 'Mid-Market Sales',
    createdAt: '2026-03-01T09:00:00.000Z'
  }
];

const initialCustomers: Customer[] = [
  {
    _id: 'cust_rohit',
    name: 'Rohit Singhania',
    company: 'Singhania Organic Foods',
    email: 'rohit@singhaniafoods.com',
    phone: '+91 98990 12345',
    status: 'VIP',
    assignedTo: 'usr_gokul',
    assignedUserName: 'Gokulaan',
    totalValue: 450000,
    convertedAt: '2026-08-01T11:00:00.000Z',
    notes: 'Converted from Lead. Phase 1 delivery in progress.',
    address: '42 Commercial Street, Bangalore, Karnataka',
    industry: 'Food & Beverage',
    createdAt: '2026-08-01T11:00:00.000Z',
    updatedAt: '2026-08-01T11:00:00.000Z'
  },
  {
    _id: 'cust_vikram',
    name: 'Vikram Mehta',
    company: 'Zenith Global Logistics',
    email: 'vikram@zenithlogistics.com',
    phone: '+91 99001 23456',
    status: 'Active',
    assignedTo: 'usr_priya',
    assignedUserName: 'Priya Sharma',
    totalValue: 500000,
    convertedAt: '2026-07-10T14:30:00.000Z',
    notes: 'Long-term enterprise customer. Annual support contract active.',
    address: 'Plot 18, BKC Complex, Mumbai, Maharashtra',
    industry: 'Supply Chain & Logistics',
    createdAt: '2026-07-10T14:30:00.000Z',
    updatedAt: '2026-07-10T14:30:00.000Z'
  },
  {
    _id: 'cust_sneha',
    name: 'Sneha Kapoor',
    company: 'Kapoor Fashion Trends',
    email: 'sneha@kapoorfashion.in',
    phone: '+91 99112 34567',
    status: 'Active',
    assignedTo: 'usr_arun',
    assignedUserName: 'Arun Patel',
    totalValue: 220000,
    convertedAt: '2026-07-28T16:00:00.000Z',
    notes: 'E-commerce platform launched successfully.',
    address: 'Connaught Place, New Delhi',
    industry: 'Retail & Fashion',
    createdAt: '2026-07-28T16:00:00.000Z',
    updatedAt: '2026-07-28T16:00:00.000Z'
  }
];

const initialLeads: Lead[] = [
  {
    _id: 'lead_rahul',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@abctech.in',
    phone: '+91 98112 34567',
    company: 'ABC Technologies',
    source: 'Website',
    interest: 'E-commerce Website',
    status: 'Qualified',
    priority: 'High',
    estimatedValue: 200000,
    assignedTo: 'usr_gokul',
    assignedUserName: 'Gokulaan',
    notes: 'Inquired for complete modern e-commerce web platform with payment integration, product catalog, and order management.',
    isConverted: false,
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z'
  },
  {
    _id: 'lead_priya_d',
    name: 'Priya Desai',
    email: 'priya@boutiquestyle.com',
    phone: '+91 98223 45678',
    company: 'Priya Boutique',
    source: 'Referral',
    interest: 'Mobile App Development',
    status: 'Contacted',
    priority: 'Medium',
    estimatedValue: 100000,
    assignedTo: 'usr_priya',
    assignedUserName: 'Priya Sharma',
    notes: 'Needs iOS & Android boutique shopping application. First discovery call conducted.',
    isConverted: false,
    createdAt: '2026-08-11T11:30:00.000Z',
    updatedAt: '2026-08-11T11:30:00.000Z'
  },
  {
    _id: 'lead_arun_d',
    name: 'Arun Deshmukh',
    email: 'arun@apexlogistics.in',
    phone: '+91 98334 56789',
    company: 'Apex Logistics',
    source: 'Advertisement',
    interest: 'CRM Integration & ERP',
    status: 'Qualified',
    priority: 'High',
    estimatedValue: 300000,
    assignedTo: 'usr_arun',
    assignedUserName: 'Arun Patel',
    notes: 'Fleet management tracking & custom CRM modules. Budget pre-approved.',
    isConverted: false,
    createdAt: '2026-08-12T14:15:00.000Z',
    updatedAt: '2026-08-12T14:15:00.000Z'
  },
  {
    _id: 'lead_karthik',
    name: 'Karthik Menon',
    email: 'karthik@fintechsol.io',
    phone: '+91 98445 67890',
    company: 'Karthik FinTech',
    source: 'Social Media',
    interest: 'Financial Dashboard',
    status: 'Proposal',
    priority: 'Medium',
    estimatedValue: 150000,
    assignedTo: 'usr_gokul',
    assignedUserName: 'Gokulaan',
    notes: 'Sent formal scope document and technical quotation for ₹1.5L. Awaiting review.',
    isConverted: false,
    createdAt: '2026-08-14T09:45:00.000Z',
    updatedAt: '2026-08-14T09:45:00.000Z'
  },
  {
    _id: 'lead_suresh',
    name: 'Suresh Nair',
    email: 'suresh@nairhealth.org',
    phone: '+91 98556 78901',
    company: 'Nair Healthcare',
    source: 'Phone',
    interest: 'Hospital Management System',
    status: 'Negotiation',
    priority: 'High',
    estimatedValue: 250000,
    assignedTo: 'usr_priya',
    assignedUserName: 'Priya Sharma',
    notes: 'In final discount negotiation. Client requested 5% waiver on annual maintenance.',
    isConverted: false,
    createdAt: '2026-08-15T15:00:00.000Z',
    updatedAt: '2026-08-15T15:00:00.000Z'
  },
  {
    _id: 'lead_ajay',
    name: 'Ajay Verma',
    email: 'ajay@vermaproperties.in',
    phone: '+91 98667 89012',
    company: 'Verma Real Estate',
    source: 'Referral',
    interest: 'Property Listing Portal',
    status: 'Won',
    priority: 'High',
    estimatedValue: 300000,
    assignedTo: 'usr_arun',
    assignedUserName: 'Arun Patel',
    notes: 'Proposal accepted and initial deposit agreed. Ready to convert to official customer!',
    isConverted: false,
    createdAt: '2026-08-16T16:20:00.000Z',
    updatedAt: '2026-08-16T16:20:00.000Z'
  },
  {
    _id: 'lead_deepak',
    name: 'Deepak Sharma',
    email: 'deepak@deepakauto.com',
    phone: '+91 98778 90123',
    company: 'Deepak Auto Works',
    source: 'Website',
    interest: 'Dealership Website & Booking',
    status: 'New',
    priority: 'Low',
    estimatedValue: 80000,
    assignedTo: 'usr_ananya',
    assignedUserName: 'Ananya Rao',
    notes: 'Submitted contact form requesting simple dynamic catalog.',
    isConverted: false,
    createdAt: '2026-08-17T11:00:00.000Z',
    updatedAt: '2026-08-17T11:00:00.000Z'
  },
  {
    _id: 'lead_meera',
    name: 'Meera Iyer',
    email: 'meera@meeracloud.co',
    phone: '+91 98889 01234',
    company: 'Meera Cloud Solutions',
    source: 'Email',
    interest: 'Cloud Migration & Support',
    status: 'Lost',
    priority: 'Medium',
    estimatedValue: 120000,
    assignedTo: 'usr_ananya',
    assignedUserName: 'Ananya Rao',
    notes: 'Client decided to build in-house with existing engineering team.',
    isConverted: false,
    createdAt: '2026-08-18T13:10:00.000Z',
    updatedAt: '2026-08-18T13:10:00.000Z'
  },
  {
    _id: 'lead_rohit_conv',
    name: 'Rohit Singhania',
    email: 'rohit@singhaniafoods.com',
    phone: '+91 98990 12345',
    company: 'Singhania Organic Foods',
    source: 'Referral',
    interest: 'Food Delivery Portal & App',
    status: 'Converted',
    priority: 'High',
    estimatedValue: 450000,
    assignedTo: 'usr_gokul',
    assignedUserName: 'Gokulaan',
    notes: 'Successfully won and converted to key corporate client.',
    isConverted: true,
    customerId: 'cust_rohit',
    createdAt: '2026-07-25T10:00:00.000Z',
    updatedAt: '2026-08-01T11:00:00.000Z'
  }
];

const initialDeals: Deal[] = [
  {
    _id: 'deal_rohit',
    title: 'E-commerce Platform Phase 1',
    customerId: 'cust_rohit',
    customerName: 'Singhania Organic Foods',
    leadId: 'lead_rohit_conv',
    leadName: 'Rohit Singhania',
    value: 450000,
    stage: 'Won',
    probability: 100,
    expectedCloseDate: '2026-08-01',
    assignedTo: 'usr_gokul',
    assignedUserName: 'Gokulaan',
    notes: 'Contract executed. ₹2,00,000 advance received.',
    createdAt: '2026-07-25T10:00:00.000Z',
    updatedAt: '2026-08-01T11:00:00.000Z'
  },
  {
    _id: 'deal_vikram',
    title: 'Enterprise ERP Maintenance',
    customerId: 'cust_vikram',
    customerName: 'Zenith Global Logistics',
    value: 500000,
    stage: 'Won',
    probability: 100,
    expectedCloseDate: '2026-07-10',
    assignedTo: 'usr_priya',
    assignedUserName: 'Priya Sharma',
    notes: 'Annual renewal successful.',
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-07-10T14:30:00.000Z'
  },
  {
    _id: 'deal_sneha',
    title: 'Fashion Store Web App',
    customerId: 'cust_sneha',
    customerName: 'Kapoor Fashion Trends',
    value: 220000,
    stage: 'Won',
    probability: 100,
    expectedCloseDate: '2026-07-28',
    assignedTo: 'usr_arun',
    assignedUserName: 'Arun Patel',
    notes: 'Final deployment and sign-off complete.',
    createdAt: '2026-07-15T10:00:00.000Z',
    updatedAt: '2026-07-28T16:00:00.000Z'
  },
  {
    _id: 'deal_suresh',
    title: 'Hospital Management System',
    leadId: 'lead_suresh',
    leadName: 'Suresh Nair',
    value: 250000,
    stage: 'Negotiation',
    probability: 75,
    expectedCloseDate: '2026-09-15',
    assignedTo: 'usr_priya',
    assignedUserName: 'Priya Sharma',
    notes: 'Negotiating annual maintenance coverage.',
    createdAt: '2026-08-15T15:00:00.000Z',
    updatedAt: '2026-08-15T15:00:00.000Z'
  }
];

const initialActivities: Activity[] = [
  {
    _id: 'act_1',
    leadId: 'lead_rahul',
    leadName: 'Rahul Kumar',
    type: 'Call',
    title: 'Initial Discovery Call',
    description: 'Discussed project requirements and feature wishlist with Rahul Kumar.',
    performedBy: 'usr_gokul',
    performedByName: 'Gokulaan',
    timestamp: '2026-08-10T11:00:00.000Z',
    outcome: 'Client is keen to proceed; requested formal proposal.',
    createdAt: '2026-08-10T11:00:00.000Z'
  },
  {
    _id: 'act_2',
    leadId: 'lead_rahul',
    leadName: 'Rahul Kumar',
    type: 'Email',
    title: 'Technical Scope Proposal Sent',
    description: 'Shared comprehensive PDF breakdown covering payment gateway, inventory, and cloud hosting.',
    performedBy: 'usr_gokul',
    performedByName: 'Gokulaan',
    timestamp: '2026-08-12T14:00:00.000Z',
    outcome: 'Sent via email with NDA document attached.',
    createdAt: '2026-08-12T14:00:00.000Z'
  },
  {
    _id: 'act_3',
    leadId: 'lead_suresh',
    leadName: 'Suresh Nair',
    type: 'Meeting',
    title: 'Product Demo & Architecture Review',
    description: 'Conducted video demo demonstrating doctor portal, OPD scheduling, and patient history.',
    performedBy: 'usr_priya',
    performedByName: 'Priya Sharma',
    timestamp: '2026-08-16T10:30:00.000Z',
    outcome: 'Management approved feature set.',
    createdAt: '2026-08-16T10:30:00.000Z'
  }
];

const initialTasks: Task[] = [
  {
    _id: 'task_1',
    leadId: 'lead_rahul',
    leadName: 'Rahul Kumar',
    title: 'Follow-up on E-commerce Proposal',
    description: 'Call Rahul to answer technical questions regarding payment integration.',
    dueDate: '2026-11-10',
    dueTime: '11:00',
    priority: 'High',
    status: 'Pending',
    type: 'Call',
    assignedTo: 'usr_gokul',
    assignedUserName: 'Gokulaan',
    createdAt: '2026-08-12T14:30:00.000Z'
  },
  {
    _id: 'task_2',
    leadId: 'lead_suresh',
    leadName: 'Suresh Nair',
    title: 'Finalize Maintenance SLA Contract',
    description: 'Send revised maintenance SLA agreement with 5% waiver.',
    dueDate: '2026-11-08',
    dueTime: '15:00',
    priority: 'High',
    status: 'Pending',
    type: 'Proposal',
    assignedTo: 'usr_priya',
    assignedUserName: 'Priya Sharma',
    createdAt: '2026-08-16T11:00:00.000Z'
  },
  {
    _id: 'task_3',
    customerId: 'cust_rohit',
    customerName: 'Singhania Organic Foods',
    title: 'Phase 1 Milestone Review Call',
    description: 'Check in with Rohit Singhania on catalog ingestion milestone.',
    dueDate: '2026-11-12',
    dueTime: '14:00',
    priority: 'Medium',
    status: 'Pending',
    type: 'Call',
    assignedTo: 'usr_gokul',
    assignedUserName: 'Gokulaan',
    createdAt: '2026-08-01T11:30:00.000Z'
  }
];

const initialNotifications: Notification[] = [
  {
    _id: 'notif_1',
    userId: 'usr_gokul',
    title: 'High Priority Lead Assigned',
    message: 'Rahul Kumar from ABC Technologies has been assigned to you.',
    type: 'lead',
    read: false,
    createdAt: '2026-08-10T10:00:00.000Z'
  },
  {
    _id: 'notif_2',
    userId: 'usr_gokul',
    title: 'Deal Won!',
    message: 'E-commerce Platform Phase 1 valued at ₹4,50,000 was marked Won.',
    type: 'deal',
    read: true,
    createdAt: '2026-08-01T11:00:00.000Z'
  }
];

function getStore(): CRMStoreData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback to initial
    }
  }
  const defaultData: CRMStoreData = {
    users: initialUsers,
    leads: initialLeads,
    customers: initialCustomers,
    deals: initialDeals,
    activities: initialActivities,
    tasks: initialTasks,
    notifications: initialNotifications
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  return defaultData;
}

function saveStore(data: CRMStoreData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const mockStorage = {
  getStore,
  saveStore,

  // Users
  getUsers: (): User[] => getStore().users,
  getUserById: (id: string): User | undefined => getStore().users.find(u => u._id === id),
  findUserByEmail: (email: string): User | undefined => getStore().users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  createUser: (userData: Partial<User>): User => {
    const store = getStore();
    const newUser: User = {
      _id: `usr_${Date.now()}`,
      name: userData.name || 'New User',
      email: userData.email || '',
      role: userData.role || 'sales',
      status: 'active',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: userData.phone || '',
      department: userData.department || 'Sales',
      createdAt: new Date().toISOString()
    };
    store.users.push(newUser);
    saveStore(store);
    return newUser;
  },

  // Leads
  getLeads: (): Lead[] => getStore().leads,
  getLeadById: (id: string): Lead | undefined => getStore().leads.find(l => l._id === id),
  createLead: (data: Partial<Lead>): Lead => {
    const store = getStore();
    const assignedUser = store.users.find(u => u._id === data.assignedTo) || store.users[0];
    const newLead: Lead = {
      _id: `lead_${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      company: data.company || '',
      source: data.source || 'Website',
      interest: data.interest || 'General Inquiry',
      status: data.status || 'New',
      priority: data.priority || 'Medium',
      estimatedValue: data.estimatedValue || 0,
      assignedTo: assignedUser._id,
      assignedUserName: assignedUser.name,
      notes: data.notes || '',
      isConverted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.leads.unshift(newLead);
    saveStore(store);
    return newLead;
  },
  updateLead: (id: string, updates: Partial<Lead>): Lead => {
    const store = getStore();
    const idx = store.leads.findIndex(l => l._id === id);
    if (idx === -1) throw new Error('Lead not found');
    const existing = store.leads[idx];
    const assignedUser = updates.assignedTo ? store.users.find(u => u._id === updates.assignedTo) : undefined;
    const updated: Lead = {
      ...existing,
      ...updates,
      assignedUserName: assignedUser ? assignedUser.name : existing.assignedUserName,
      updatedAt: new Date().toISOString()
    };
    store.leads[idx] = updated;
    saveStore(store);
    return updated;
  },
  deleteLead: (id: string): void => {
    const store = getStore();
    store.leads = store.leads.filter(l => l._id !== id);
    saveStore(store);
  },
  convertLead: (leadId: string): { customer: Customer; lead: Lead } => {
    const store = getStore();
    const lead = store.leads.find(l => l._id === leadId);
    if (!lead) throw new Error('Lead not found');

    const customer: Customer = {
      _id: `cust_${Date.now()}`,
      leadId: lead._id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      status: 'Active',
      assignedTo: lead.assignedTo,
      assignedUserName: lead.assignedUserName,
      totalValue: lead.estimatedValue,
      convertedAt: new Date().toISOString(),
      notes: `Converted from lead. ${lead.notes}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.customers.unshift(customer);

    lead.isConverted = true;
    lead.status = 'Converted';
    lead.customerId = customer._id;
    lead.updatedAt = new Date().toISOString();

    saveStore(store);
    return { customer, lead };
  },

  // Customers
  getCustomers: (): Customer[] => getStore().customers,
  getCustomerById: (id: string): Customer | undefined => getStore().customers.find(c => c._id === id),
  createCustomer: (data: Partial<Customer>): Customer => {
    const store = getStore();
    const assignedUser = store.users.find(u => u._id === data.assignedTo) || store.users[0];
    const newCust: Customer = {
      _id: `cust_${Date.now()}`,
      name: data.name || '',
      company: data.company || '',
      email: data.email || '',
      phone: data.phone || '',
      status: data.status || 'Active',
      assignedTo: assignedUser._id,
      assignedUserName: assignedUser.name,
      totalValue: data.totalValue || 0,
      notes: data.notes || '',
      address: data.address || '',
      industry: data.industry || 'General',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.customers.unshift(newCust);
    saveStore(store);
    return newCust;
  },
  updateCustomer: (id: string, updates: Partial<Customer>): Customer => {
    const store = getStore();
    const idx = store.customers.findIndex(c => c._id === id);
    if (idx === -1) throw new Error('Customer not found');
    const existing = store.customers[idx];
    const updated: Customer = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    store.customers[idx] = updated;
    saveStore(store);
    return updated;
  },

  // Deals
  getDeals: (): Deal[] => getStore().deals,
  createDeal: (data: Partial<Deal>): Deal => {
    const store = getStore();
    const assignedUser = store.users.find(u => u._id === data.assignedTo) || store.users[0];
    const newDeal: Deal = {
      _id: `deal_${Date.now()}`,
      title: data.title || 'New Deal',
      customerId: data.customerId,
      customerName: data.customerName,
      leadId: data.leadId,
      leadName: data.leadName,
      value: data.value || 0,
      stage: data.stage || 'Qualified',
      probability: data.probability ?? 50,
      expectedCloseDate: data.expectedCloseDate || new Date().toISOString().split('T')[0],
      assignedTo: assignedUser._id,
      assignedUserName: assignedUser.name,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.deals.unshift(newDeal);
    saveStore(store);
    return newDeal;
  },
  updateDeal: (id: string, updates: Partial<Deal>): Deal => {
    const store = getStore();
    const idx = store.deals.findIndex(d => d._id === id);
    if (idx === -1) throw new Error('Deal not found');
    const existing = store.deals[idx];
    const updated: Deal = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    store.deals[idx] = updated;
    saveStore(store);
    return updated;
  },
  deleteDeal: (id: string): void => {
    const store = getStore();
    store.deals = store.deals.filter(d => d._id !== id);
    saveStore(store);
  },

  // Activities
  getActivities: (filter?: { leadId?: string; customerId?: string; type?: string }): Activity[] => {
    let acts = getStore().activities;
    if (filter?.leadId) acts = acts.filter(a => a.leadId === filter.leadId);
    if (filter?.customerId) acts = acts.filter(a => a.customerId === filter.customerId);
    if (filter?.type) acts = acts.filter(a => a.type === filter.type);
    return acts;
  },
  createActivity: (data: Partial<Activity>): Activity => {
    const store = getStore();
    const newAct: Activity = {
      _id: `act_${Date.now()}`,
      leadId: data.leadId,
      leadName: data.leadName,
      customerId: data.customerId,
      customerName: data.customerName,
      dealId: data.dealId,
      type: data.type || 'Call',
      title: data.title || 'Activity',
      description: data.description || '',
      performedBy: data.performedBy || store.users[0]._id,
      performedByName: data.performedByName || store.users[0].name,
      timestamp: data.timestamp || new Date().toISOString(),
      outcome: data.outcome || '',
      createdAt: new Date().toISOString()
    };
    store.activities.unshift(newAct);
    saveStore(store);
    return newAct;
  },

  // Tasks
  getTasks: (): Task[] => getStore().tasks,
  createTask: (data: Partial<Task>): Task => {
    const store = getStore();
    const assignedUser = store.users.find(u => u._id === data.assignedTo) || store.users[0];
    const newTask: Task = {
      _id: `task_${Date.now()}`,
      leadId: data.leadId,
      leadName: data.leadName,
      customerId: data.customerId,
      customerName: data.customerName,
      dealId: data.dealId,
      title: data.title || 'Follow up',
      description: data.description || '',
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      dueTime: data.dueTime || '12:00',
      priority: data.priority || 'Medium',
      status: 'Pending',
      type: data.type || 'FollowUp',
      assignedTo: assignedUser._id,
      assignedUserName: assignedUser.name,
      createdAt: new Date().toISOString()
    };
    store.tasks.unshift(newTask);
    saveStore(store);
    return newTask;
  },
  toggleTask: (id: string, status: string): Task => {
    const store = getStore();
    const task = store.tasks.find(t => t._id === id);
    if (!task) throw new Error('Task not found');
    task.status = status as any;
    if (status === 'Completed') {
      task.completedAt = new Date().toISOString();
    }
    saveStore(store);
    return task;
  },
  updateTask: (id: string, updates: Partial<Task>): Task => {
    const store = getStore();
    const idx = store.tasks.findIndex(t => t._id === id);
    if (idx === -1) throw new Error('Task not found');
    store.tasks[idx] = { ...store.tasks[idx], ...updates };
    saveStore(store);
    return store.tasks[idx];
  },
  deleteTask: (id: string): void => {
    const store = getStore();
    store.tasks = store.tasks.filter(t => t._id !== id);
    saveStore(store);
  },

  // Notifications
  getNotifications: (userId?: string): Notification[] => {
    const notifs = getStore().notifications;
    return userId ? notifs.filter(n => n.userId === userId) : notifs;
  },
  markNotificationRead: (id: string): void => {
    const store = getStore();
    const notif = store.notifications.find(n => n._id === id);
    if (notif) notif.read = true;
    saveStore(store);
  },
  markAllNotificationsRead: (userId?: string): void => {
    const store = getStore();
    store.notifications.forEach(n => {
      if (!userId || n.userId === userId) n.read = true;
    });
    saveStore(store);
  },

  // Stats & Analytics
  getDashboardStats: (): DashboardStats => {
    const store = getStore();
    const totalLeads = store.leads.length;
    const qualifiedLeads = store.leads.filter(l => l.status === 'Qualified').length;
    const customers = store.customers.length;
    const wonDeals = store.deals.filter(d => d.stage === 'Won').length;
    const lostDeals = store.deals.filter(d => d.stage === 'Lost').length;
    const activeDeals = store.deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length;
    const totalRevenue = store.deals.filter(d => d.stage === 'Won').reduce((acc, d) => acc + (d.value || 0), 0);
    const pendingFollowups = store.tasks.filter(t => t.status === 'Pending').length;
    const pipelineValue = store.deals.reduce((acc, d) => acc + (d.value || 0), 0);
    const convertedCount = store.leads.filter(l => l.status === 'Converted' || l.isConverted).length;
    const leadConversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

    const stages: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost', 'Converted'];
    const pipelineStages = stages.map(st => {
      const stageLeads = store.leads.filter(l => l.status === st);
      return {
        stage: st,
        count: stageLeads.length,
        value: stageLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0)
      };
    });

    return {
      totalLeads,
      qualifiedLeads,
      customers,
      activeDeals,
      wonDeals,
      lostDeals,
      totalRevenue,
      pendingFollowups,
      pipelineValue,
      leadConversionRate,
      pipelineStages
    };
  },

  getAnalytics: (): AnalyticsData => {
    const store = getStore();
    const leads = store.leads;
    const deals = store.deals;
    const users = store.users;

    const totalLeads = leads.length;
    const wonDeals = deals.filter(d => d.stage === 'Won');
    const lostDeals = deals.filter(d => d.stage === 'Lost');
    const activeDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
    const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const expectedRevenue = activeDeals.reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 0) / 100), 0);

    const sourceMap: Record<string, number> = {};
    leads.forEach(l => {
      sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
    });

    const bySource = Object.entries(sourceMap).map(([source, count]) => ({ source, count }));

    const stageMap: Record<string, { count: number; value: number }> = {};
    deals.forEach(d => {
      if (!stageMap[d.stage]) stageMap[d.stage] = { count: 0, value: 0 };
      stageMap[d.stage].count += 1;
      stageMap[d.stage].value += d.value || 0;
    });
    const byStage = Object.entries(stageMap).map(([stage, v]) => ({ stage, count: v.count, value: v.value }));

    const employeeStats = users.map(u => {
      const empLeads = leads.filter(l => l.assignedTo === u._id);
      const empDeals = deals.filter(d => d.assignedTo === u._id);
      const empWon = empDeals.filter(d => d.stage === 'Won');
      return {
        userId: u._id,
        userName: u.name,
        avatar: u.avatar,
        leadsAssigned: empLeads.length,
        qualifiedLeads: empLeads.filter(l => l.status === 'Qualified').length,
        dealsWon: empWon.length,
        dealsLost: empDeals.filter(d => d.stage === 'Lost').length,
        revenueGenerated: empWon.reduce((sum, d) => sum + (d.value || 0), 0)
      };
    });

    return {
      leadStats: {
        total: totalLeads,
        new: leads.filter(l => l.status === 'New').length,
        qualified: leads.filter(l => l.status === 'Qualified').length,
        won: leads.filter(l => l.status === 'Won').length,
        lost: leads.filter(l => l.status === 'Lost').length,
        converted: leads.filter(l => l.status === 'Converted' || l.isConverted).length,
        conversionRate: totalLeads > 0 ? Math.round((leads.filter(l => l.isConverted).length / totalLeads) * 100) : 0,
        bySource
      },
      dealStats: {
        total: deals.length,
        won: wonDeals.length,
        lost: lostDeals.length,
        active: activeDeals.length,
        totalRevenue,
        expectedRevenue,
        byStage,
        monthlyRevenue: [
          { month: 'May', revenue: 200000, dealsCount: 1 },
          { month: 'Jun', revenue: 350000, dealsCount: 2 },
          { month: 'Jul', revenue: 720000, dealsCount: 2 },
          { month: 'Aug', revenue: 450000, dealsCount: 1 }
        ]
      },
      employeeStats
    };
  }
};
