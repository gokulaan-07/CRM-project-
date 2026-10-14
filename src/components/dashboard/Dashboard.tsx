import React from 'react';
import { 
  Users, UserCheck, CheckCircle2, DollarSign, Award, XCircle, 
  CalendarCheck, ArrowUpRight, TrendingUp, Clock, Plus, ChevronRight,
  Sparkles, Phone, Mail, Building2, Check, Calendar, AlertCircle
} from 'lucide-react';
import { DashboardStats, Lead, Task, Activity, Deal } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface DashboardProps {
  stats: DashboardStats | null;
  leads: Lead[];
  tasks: Task[];
  activities: Activity[];
  deals: Deal[];
  onNavigate: (tab: string) => void;
  onOpenLeadDetails: (lead: Lead) => void;
  onOpenNewLead: () => void;
  onOpenNewFollowUp: () => void;
  onOpenWorkflowGuide: () => void;
  onRefreshData: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  leads,
  tasks,
  activities,
  deals,
  onNavigate,
  onOpenLeadDetails,
  onOpenNewLead,
  onOpenNewFollowUp,
  onOpenWorkflowGuide,
  onRefreshData
}) => {
  const { currentUser, showToast } = useAuth();

  const handleToggleTask = async (task: Task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await api.toggleTaskStatus(task._id, newStatus);
      showToast(newStatus === 'Completed' ? 'Follow-up marked as completed!' : 'Follow-up reopened', 'success');
      onRefreshData();
    } catch (e) {
      showToast('Failed to update task', 'error');
    }
  };

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'New': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Contacted': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'Qualified': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Proposal': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Negotiation': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Won': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Lost': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Converted': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeLeads = Array.isArray(leads) ? leads : [];
  const safeActivities = Array.isArray(activities) ? activities : [];
  const safeDeals = Array.isArray(deals) ? deals : [];

  const pendingTasks = safeTasks.filter(t => t.status === 'Pending').slice(0, 5);
  const recentLeads = safeLeads.slice(0, 5);
  const recentActivities = safeActivities.slice(0, 6);

  return (
    <div id="crm-dashboard-view" className="space-y-6 animate-in fade-in duration-150">
      
      {/* Welcome & Context Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
              Welcome back, {currentUser?.name || 'Sales Team'}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {currentUser?.role === 'admin' ? 'Admin Dashboard' : 'Sales Overview'}
            </span>
          </div>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Track potential customers (leads), follow up on active deals, and convert won opportunities into clients.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            id="dashboard-workflow-guide-btn"
            onClick={onOpenWorkflowGuide}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Try Rahul's Workflow</span>
          </button>

          <button
            id="dashboard-new-lead-btn"
            onClick={onOpenNewLead}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* 8 Primary Sales Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Leads */}
        <div 
          onClick={() => onNavigate('leads')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-all hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Leads</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white">{stats?.totalLeads ?? leads.length}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Potential clients</span>
        </div>

        {/* Qualified Leads */}
        <div 
          onClick={() => onNavigate('leads')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-all hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Qualified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">{stats?.qualifiedLeads ?? 0}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">High buying intent</span>
        </div>

        {/* Customers */}
        <div 
          onClick={() => onNavigate('customers')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-all hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Customers</span>
            <UserCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-bold text-teal-400">{stats?.customers ?? 0}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Converted clients</span>
        </div>

        {/* Active Deals */}
        <div 
          onClick={() => onNavigate('deals')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-all hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Deals</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-indigo-400">{stats?.activeDeals ?? deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">In sales pipeline</span>
        </div>

        {/* Won Deals */}
        <div 
          onClick={() => onNavigate('deals')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-all hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Won Deals</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400">{stats?.wonDeals ?? 0}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Closed sales</span>
        </div>

        {/* Lost Deals */}
        <div 
          onClick={() => onNavigate('deals')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-all hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Lost Deals</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400">{stats?.lostDeals ?? 0}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Unsuccessful</span>
        </div>

        {/* Total Revenue */}
        <div 
          onClick={() => onNavigate('analytics')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-all hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 truncate">
            ₹{((stats?.totalRevenue ?? 0) / 100000).toFixed(1)}L
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Won deals sum</span>
        </div>

        {/* Pending Follow-ups */}
        <div 
          onClick={() => onNavigate('followups')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-all hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Follow-ups</span>
            <CalendarCheck className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl font-bold text-orange-400">{stats?.pendingFollowups ?? pendingTasks.length}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Scheduled tasks</span>
        </div>
      </div>

      {/* Lead Pipeline Visual Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Sales Pipeline Progress</span>
              <span className="text-xs text-slate-400 font-normal">
                (Conversion Rate: <strong className="text-emerald-400">{stats?.leadConversionRate ?? 0}%</strong>)
              </span>
            </h2>
            <p className="text-xs text-slate-400">Distribution of leads across each sales stage</p>
          </div>
          <button
            onClick={() => onNavigate('pipeline')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Open Kanban Board</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stage Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
          {stats?.pipelineStages?.map(stageItem => (
            <div
              key={stageItem.stage}
              onClick={() => onNavigate('pipeline')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${getStatusBadge(stageItem.stage)}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                {stageItem.stage}
              </span>
              <div className="text-lg font-bold mt-0.5">{stageItem.count}</div>
              <span className="text-[10px] opacity-75 block truncate">
                ₹{((stageItem.value || 0) / 100000).toFixed(1)}L
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Recent Leads & Follow-ups / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Leads */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Recent Leads & Potential Clients</h2>
              <p className="text-xs text-slate-400">Click any lead to view full sales journey and details</p>
            </div>
            <button
              onClick={() => onNavigate('leads')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({leads.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                <tr>
                  <th className="py-2.5 font-semibold">Lead / Company</th>
                  <th className="py-2.5 font-semibold">Interest</th>
                  <th className="py-2.5 font-semibold">Value</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold">Assigned Rep</th>
                  <th className="py-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentLeads.map(lead => (
                  <tr 
                    key={lead._id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onOpenLeadDetails(lead)}
                  >
                    <td className="py-3">
                      <div className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {lead.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        <span>{lead.company || 'Individual'}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300">
                      {lead.interest}
                    </td>
                    <td className="py-3 font-semibold text-emerald-400">
                      ₹{lead.estimatedValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">
                      {lead.assignedUserName || 'Gokulaan'}
                    </td>
                    <td className="py-3 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenLeadDetails(lead)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Upcoming Follow-ups & Activity Stream */}
        <div className="space-y-6">
          {/* Upcoming Follow-ups */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-orange-400" />
                <h2 className="text-sm font-bold text-white">Upcoming Follow-ups</h2>
              </div>
              <button
                onClick={onOpenNewFollowUp}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Schedule</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingTasks.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No pending follow-ups scheduled
                </div>
              ) : (
                pendingTasks.map(task => (
                  <div
                    key={task._id}
                    className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-start gap-2.5 text-xs hover:border-slate-600 transition-colors"
                  >
                    <button
                      onClick={() => handleToggleTask(task)}
                      className="mt-0.5 w-4 h-4 rounded border border-slate-500 hover:border-indigo-400 flex items-center justify-center text-transparent hover:text-indigo-400 cursor-pointer shrink-0"
                      title="Mark task as complete"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-200 leading-tight truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span className="text-indigo-300">{task.leadName || task.customerName || 'General'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {task.dueDate} {task.dueTime}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => onNavigate('followups')}
              className="w-full py-1.5 text-center text-xs text-slate-400 hover:text-white bg-slate-800/60 rounded-lg transition-colors cursor-pointer block"
            >
              View all follow-ups →
            </button>
          </div>

          {/* Recent Sales Activities */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <h2 className="text-sm font-bold text-white">Recent Activities</h2>
              </div>
              <button
                onClick={() => onNavigate('communication')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                Timeline
              </button>
            </div>

            <div className="space-y-3">
              {recentActivities.map(act => (
                <div key={act._id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-300">
                    {act.type === 'Call' ? <Phone className="w-3 h-3 text-sky-400" /> :
                     act.type === 'Email' ? <Mail className="w-3 h-3 text-amber-400" /> :
                     act.type === 'Meeting' ? <Users className="w-3 h-3 text-purple-400" /> :
                     <Sparkles className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 truncate">{act.title}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">{act.description}</p>
                    <span className="text-[10px] text-indigo-300 mt-0.5 block">
                      {act.leadName || act.customerName} • by {act.performedByName || 'Sales'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
