import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { connectToDatabase, seedDatabaseIfEmpty, convertLeadToCustomer, getDashboardStats, getAnalytics } from './server/db';
import { User } from './server/models/User';
import { Lead } from './server/models/Lead';
import { Customer } from './server/models/Customer';
import { Deal } from './server/models/Deal';
import { Activity } from './server/models/Activity';
import { Task } from './server/models/Task';
import { Notification } from './server/models/Notification';
import { generateToken, authMiddleware, requireRole, AuthRequest } from './server/auth';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Connect to Real MongoDB (External MongoDB or Embedded Mongo Server)
  await connectToDatabase();

  app.use(express.json());

  // Request logger for API calls
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[MongoDB API] ${req.method} ${req.path}`);
    }
    next();
  });

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      database: 'MongoDB (Mongoose)',
      time: new Date().toISOString()
    });
  });

  // Database Seed / Reset
  app.post('/api/seed/reset', async (req, res) => {
    try {
      await seedDatabaseIfEmpty(true);
      res.json({ message: 'MongoDB database reset to initial walkthrough seed data successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // AUTHENTICATION & TEAM MANAGEMENT
  // ==========================================

  // Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, role, phone, department, avatar } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'sales',
        phone: phone || '',
        department: department || 'Sales',
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });

      const token = generateToken(user);
      res.status(201).json({
        token,
        user: user.toJSON()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Login with Password & JWT
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({ error: 'Account is inactive. Please contact administrator.' });
      }

      const token = generateToken(user);
      res.json({
        token,
        user: user.toJSON()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Fast Login / Role Switch for testing (issues JWT for chosen sales rep / admin)
  app.post('/api/auth/switch-user', async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const token = generateToken(user);
      res.json({
        token,
        user: user.toJSON()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Current User Profile (JWT Protected)
  app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res) => {
    res.json(req.user?.toJSON());
  });

  // Get all users
  app.get('/api/users', async (req, res) => {
    try {
      const users = await User.find({}).sort({ createdAt: 1 });
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/users', authMiddleware, requireRole('admin'), async (req: AuthRequest, res) => {
    try {
      const { name, email, password, role, phone, department, avatar } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      const user = await User.create({
        name,
        email,
        password: password || 'password123',
        role: role || 'sales',
        status: 'active',
        phone: phone || '',
        department: department || 'Sales',
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });

      res.status(201).json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/users/:id/status', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
      const { status, role } = req.body;
      const updates: any = {};
      if (status) updates.status = status;
      if (role) updates.role = role;

      const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // LEADS & KANBAN PIPELINE
  // ==========================================

  app.get('/api/leads', async (req, res) => {
    try {
      const leads = await Lead.find({}).sort({ createdAt: -1 });
      res.json(leads);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/leads/:id', async (req, res) => {
    try {
      const lead = await Lead.findById(req.params.id);
      if (!lead) return res.status(404).json({ error: 'Lead not found' });
      res.json(lead);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/leads', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const currentUserId = req.user?._id;
      const { name, email, phone, company, source, interest, status, priority, estimatedValue, assignedTo, notes } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Lead name is required' });
      }

      const assignedUserId = assignedTo || currentUserId;
      const assignedUser = await User.findById(assignedUserId);

      const newLead = await Lead.create({
        name,
        email: email || '',
        phone: phone || '',
        company: company || '',
        source: source || 'Website',
        interest: interest || 'General Inquiry',
        status: status || 'New',
        priority: priority || 'Medium',
        estimatedValue: Number(estimatedValue) || 0,
        assignedTo: assignedUserId,
        assignedUserName: assignedUser ? assignedUser.name : 'Unassigned',
        notes: notes || '',
        isConverted: false
      });

      // Auto-create initial Deal opportunity if lead has positive estimated value
      if (newLead.estimatedValue > 0) {
        const dealStage = newLead.status === 'Won' ? 'Won' 
          : newLead.status === 'Negotiation' ? 'Negotiation'
          : newLead.status === 'Proposal' ? 'Proposal'
          : 'Qualified';

        await Deal.create({
          title: `${newLead.interest} - ${newLead.company || newLead.name}`,
          leadId: newLead._id,
          leadName: `${newLead.name} (${newLead.company || 'Individual'})`,
          value: newLead.estimatedValue,
          stage: dealStage,
          probability: dealStage === 'Won' ? 100 : dealStage === 'Negotiation' ? 80 : dealStage === 'Proposal' ? 50 : 30,
          expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          assignedTo: newLead.assignedTo,
          assignedUserName: newLead.assignedUserName,
          notes: `Auto-linked deal created for lead ${newLead.name}`
        });
      }

      // Log Lead Created Activity
      await Activity.create({
        leadId: newLead._id,
        leadName: newLead.name,
        type: 'Note',
        title: 'Lead Created',
        description: `New lead added with source: ${newLead.source}, estimated value: ₹${newLead.estimatedValue.toLocaleString('en-IN')}`,
        performedBy: currentUserId,
        performedByName: req.user?.name || 'Sales Team',
        timestamp: new Date()
      });

      // Create notification
      await Notification.create({
        userId: newLead.assignedTo,
        title: `New Lead Assigned: ${newLead.name}`,
        message: `You were assigned lead "${newLead.name}" (${newLead.company}) for ${newLead.interest}.`,
        type: 'lead',
        read: false
      });

      res.status(201).json(newLead);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/leads/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const oldLead = await Lead.findById(req.params.id);
      if (!oldLead) return res.status(404).json({ error: 'Lead not found' });

      const updates = { ...req.body };
      if (updates.assignedTo && updates.assignedTo !== oldLead.assignedTo.toString()) {
        const assignedUser = await User.findById(updates.assignedTo);
        if (assignedUser) {
          updates.assignedUserName = assignedUser.name;
        }
      }

      const updatedLead = await Lead.findByIdAndUpdate(req.params.id, updates, { new: true });

      // If status changed, record status change activity
      if (updates.status && updates.status !== oldLead.status) {
        await Activity.create({
          leadId: updatedLead!._id,
          leadName: updatedLead!.name,
          type: 'StatusChange',
          title: `Status Changed to ${updates.status}`,
          description: `Lead moved from "${oldLead.status}" to "${updates.status}".`,
          performedBy: req.user?._id || updatedLead!.assignedTo,
          performedByName: req.user?.name || 'Sales Team',
          timestamp: new Date()
        });

        // Sync Deal stage
        const dealStage = updates.status === 'Won' ? 'Won'
          : updates.status === 'Lost' ? 'Lost'
          : updates.status === 'Negotiation' ? 'Negotiation'
          : updates.status === 'Proposal' ? 'Proposal'
          : updates.status === 'Qualified' ? 'Qualified'
          : null;

        if (dealStage) {
          await Deal.updateMany(
            { leadId: updatedLead!._id },
            {
              $set: {
                stage: dealStage,
                probability: dealStage === 'Won' ? 100 : dealStage === 'Lost' ? 0 : dealStage === 'Negotiation' ? 80 : dealStage === 'Proposal' ? 50 : 30
              }
            }
          );
        }
      }

      res.json(updatedLead);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/leads/:id/status', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'Status is required' });

      const oldLead = await Lead.findById(req.params.id);
      if (!oldLead) return res.status(404).json({ error: 'Lead not found' });

      const updatedLead = await Lead.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      // Record Activity
      await Activity.create({
        leadId: updatedLead!._id,
        leadName: updatedLead!.name,
        type: 'StatusChange',
        title: `Pipeline Stage: ${status}`,
        description: `Lead moved from "${oldLead.status}" to "${status}".`,
        performedBy: req.user?._id || updatedLead!.assignedTo,
        performedByName: req.user?.name || 'Sales Team',
        timestamp: new Date()
      });

      // Update connected deal
      if (['Won', 'Lost', 'Negotiation', 'Proposal', 'Qualified'].includes(status)) {
        await Deal.updateMany(
          { leadId: updatedLead!._id },
          {
            $set: {
              stage: status,
              probability: status === 'Won' ? 100 : status === 'Lost' ? 0 : status === 'Negotiation' ? 80 : status === 'Proposal' ? 50 : 30
            }
          }
        );
      }

      res.json(updatedLead);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // CORE RULE: Convert Won Lead to Customer in MongoDB
  app.post('/api/leads/:id/convert', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const currentUserId = req.user?._id?.toString() || '';
      const result = await convertLeadToCustomer(req.params.id, currentUserId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/leads/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
      const deleted = await Lead.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Lead not found' });
      res.json({ message: 'Lead deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // CUSTOMERS
  // ==========================================

  app.get('/api/customers', async (req, res) => {
    try {
      const customers = await Customer.find({}).sort({ convertedAt: -1, createdAt: -1 });
      res.json(customers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/customers/:id', async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      res.json(customer);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/customers', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { name, company, email, phone, status, assignedTo, totalValue, notes, address, industry } = req.body;
      if (!name) return res.status(400).json({ error: 'Customer name is required' });

      const assignedUserId = assignedTo || req.user?._id;
      const assignedUser = await User.findById(assignedUserId);

      const newCustomer = await Customer.create({
        name,
        company: company || name,
        email: email || '',
        phone: phone || '',
        status: status || 'Active',
        assignedTo: assignedUserId,
        assignedUserName: assignedUser ? assignedUser.name : 'Sales Team',
        totalValue: Number(totalValue) || 0,
        notes: notes || '',
        address: address || '',
        industry: industry || 'Technology',
        convertedAt: new Date()
      });

      res.status(201).json(newCustomer);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/customers/:id', authMiddleware, async (req, res) => {
    try {
      const updates = { ...req.body };
      if (updates.assignedTo) {
        const assignedUser = await User.findById(updates.assignedTo);
        if (assignedUser) updates.assignedUserName = assignedUser.name;
      }
      const updated = await Customer.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!updated) return res.status(404).json({ error: 'Customer not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // DEALS
  // ==========================================

  app.get('/api/deals', async (req, res) => {
    try {
      const deals = await Deal.find({}).sort({ createdAt: -1 });
      res.json(deals);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/deals', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { title, customerId, leadId, value, stage, probability, expectedCloseDate, assignedTo, notes } = req.body;
      if (!title) return res.status(400).json({ error: 'Deal title is required' });

      let leadName = '';
      let customerName = '';

      if (leadId) {
        const l = await Lead.findById(leadId);
        if (l) leadName = l.name;
      }
      if (customerId) {
        const c = await Customer.findById(customerId);
        if (c) customerName = c.company || c.name;
      }

      const assignedUserId = assignedTo || req.user?._id;
      const assignedUser = await User.findById(assignedUserId);

      const dealStage = stage || 'Qualified';
      const prob = probability !== undefined ? Number(probability)
        : dealStage === 'Won' ? 100 : dealStage === 'Lost' ? 0 : dealStage === 'Negotiation' ? 80 : dealStage === 'Proposal' ? 50 : 30;

      const newDeal = await Deal.create({
        title,
        customerId: customerId || null,
        customerName,
        leadId: leadId || null,
        leadName,
        value: Number(value) || 0,
        stage: dealStage,
        probability: prob,
        expectedCloseDate: expectedCloseDate || new Date().toISOString().split('T')[0],
        assignedTo: assignedUserId,
        assignedUserName: assignedUser ? assignedUser.name : 'Sales Team',
        notes: notes || ''
      });

      res.status(201).json(newDeal);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/deals/:id', authMiddleware, async (req, res) => {
    try {
      const updates = { ...req.body };
      if (updates.assignedTo) {
        const assignedUser = await User.findById(updates.assignedTo);
        if (assignedUser) updates.assignedUserName = assignedUser.name;
      }
      if (updates.stage) {
        if (updates.stage === 'Won') updates.probability = 100;
        else if (updates.stage === 'Lost') updates.probability = 0;
      }
      const updated = await Deal.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!updated) return res.status(404).json({ error: 'Deal not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/deals/:id/stage', authMiddleware, async (req, res) => {
    try {
      const { stage } = req.body;
      const probability = stage === 'Won' ? 100 : stage === 'Lost' ? 0 : stage === 'Negotiation' ? 80 : stage === 'Proposal' ? 50 : 30;
      const updated = await Deal.findByIdAndUpdate(req.params.id, { stage, probability }, { new: true });
      if (!updated) return res.status(404).json({ error: 'Deal not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/deals/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
      const deleted = await Deal.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Deal not found' });
      res.json({ message: 'Deal deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // ACTIVITIES & COMMUNICATION TIMELINE
  // ==========================================

  app.get('/api/activities', async (req, res) => {
    try {
      const { leadId, customerId, type } = req.query as { leadId?: string; customerId?: string; type?: string };
      const filter: any = {};
      if (leadId) filter.leadId = leadId;
      if (customerId) filter.customerId = customerId;
      if (type) filter.type = type;

      const activities = await Activity.find(filter).sort({ timestamp: -1, createdAt: -1 });
      res.json(activities);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/activities', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { leadId, customerId, dealId, type, title, description, outcome, timestamp } = req.body;
      if (!title || !type) {
        return res.status(400).json({ error: 'Title and type are required' });
      }

      let leadName = '';
      let customerName = '';

      if (leadId) {
        const l = await Lead.findById(leadId);
        if (l) leadName = l.name;
      }
      if (customerId) {
        const c = await Customer.findById(customerId);
        if (c) customerName = c.company || c.name;
      }

      const performer = req.user;

      const act = await Activity.create({
        leadId: leadId || null,
        leadName,
        customerId: customerId || null,
        customerName,
        dealId: dealId || null,
        type,
        title,
        description: description || '',
        outcome: outcome || '',
        performedBy: performer?._id,
        performedByName: performer?.name || 'Sales Team',
        timestamp: timestamp ? new Date(timestamp) : new Date()
      });

      res.status(201).json(act);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // TASKS & FOLLOW-UPS
  // ==========================================

  app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await Task.find({}).sort({ status: 1, dueDate: 1 });
      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tasks', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { leadId, customerId, dealId, title, description, dueDate, dueTime, priority, type, assignedTo } = req.body;
      if (!title || !dueDate) {
        return res.status(400).json({ error: 'Title and due date are required' });
      }

      let leadName = '';
      let customerName = '';

      if (leadId) {
        const l = await Lead.findById(leadId);
        if (l) leadName = l.name;
      }
      if (customerId) {
        const c = await Customer.findById(customerId);
        if (c) customerName = c.company || c.name;
      }

      const assignedUserId = assignedTo || req.user?._id;
      const assignedUser = await User.findById(assignedUserId);

      const newTask = await Task.create({
        leadId: leadId || null,
        leadName,
        customerId: customerId || null,
        customerName,
        dealId: dealId || null,
        title,
        description: description || '',
        dueDate,
        dueTime: dueTime || '10:00 AM',
        priority: priority || 'Medium',
        status: 'Pending',
        type: type || 'FollowUp',
        assignedTo: assignedUserId,
        assignedUserName: assignedUser ? assignedUser.name : 'Sales Team'
      });

      res.status(201).json(newTask);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/tasks/:id/toggle', authMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      const updates: any = { status: status || 'Completed' };
      if (status === 'Completed') {
        updates.completedAt = new Date();
      } else {
        updates.completedAt = null;
      }

      const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json(task);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
    try {
      const updates = { ...req.body };
      if (updates.assignedTo) {
        const assignedUser = await User.findById(updates.assignedTo);
        if (assignedUser) updates.assignedUserName = assignedUser.name;
      }
      const updated = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!updated) return res.status(404).json({ error: 'Task not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
    try {
      const deleted = await Task.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Task not found' });
      res.json({ message: 'Task deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  app.get('/api/notifications', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const targetUserId = (typeof req.query.userId === 'string' ? req.query.userId : null) || (req.user?._id ? req.user._id.toString() : null);
      const filter: any = {};
      if (targetUserId) {
        filter.userId = targetUserId;
      }
      const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(20);
      res.json(notifications);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/notifications/:id/read', authMiddleware, async (req, res) => {
    try {
      await Notification.findByIdAndUpdate(req.params.id, { read: true });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/notifications/read-all', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const userId = req.body.userId || req.user?._id;
      await Notification.updateMany({ userId }, { $set: { read: true } });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // DASHBOARD & ANALYTICS (Real MongoDB aggregations)
  // ==========================================

  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const stats = await getDashboardStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/analytics', async (req, res) => {
    try {
      const analytics = await getAnalytics();
      res.json(analytics);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for dev / static files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CRM MERN Application running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start CRM server:', err);
  process.exit(1);
});
