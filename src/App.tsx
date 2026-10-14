import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { LeadsList } from './components/leads/LeadsList';
import { LeadPipeline } from './components/leads/LeadPipeline';
import { LeadModal } from './components/leads/LeadModal';
import { LeadDetailsModal } from './components/leads/LeadDetailsModal';
import { CustomersList } from './components/customers/CustomersList';
import { CustomerDetailsModal } from './components/customers/CustomerDetailsModal';
import { DealsList } from './components/deals/DealsList';
import { DealModal } from './components/deals/DealModal';
import { FollowUpsList } from './components/activities/FollowUpsList';
import { TaskModal } from './components/activities/TaskModal';
import { CommunicationTimeline } from './components/activities/CommunicationTimeline';
import { CalendarView } from './components/activities/CalendarView';
import { AnalyticsReports } from './components/analytics/AnalyticsReports';
import { SettingsView } from './components/settings/SettingsView';
import { WorkflowGuideModal } from './components/workflow/WorkflowGuideModal';
import { LoginPage } from './components/auth/LoginPage';
import { api } from './services/api';
import { Lead, Customer, Deal, Activity, Task } from './types';
import { Loader2 } from 'lucide-react';

function CRMApp() {
  const { currentUser, loading: authLoading, users } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Application Data States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Modals
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<Lead | null>(null);

  const [selectedCustomerForDetails, setSelectedCustomerForDetails] = useState<Customer | null>(null);

  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskDefaultLead, setTaskDefaultLead] = useState<Lead | null>(null);

  const fetchData = async () => {
    try {
      const [leadsRes, custsRes, dealsRes, actsRes, tasksRes] = await Promise.all([
        api.getLeads(),
        api.getCustomers(),
        api.getDeals(),
        api.getActivities(),
        api.getTasks()
      ]);
      const safeLeads = Array.isArray(leadsRes) ? leadsRes : [];
      const safeCusts = Array.isArray(custsRes) ? custsRes : [];
      const safeDeals = Array.isArray(dealsRes) ? dealsRes : [];
      const safeActs = Array.isArray(actsRes) ? actsRes : [];
      const safeTasks = Array.isArray(tasksRes) ? tasksRes : [];

      setLeads(safeLeads);
      setCustomers(safeCusts);
      setDeals(safeDeals);
      setActivities(safeActs);
      setTasks(safeTasks);

      // If a lead or customer is currently viewed in modal, update its reference
      if (selectedLeadForDetails) {
        const updated = safeLeads.find(l => l._id === selectedLeadForDetails._id);
        if (updated) setSelectedLeadForDetails(updated);
      }
      if (selectedCustomerForDetails) {
        const updated = safeCusts.find(c => c._id === selectedCustomerForDetails._id);
        if (updated) setSelectedCustomerForDetails(updated);
      }
    } catch (err) {
      console.error('Error fetching CRM data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  const openNewLead = () => {
    setLeadToEdit(null);
    setIsLeadModalOpen(true);
  };

  const openEditLead = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsLeadModalOpen(true);
  };

  const openNewDeal = () => {
    setDealToEdit(null);
    setIsDealModalOpen(true);
  };

  const openEditDeal = (deal: Deal) => {
    setDealToEdit(deal);
    setIsDealModalOpen(true);
  };

  const openNewTask = (forLead?: Lead) => {
    setTaskToEdit(null);
    setTaskDefaultLead(forLead || null);
    setIsTaskModalOpen(true);
  };

  const openEditTask = (task: Task) => {
    setTaskToEdit(task);
    setTaskDefaultLead(null);
    setIsTaskModalOpen(true);
  };

  const handleStartWorkflowWalkthrough = () => {
    // Switch to leads list and open details for Rahul
    const rahul = leads.find(l => l._id === 'lead-rahul') || leads[0];
    if (rahul) {
      setActiveTab('leads');
      setSelectedLeadForDetails(rahul);
    }
  };

  // If verifying authentication session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading CRM workspace...</p>
      </div>
    );
  }

  // If unauthenticated, show dedicated CRM Login Portal
  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        leadsCount={leads.length}
        customersCount={customers.length}
        dealsCount={deals.length}
        pendingTasksCount={tasks.filter(t => t.status === 'Pending').length}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onOpenWorkflowGuide={() => setIsWorkflowModalOpen(true)}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navigation */}
        <Navbar
          onOpenWorkflowGuide={() => setIsWorkflowModalOpen(true)}
          onOpenNewLead={openNewLead}
          onOpenNewDeal={openNewDeal}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          tasks={tasks}
          onRefreshData={fetchData}
        />

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/60">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm">Connecting to CRM Database & Services...</p>
              </div>
            ) : (
              <>
                {/* 1. Dashboard */}
                {activeTab === 'dashboard' && (
                  <Dashboard
                    leads={leads}
                    customers={customers}
                    deals={deals}
                    activities={activities}
                    tasks={tasks}
                    onNavigate={setActiveTab}
                    onOpenNewLead={openNewLead}
                    onOpenLeadDetails={lead => setSelectedLeadForDetails(lead)}
                    onOpenCustomerDetails={cust => setSelectedCustomerForDetails(cust)}
                    onOpenWorkflowGuide={() => setIsWorkflowModalOpen(true)}
                  />
                )}

                {/* 2. Leads List */}
                {activeTab === 'leads' && (
                  <LeadsList
                    leads={leads}
                    onOpenNewLead={openNewLead}
                    onOpenEditLead={openEditLead}
                    onOpenLeadDetails={lead => setSelectedLeadForDetails(lead)}
                    onOpenPipeline={() => setActiveTab('pipeline')}
                    onRefreshData={fetchData}
                  />
                )}

                {/* 3. Lead Pipeline Kanban */}
                {activeTab === 'pipeline' && (
                  <LeadPipeline
                    leads={leads}
                    onOpenNewLead={openNewLead}
                    onOpenLeadDetails={lead => setSelectedLeadForDetails(lead)}
                    onRefreshData={fetchData}
                  />
                )}

                {/* 4. Customers */}
                {activeTab === 'customers' && (
                  <CustomersList
                    customers={customers}
                    onOpenCustomerDetails={cust => setSelectedCustomerForDetails(cust)}
                    onRefreshData={fetchData}
                  />
                )}

                {/* 5. Deals */}
                {activeTab === 'deals' && (
                  <DealsList
                    deals={deals}
                    leads={leads}
                    customers={customers}
                    onOpenNewDeal={openNewDeal}
                    onOpenEditDeal={openEditDeal}
                    onRefreshData={fetchData}
                  />
                )}

                {/* 6. Follow-ups & Tasks */}
                {activeTab === 'followups' && (
                  <FollowUpsList
                    tasks={tasks}
                    leads={leads}
                    customers={customers}
                    onOpenNewTask={() => openNewTask()}
                    onOpenEditTask={openEditTask}
                    onRefreshData={fetchData}
                  />
                )}

                {/* 7. Communication History */}
                {activeTab === 'communication' && (
                  <CommunicationTimeline
                    activities={activities}
                    leads={leads}
                    customers={customers}
                    onRefreshData={fetchData}
                  />
                )}

                {/* 8. Calendar */}
                {activeTab === 'calendar' && (
                  <CalendarView
                    tasks={tasks}
                    deals={deals}
                    leads={leads}
                    onOpenNewTask={() => openNewTask()}
                    onOpenNewDeal={openNewDeal}
                  />
                )}

                {/* 9. Analytics */}
                {activeTab === 'analytics' && (
                  <AnalyticsReports
                    leads={leads}
                    customers={customers}
                    deals={deals}
                    tasks={tasks}
                    users={users}
                  />
                )}

                {/* 10. Settings */}
                {activeTab === 'settings' && (
                  <SettingsView
                    onRefreshData={fetchData}
                    onOpenWorkflowGuide={() => setIsWorkflowModalOpen(true)}
                  />
                )}
              </>
            )}
          </div>
        </main>

      </div>

      {/* Global Modals */}

      {/* 1. Rahul Kumar Workflow Guide Modal */}
      <WorkflowGuideModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        onStartWalkthrough={handleStartWorkflowWalkthrough}
      />

      {/* 2. Lead Create/Edit Modal */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => { setIsLeadModalOpen(false); setLeadToEdit(null); }}
        onLeadSaved={fetchData}
        leadToEdit={leadToEdit}
      />

      {/* 3. Lead 360 & Sales Journey Stepper Modal */}
      <LeadDetailsModal
        lead={selectedLeadForDetails}
        isOpen={!!selectedLeadForDetails}
        onClose={() => setSelectedLeadForDetails(null)}
        onLeadUpdated={fetchData}
        onOpenEditLead={lead => {
          setSelectedLeadForDetails(null);
          openEditLead(lead);
        }}
        onOpenNewFollowUp={lead => openNewTask(lead)}
      />

      {/* 4. Customer 360 Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomerForDetails}
        isOpen={!!selectedCustomerForDetails}
        onClose={() => setSelectedCustomerForDetails(null)}
        onCustomerUpdated={fetchData}
      />

      {/* 5. Deal Create/Edit Modal */}
      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => { setIsDealModalOpen(false); setDealToEdit(null); }}
        onDealSaved={fetchData}
        dealToEdit={dealToEdit}
        leads={leads}
        customers={customers}
      />

      {/* 6. Task / Follow-up Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setTaskToEdit(null); setTaskDefaultLead(null); }}
        onTaskSaved={fetchData}
        taskToEdit={taskToEdit}
        defaultLead={taskDefaultLead}
        leads={leads}
        customers={customers}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CRMApp />
    </AuthProvider>
  );
}
