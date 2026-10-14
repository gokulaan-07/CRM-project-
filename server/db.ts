import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, IUser } from './models/User';
import { Lead, ILead } from './models/Lead';
import { Customer, ICustomer } from './models/Customer';
import { Deal, IDeal } from './models/Deal';
import { Activity, IActivity } from './models/Activity';
import { Task, ITask } from './models/Task';
import { Notification, INotification } from './models/Notification';
import { DashboardStats, AnalyticsData } from '../src/types';

let mongod: MongoMemoryServer | null = null;

function isValidMongoUri(uri?: string): boolean {
  if (!uri || typeof uri !== 'string') return false;
  const trimmed = uri.trim();
  return trimmed.startsWith('mongodb://') || trimmed.startsWith('mongodb+srv://');
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (isValidMongoUri(uri)) {
    const cleanUri = uri!.trim();
    console.log(`[MongoDB] Connecting to external MongoDB at ${cleanUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}...`);
    try {
      await mongoose.connect(cleanUri);
      console.log('[MongoDB] Successfully connected to external MongoDB');
      await seedDatabaseIfEmpty();
      return mongoose;
    } catch (err) {
      console.error('[MongoDB] Failed to connect to external MongoDB URI, falling back to embedded MongoDB:', err);
    }
  }

  // Standalone MongoDB Memory Server for self-contained, instant MERN execution
  console.log('[MongoDB] Starting embedded MongoDB server instance...');
  try {
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'crm_production'
      }
    });
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[MongoDB] Connected to embedded MongoDB successfully at ${memoryUri}`);
    await seedDatabaseIfEmpty();
  } catch (memErr) {
    console.error('[MongoDB] Embedded MongoDB start error:', memErr);
    throw memErr;
  }

  return mongoose;
}

export async function seedDatabaseIfEmpty(forceReset = false) {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0 && !forceReset) {
      return;
    }

    if (forceReset) {
      await Promise.all([
        User.deleteMany({}),
        Lead.deleteMany({}),
        Customer.deleteMany({}),
        Deal.deleteMany({}),
        Activity.deleteMany({}),
        Task.deleteMany({}),
        Notification.deleteMany({})
      ]);
    }

    console.log('[MongoDB] Seeding database with initial users, Rahul Kumar sales journey, and pipeline data...');

    // 1. Create Users with hashed passwords
    const userAdmin = await User.create({
      name: 'Gokulaan',
      email: 'gokulaan9c@gmail.com',
      password: 'password123',
      role: 'admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98765 43210',
      department: 'Sales & Management'
    });

    const userPriya = await User.create({
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      password: 'password123',
      role: 'sales',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98765 43211',
      department: 'Enterprise Sales'
    });

    const userArun = await User.create({
      name: 'Arun Patel',
      email: 'arun.patel@example.com',
      password: 'password123',
      role: 'sales',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98765 43212',
      department: 'Inside Sales'
    });

    const userAnanya = await User.create({
      name: 'Ananya Rao',
      email: 'ananya.rao@example.com',
      password: 'password123',
      role: 'sales',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98765 43213',
      department: 'Mid-Market Sales'
    });

    // 2. Pre-seed Customers
    const custRohit = await Customer.create({
      name: 'Rohit Singhania',
      company: 'Singhania Organic Foods',
      email: 'rohit@singhaniafoods.com',
      phone: '+91 98990 12345',
      status: 'VIP',
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name,
      totalValue: 450000,
      convertedAt: new Date('2026-08-01T11:00:00.000Z'),
      notes: 'Converted from Lead. Phase 1 delivery in progress.',
      address: '42 Commercial Street, Bangalore, Karnataka',
      industry: 'Food & Beverage'
    });

    const custVikram = await Customer.create({
      name: 'Vikram Mehta',
      company: 'Zenith Global Logistics',
      email: 'vikram@zenithlogistics.com',
      phone: '+91 99001 23456',
      status: 'Active',
      assignedTo: userPriya._id,
      assignedUserName: userPriya.name,
      totalValue: 500000,
      convertedAt: new Date('2026-07-10T14:30:00.000Z'),
      notes: 'Long-term enterprise customer. Annual support contract active.',
      address: 'Plot 18, BKC Complex, Mumbai, Maharashtra',
      industry: 'Supply Chain & Logistics'
    });

    const custSneha = await Customer.create({
      name: 'Sneha Kapoor',
      company: 'Kapoor Fashion Trends',
      email: 'sneha@kapoorfashion.in',
      phone: '+91 99112 34567',
      status: 'Active',
      assignedTo: userArun._id,
      assignedUserName: userArun.name,
      totalValue: 220000,
      convertedAt: new Date('2026-07-28T16:00:00.000Z'),
      notes: 'E-commerce platform launched successfully.',
      address: 'Connaught Place, New Delhi',
      industry: 'Retail & Fashion'
    });

    // 3. Create Leads (including the core Rahul Kumar walkthrough lead)
    const leadRahul = await Lead.create({
      name: 'Rahul Kumar',
      email: 'rahul.kumar@abctech.in',
      phone: '+91 98112 34567',
      company: 'ABC Technologies',
      source: 'Website',
      interest: 'E-commerce Website',
      status: 'Qualified',
      priority: 'High',
      estimatedValue: 200000,
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name,
      notes: 'Inquired for complete modern e-commerce web platform with payment integration, product catalog, and order management.',
      isConverted: false
    });

    const leadPriya = await Lead.create({
      name: 'Priya Desai',
      email: 'priya@boutiquestyle.com',
      phone: '+91 98223 45678',
      company: 'Priya Boutique',
      source: 'Referral',
      interest: 'Mobile App Development',
      status: 'Contacted',
      priority: 'Medium',
      estimatedValue: 100000,
      assignedTo: userPriya._id,
      assignedUserName: userPriya.name,
      notes: 'Needs iOS & Android boutique shopping application. First discovery call conducted.',
      isConverted: false
    });

    const leadArun = await Lead.create({
      name: 'Arun Deshmukh',
      email: 'arun@apexlogistics.in',
      phone: '+91 98334 56789',
      company: 'Apex Logistics',
      source: 'Advertisement',
      interest: 'CRM Integration & ERP',
      status: 'Qualified',
      priority: 'High',
      estimatedValue: 300000,
      assignedTo: userArun._id,
      assignedUserName: userArun.name,
      notes: 'Fleet management tracking & custom CRM modules. Budget pre-approved.',
      isConverted: false
    });

    const leadKarthik = await Lead.create({
      name: 'Karthik Menon',
      email: 'karthik@fintechsol.io',
      phone: '+91 98445 67890',
      company: 'Karthik FinTech',
      source: 'Social Media',
      interest: 'Financial Dashboard',
      status: 'Proposal',
      priority: 'Medium',
      estimatedValue: 150000,
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name,
      notes: 'Sent formal scope document and technical quotation for ₹1.5L. Awaiting review.',
      isConverted: false
    });

    const leadSuresh = await Lead.create({
      name: 'Suresh Nair',
      email: 'suresh@nairhealth.org',
      phone: '+91 98556 78901',
      company: 'Nair Healthcare',
      source: 'Phone',
      interest: 'Hospital Management System',
      status: 'Negotiation',
      priority: 'High',
      estimatedValue: 250000,
      assignedTo: userPriya._id,
      assignedUserName: userPriya.name,
      notes: 'In final discount negotiation. Client requested 5% waiver on annual maintenance.',
      isConverted: false
    });

    const leadAjay = await Lead.create({
      name: 'Ajay Verma',
      email: 'ajay@vermaproperties.in',
      phone: '+91 98667 89012',
      company: 'Verma Real Estate',
      source: 'Referral',
      interest: 'Property Listing Portal',
      status: 'Won',
      priority: 'High',
      estimatedValue: 300000,
      assignedTo: userArun._id,
      assignedUserName: userArun.name,
      notes: 'Proposal accepted and initial deposit agreed. Ready to convert to official customer!',
      isConverted: false
    });

    const leadDeepak = await Lead.create({
      name: 'Deepak Sharma',
      email: 'deepak@deepakauto.com',
      phone: '+91 98778 90123',
      company: 'Deepak Auto Works',
      source: 'Website',
      interest: 'Dealership Website & Booking',
      status: 'New',
      priority: 'Low',
      estimatedValue: 80000,
      assignedTo: userAnanya._id,
      assignedUserName: userAnanya.name,
      notes: 'Submitted contact form requesting simple dynamic catalog.',
      isConverted: false
    });

    const leadMeera = await Lead.create({
      name: 'Meera Iyer',
      email: 'meera@meeracloud.co',
      phone: '+91 98889 01234',
      company: 'Meera Cloud Solutions',
      source: 'Email',
      interest: 'Cloud Migration & Support',
      status: 'Lost',
      priority: 'Medium',
      estimatedValue: 120000,
      assignedTo: userAnanya._id,
      assignedUserName: userAnanya.name,
      notes: 'Client decided to build in-house with existing engineering team.',
      isConverted: false
    });

    const leadRohitConverted = await Lead.create({
      name: 'Rohit Singhania',
      email: 'rohit@singhaniafoods.com',
      phone: '+91 98990 12345',
      company: 'Singhania Organic Foods',
      source: 'Referral',
      interest: 'Food Delivery Portal & App',
      status: 'Converted',
      priority: 'High',
      estimatedValue: 450000,
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name,
      notes: 'Successfully won and converted to key corporate client.',
      isConverted: true,
      customerId: custRohit._id
    });

    // Update customer leadId
    custRohit.leadId = leadRohitConverted._id as any;
    await custRohit.save();

    // 4. Create Deals
    await Deal.create({
      title: 'E-commerce Platform Phase 1',
      customerId: custRohit._id,
      customerName: custRohit.company,
      leadId: leadRohitConverted._id,
      leadName: leadRohitConverted.name,
      value: 450000,
      stage: 'Won',
      probability: 100,
      expectedCloseDate: '2026-08-01',
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name,
      notes: 'Contract executed. ₹2,00,000 advance received.'
    });

    await Deal.create({
      title: 'Enterprise ERP Maintenance',
      customerId: custVikram._id,
      customerName: custVikram.company,
      value: 500000,
      stage: 'Won',
      probability: 100,
      expectedCloseDate: '2026-07-10',
      assignedTo: userPriya._id,
      assignedUserName: userPriya.name,
      notes: 'Annual renewal successful.'
    });

    await Deal.create({
      title: 'Fashion Store Web App',
      customerId: custSneha._id,
      customerName: custSneha.company,
      value: 220000,
      stage: 'Won',
      probability: 100,
      expectedCloseDate: '2026-07-28',
      assignedTo: userArun._id,
      assignedUserName: userArun.name,
      notes: 'Final payment cleared upon deployment.'
    });

    await Deal.create({
      title: 'E-commerce Website - ABC Tech',
      leadId: leadRahul._id,
      leadName: `${leadRahul.name} (${leadRahul.company})`,
      value: 200000,
      stage: 'Qualified',
      probability: 60,
      expectedCloseDate: '2026-08-30',
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name,
      notes: 'Requirement confirmed. Preparing formal proposal.'
    });

    await Deal.create({
      title: 'Hospital Management System',
      leadId: leadSuresh._id,
      leadName: `${leadSuresh.name} (${leadSuresh.company})`,
      value: 250000,
      stage: 'Negotiation',
      probability: 80,
      expectedCloseDate: '2026-08-28',
      assignedTo: userPriya._id,
      assignedUserName: userPriya.name,
      notes: 'Reviewing discount clause with management.'
    });

    await Deal.create({
      title: 'FinTech Dashboard & Analytics',
      leadId: leadKarthik._id,
      leadName: `${leadKarthik.name} (${leadKarthik.company})`,
      value: 150000,
      stage: 'Proposal',
      probability: 50,
      expectedCloseDate: '2026-09-05',
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name,
      notes: 'Technical specification sent for review.'
    });

    await Deal.create({
      title: 'Logistics Fleet & CRM ERP',
      leadId: leadArun._id,
      leadName: `${leadArun.name} (${leadArun.company})`,
      value: 300000,
      stage: 'Qualified',
      probability: 70,
      expectedCloseDate: '2026-09-10',
      assignedTo: userArun._id,
      assignedUserName: userArun.name,
      notes: 'Tech architecture meeting completed.'
    });

    // 5. Create Activities
    await Activity.create({
      leadId: leadRahul._id,
      leadName: leadRahul.name,
      type: 'Call',
      title: 'Introductory Discovery Call',
      description: 'Discussed website requirements, catalog size (~500 products), and preferred Razorpay/Stripe gateways.',
      performedBy: userAdmin._id,
      performedByName: userAdmin.name,
      timestamp: new Date('2026-08-21T11:00:00.000Z'),
      outcome: 'Requirement understood. Client has realistic budget.'
    });

    await Activity.create({
      leadId: leadRahul._id,
      leadName: leadRahul.name,
      type: 'StatusChange',
      title: 'Lead Qualified',
      description: 'Status changed from Contacted to Qualified after confirming requirements & budget of ₹2,00,000.',
      performedBy: userAdmin._id,
      performedByName: userAdmin.name,
      timestamp: new Date('2026-08-24T14:15:00.000Z')
    });

    await Activity.create({
      leadId: leadSuresh._id,
      leadName: leadSuresh.name,
      type: 'Meeting',
      title: 'Executive Proposal Presentation',
      description: 'Presented system architecture demo with hospital OPD & billing workflows.',
      performedBy: userPriya._id,
      performedByName: userPriya.name,
      timestamp: new Date('2026-08-23T15:00:00.000Z'),
      outcome: 'Client impressed. Moved to negotiation stage.'
    });

    await Activity.create({
      leadId: leadKarthik._id,
      leadName: leadKarthik.name,
      type: 'Email',
      title: 'Quotation & Scope Sent',
      description: 'Sent detailed PDF breakdown for ₹1,50,000 fixed price milestone plan.',
      performedBy: userAdmin._id,
      performedByName: userAdmin.name,
      timestamp: new Date('2026-08-24T10:00:00.000Z')
    });

    await Activity.create({
      customerId: custRohit._id,
      customerName: custRohit.company,
      type: 'Meeting',
      title: 'Kickoff Sprint Planning',
      description: 'Finalized database schema and UI wireframes for customer portal.',
      performedBy: userAdmin._id,
      performedByName: userAdmin.name,
      timestamp: new Date('2026-08-10T14:00:00.000Z')
    });

    // 6. Create Tasks / Follow-ups
    await Task.create({
      leadId: leadRahul._id,
      leadName: leadRahul.name,
      title: 'Send formal quotation for E-commerce Website',
      description: 'Prepare detailed module scope and pricing breakdown (₹2L) for Rahul.',
      dueDate: '2026-08-26',
      dueTime: '11:00 AM',
      priority: 'High',
      status: 'Pending',
      type: 'FollowUp',
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name
    });

    await Task.create({
      leadId: leadSuresh._id,
      leadName: leadSuresh.name,
      title: 'Final pricing negotiation call',
      description: 'Call Dr. Suresh regarding 5% discount approval and SLA agreement.',
      dueDate: '2026-08-27',
      dueTime: '03:30 PM',
      priority: 'High',
      status: 'Pending',
      type: 'Call',
      assignedTo: userPriya._id,
      assignedUserName: userPriya.name
    });

    await Task.create({
      leadId: leadPriya._id,
      leadName: leadPriya.name,
      title: 'Follow-up on mobile app wireframe questions',
      description: 'Check if Priya reviewed the sample boutique app UI sketches.',
      dueDate: '2026-08-28',
      dueTime: '02:00 PM',
      priority: 'Medium',
      status: 'Pending',
      type: 'FollowUp',
      assignedTo: userPriya._id,
      assignedUserName: userPriya.name
    });

    await Task.create({
      leadId: leadArun._id,
      leadName: leadArun.name,
      title: 'Schedule technical deep-dive meeting',
      description: 'Coordinate with lead developer for logistics API discussion.',
      dueDate: '2026-08-29',
      dueTime: '10:30 AM',
      priority: 'Medium',
      status: 'Pending',
      type: 'Meeting',
      assignedTo: userArun._id,
      assignedUserName: userArun.name
    });

    await Task.create({
      customerId: custRohit._id,
      customerName: custRohit.company,
      title: 'Client Sprint review & feedback checkpoint',
      description: 'Review checkout flow demo with Rohit Singhania.',
      dueDate: '2026-08-30',
      dueTime: '04:00 PM',
      priority: 'High',
      status: 'Pending',
      type: 'Meeting',
      assignedTo: userAdmin._id,
      assignedUserName: userAdmin.name
    });

    // 7. Create Notifications
    await Notification.create({
      userId: userAdmin._id,
      title: 'New Lead Assigned: Deepak Sharma',
      message: 'A new web lead for Dealership Website has been logged.',
      type: 'lead',
      read: false
    });

    await Notification.create({
      userId: userAdmin._id,
      title: 'Upcoming Follow-up: Rahul Kumar',
      message: 'Quotation delivery scheduled for Rahul Kumar (ABC Technologies).',
      type: 'task',
      read: false
    });

    await Notification.create({
      userId: userArun._id,
      title: 'Deal Won: Ajay Verma',
      message: 'Verma Real Estate accepted proposal (₹3,00,000)! Ready to convert to customer.',
      type: 'deal',
      read: false
    });

    console.log('[MongoDB] Database seeding completed successfully!');
  } catch (error) {
    console.error('[MongoDB] Error during database seeding:', error);
  }
}

// CRM Business Operations directly using Mongoose & MongoDB

export async function convertLeadToCustomer(leadId: string, currentUserId: string): Promise<{ customer: any; lead: any }> {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    throw new Error('Lead not found');
  }

  // Prevent duplicate conversion
  if (lead.isConverted && lead.customerId) {
    const existingCust = await Customer.findById(lead.customerId);
    if (existingCust) {
      return { customer: existingCust.toJSON(), lead: lead.toJSON() };
    }
  }

  const assignedUser = await User.findById(lead.assignedTo);
  const now = new Date();

  // 1. Create Customer
  const newCustomer = await Customer.create({
    leadId: lead._id,
    name: lead.name,
    company: lead.company || lead.name,
    email: lead.email,
    phone: lead.phone,
    status: 'Active',
    assignedTo: lead.assignedTo,
    assignedUserName: assignedUser?.name || lead.assignedUserName || 'Sales Team',
    totalValue: lead.estimatedValue,
    convertedAt: now,
    notes: `Converted from Lead: ${lead.interest}. Notes: ${lead.notes}`,
    industry: 'Enterprise Technology'
  });

  // 2. Mark Lead as Converted (Preserve Lead Record!)
  lead.status = 'Converted';
  lead.isConverted = true;
  lead.customerId = newCustomer._id as any;
  await lead.save();

  // 3. Link/Update Deals
  const updatedDeals = await Deal.find({ leadId: lead._id });
  if (updatedDeals.length > 0) {
    await Deal.updateMany(
      { leadId: lead._id },
      {
        $set: {
          customerId: newCustomer._id,
          customerName: newCustomer.company,
          stage: 'Won',
          probability: 100
        }
      }
    );
  } else if (lead.estimatedValue > 0) {
    // Create new Won deal if none existed
    await Deal.create({
      title: `${lead.interest} - Contract`,
      customerId: newCustomer._id,
      customerName: newCustomer.company,
      leadId: lead._id,
      leadName: lead.name,
      value: lead.estimatedValue,
      stage: 'Won',
      probability: 100,
      expectedCloseDate: now.toISOString().split('T')[0],
      assignedTo: lead.assignedTo,
      assignedUserName: lead.assignedUserName,
      notes: 'Deal closed upon lead conversion.'
    });
  }

  // 4. Link activities and tasks to customer
  await Activity.updateMany(
    { leadId: lead._id },
    {
      $set: {
        customerId: newCustomer._id,
        customerName: newCustomer.company
      }
    }
  );

  await Task.updateMany(
    { leadId: lead._id },
    {
      $set: {
        customerId: newCustomer._id,
        customerName: newCustomer.company
      }
    }
  );

  // 5. Record conversion activity in MongoDB
  const performer = await User.findById(currentUserId);
  await Activity.create({
    leadId: lead._id,
    leadName: lead.name,
    customerId: newCustomer._id,
    customerName: newCustomer.company,
    type: 'StatusChange',
    title: 'Converted to Customer 🎉',
    description: `Lead ${lead.name} (${lead.company}) successfully closed and converted to Customer with value ₹${lead.estimatedValue.toLocaleString('en-IN')}.`,
    performedBy: performer ? performer._id : lead.assignedTo,
    performedByName: performer ? performer.name : 'Sales Team',
    timestamp: now
  });

  // 6. Notify assigned salesperson
  await Notification.create({
    userId: lead.assignedTo,
    title: `🎉 Deal Won & Converted: ${lead.name}`,
    message: `${lead.name} has been officially converted into a Customer! Total Value: ₹${lead.estimatedValue.toLocaleString('en-IN')}`,
    type: 'conversion',
    read: false
  });

  return {
    customer: newCustomer.toJSON(),
    lead: lead.toJSON()
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [leads, customers, deals, tasks] = await Promise.all([
    Lead.find({}).lean(),
    Customer.find({}).lean(),
    Deal.find({}).lean(),
    Task.find({}).lean()
  ]);

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l =>
    ['Qualified', 'Proposal', 'Negotiation', 'Won', 'Converted'].includes(l.status)
  ).length;

  const activeDeals = deals.filter(d => ['Qualified', 'Proposal', 'Negotiation'].includes(d.stage)).length;
  const wonDeals = deals.filter(d => d.stage === 'Won').length;
  const lostDeals = deals.filter(d => d.stage === 'Lost').length;

  const totalRevenue = deals
    .filter(d => d.stage === 'Won')
    .reduce((sum, d) => sum + (d.value || 0), 0);

  const pendingFollowups = tasks.filter(t => t.status === 'Pending').length;

  const pipelineValue = leads
    .filter(l => l.status !== 'Lost')
    .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

  const wonAndConvertedCount = leads.filter(l => l.status === 'Won' || l.status === 'Converted').length;
  const leadConversionRate = totalLeads > 0 ? Math.round((wonAndConvertedCount / totalLeads) * 100) : 0;

  const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost', 'Converted'];
  const pipelineStages = stages.map(st => {
    const matching = leads.filter(l => l.status === st);
    return {
      stage: st as any,
      count: matching.length,
      value: matching.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)
    };
  });

  return {
    totalLeads,
    qualifiedLeads,
    customers: customers.length,
    activeDeals,
    wonDeals,
    lostDeals,
    totalRevenue,
    pendingFollowups,
    pipelineValue,
    leadConversionRate,
    pipelineStages
  };
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const [leads, deals, users] = await Promise.all([
    Lead.find({}).lean(),
    Deal.find({}).lean(),
    User.find({}).lean()
  ]);

  // Sources breakdown
  const sourceCounts: Record<string, number> = {};
  leads.forEach(l => {
    const src = l.source || 'Other';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });
  const bySource = Object.entries(sourceCounts).map(([source, count]) => ({ source, count }));

  // Stages breakdown for deals
  const dealStagesList = ['Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  const byStage = dealStagesList.map(st => {
    const matching = deals.filter(d => d.stage === st);
    return {
      stage: st,
      count: matching.length,
      value: matching.reduce((sum, d) => sum + (d.value || 0), 0)
    };
  });

  const wonDeals = deals.filter(d => d.stage === 'Won');
  const lostDeals = deals.filter(d => d.stage === 'Lost');
  const activeDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const expectedRevenue = activeDeals.reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 50) / 100), 0);

  const monthlyRevenue = [
    { month: 'May 2026', revenue: 380000, dealsCount: 2 },
    { month: 'Jun 2026', revenue: 450000, dealsCount: 3 },
    { month: 'Jul 2026', revenue: 720000, dealsCount: 4 },
    { month: 'Aug 2026', revenue: totalRevenue, dealsCount: wonDeals.length }
  ];

  const employeeStats = users.map(u => {
    const uIdStr = u._id.toString();
    const assignedLeads = leads.filter(l => l.assignedTo?.toString() === uIdStr);
    const userDeals = deals.filter(d => d.assignedTo?.toString() === uIdStr);
    const userWon = userDeals.filter(d => d.stage === 'Won');
    const userLost = userDeals.filter(d => d.stage === 'Lost');
    const userQualified = assignedLeads.filter(l => ['Qualified', 'Proposal', 'Negotiation', 'Won', 'Converted'].includes(l.status));
    const revenue = userWon.reduce((sum, d) => sum + (d.value || 0), 0);

    return {
      userId: uIdStr,
      userName: u.name,
      avatar: u.avatar,
      leadsAssigned: assignedLeads.length,
      qualifiedLeads: userQualified.length,
      dealsWon: userWon.length,
      dealsLost: userLost.length,
      revenueGenerated: revenue
    };
  }).sort((a, b) => b.revenueGenerated - a.revenueGenerated);

  const wonCount = leads.filter(l => l.status === 'Won' || l.status === 'Converted').length;

  return {
    leadStats: {
      total: leads.length,
      new: leads.filter(l => l.status === 'New').length,
      qualified: leads.filter(l => ['Qualified', 'Proposal', 'Negotiation', 'Won', 'Converted'].includes(l.status)).length,
      won: leads.filter(l => l.status === 'Won').length,
      lost: leads.filter(l => l.status === 'Lost').length,
      converted: leads.filter(l => l.status === 'Converted').length,
      conversionRate: leads.length > 0 ? Math.round((wonCount / leads.length) * 100) : 0,
      bySource
    },
    dealStats: {
      total: deals.length,
      won: wonDeals.length,
      lost: lostDeals.length,
      active: activeDeals.length,
      totalRevenue,
      expectedRevenue: Math.round(expectedRevenue),
      byStage,
      monthlyRevenue
    },
    employeeStats
  };
}
