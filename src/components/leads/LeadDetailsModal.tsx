import React, { useState, useEffect } from 'react';
import { 
  X, Phone, Mail, Building2, User, IndianRupee, Calendar, 
  CheckCircle2, Clock, Plus, Sparkles, MessageSquare, Award, 
  ChevronRight, ArrowRight, Check, AlertCircle, Edit, Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lead, Activity, Task, LeadStatus, ActivityType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface LeadDetailsModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: () => void;
  onOpenEditLead: (lead: Lead) => void;
  onOpenNewFollowUp: (lead: Lead) => void;
}

const STAGES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Won'
];

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  lead,
  isOpen,
  onClose,
  onLeadUpdated,
  onOpenEditLead,
  onOpenNewFollowUp
}) => {
  const { currentUser, showToast } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);

  // Quick activity log state
  const [actType, setActType] = useState<ActivityType>('Call');
  const [actTitle, setActTitle] = useState('');
  const [actDescription, setActDescription] = useState('');
  const [isLoggingAct, setIsLoggingAct] = useState(false);

  const fetchLeadData = async () => {
    if (!lead) return;
    try {
      setIsLoading(true);
      const [acts, allTasks] = await Promise.all([
        api.getActivities({ leadId: lead._id }),
        api.getTasks()
      ]);
      setActivities(acts);
      setTasks(allTasks.filter(t => t.leadId === lead._id));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && lead) {
      fetchLeadData();
    }
  }, [isOpen, lead]);

  if (!isOpen || !lead) return null;

  const currentStageIndex = STAGES.indexOf(lead.status as any);

  const handleStageClick = async (newStatus: LeadStatus) => {
    try {
      await api.updateLeadStatus(lead._id, newStatus, currentUser?._id || 'usr-1');
      showToast(`Lead status moved to "${newStatus}"`, 'success');
      if (newStatus === 'Won') {
        try {
          confetti({ particleCount: 70, spread: 60 });
        } catch (e) {}
      }
      onLeadUpdated();
      fetchLeadData();
    } catch (e) {
      showToast('Failed to update stage', 'error');
    }
  };

  const handleConvertToCustomer = async () => {
    setIsConverting(true);
    try {
      const result = await api.convertLeadToCustomer(lead._id, currentUser?._id || 'usr-1');
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
      showToast(`🎉 "${lead.name}" is now an official Customer! Deal and revenue recorded.`, 'success');
      setShowConvertConfirm(false);
      onLeadUpdated();
      fetchLeadData();
    } catch (e) {
      showToast('Conversion failed. Please try again.', 'error');
    } finally {
      setIsConverting(false);
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle) {
      showToast('Activity title is required', 'error');
      return;
    }
    setIsLoggingAct(true);
    try {
      await api.createActivity({
        leadId: lead._id,
        leadName: lead.name,
        type: actType,
        title: actTitle,
        description: actDescription,
        performedBy: currentUser?._id || 'usr-1',
        timestamp: new Date().toISOString()
      }, currentUser?._id || 'usr-1');

      showToast(`${actType} logged successfully!`, 'success');
      setActTitle('');
      setActDescription('');
      fetchLeadData();
    } catch (e) {
      showToast('Failed to log activity', 'error');
    } finally {
      setIsLoggingAct(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const next = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      await api.toggleTaskStatus(taskId, next);
      showToast(next === 'Completed' ? 'Task completed' : 'Task pending', 'info');
      fetchLeadData();
      onLeadUpdated();
    } catch (e) {
      showToast('Failed to update task', 'error');
    }
  };

  const getPriorityBadge = (p: string) => {
    if (p === 'High') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (p === 'Medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  return (
    <div id="lead-details-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-850 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-600/30 shrink-0">
              {lead.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white tracking-tight">{lead.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(lead.priority)}`}>
                  {lead.priority} Priority
                </span>
                {lead.isConverted ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Converted to Customer
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Lead Status: {lead.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{lead.company || 'Individual Client'}</span>
                <span>•</span>
                <span>Requirement: <strong className="text-slate-200">{lead.interest}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Convert to Customer Button */}
            {!lead.isConverted && (
              <button
                id="btn-convert-lead-to-customer"
                onClick={() => setShowConvertConfirm(true)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                  lead.status === 'Won'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse ring-2 ring-emerald-500/40'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Convert to Customer</span>
              </button>
            )}

            <button
              onClick={() => onOpenEditLead(lead)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Edit Lead"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conversion Confirmation Modal Layer */}
        {showConvertConfirm && (
          <div className="p-4 bg-emerald-950/60 border-b border-emerald-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in slide-in-from-top duration-150">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-200 text-sm">Convert {lead.name} to Official Customer?</p>
                <p className="text-emerald-300/80 text-xs">
                  This will create a Customer record for {lead.company || lead.name}, mark the deal as Won with revenue ₹{lead.estimatedValue.toLocaleString('en-IN')}, and preserve all activity logs.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowConvertConfirm(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-convert-btn"
                onClick={handleConvertToCustomer}
                disabled={isConverting}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                {isConverting ? 'Converting...' : 'Yes, Convert to Customer 🎉'}
              </button>
            </div>
          </div>
        )}

        {/* Sales Journey Visual Stepper */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Sales Process Journey
            </span>
            <span className="text-[11px] text-indigo-300">
              Click any stage to advance lead status
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {STAGES.map((st, idx) => {
              const isPastOrCurrent = currentStageIndex >= idx || lead.status === 'Converted';
              const isCurrent = lead.status === st;
              return (
                <button
                  key={st}
                  onClick={() => handleStageClick(st)}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30'
                      : isPastOrCurrent
                      ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300 hover:bg-emerald-900/40'
                      : 'bg-slate-800/40 border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {isPastOrCurrent && !isCurrent ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <span className="text-[9px] opacity-70">#{idx + 1}</span>
                    )}
                    <span className="text-xs font-semibold">{st}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Key Lead Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Opportunity Value</span>
              <span className="text-base font-bold text-emerald-400">
                ₹{lead.estimatedValue.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Lead Source</span>
              <span className="font-semibold text-slate-200">{lead.source}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Assigned Sales Rep</span>
              <span className="font-semibold text-indigo-300">{lead.assignedUserName || 'Gokulaan'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Date Received</span>
              <span className="text-slate-300">{new Date(lead.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-700/40">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Contact Email</span>
              <span className="text-slate-200 font-medium">{lead.email || 'No email provided'}</span>
            </div>
            <div className="sm:col-span-2 pt-2 border-t border-slate-700/40">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Phone Number</span>
              <span className="text-slate-200 font-medium">{lead.phone || 'No phone provided'}</span>
            </div>

            {lead.notes && (
              <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-700/40">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Requirement Notes</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">{lead.notes}</p>
              </div>
            )}
          </div>

          {/* Follow-ups & Scheduled Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">Scheduled Follow-ups for this Lead</h3>
              </div>
              <button
                onClick={() => onOpenNewFollowUp(lead)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Follow-up</span>
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="p-3 bg-slate-800/30 border border-slate-800 rounded-xl text-xs text-slate-400 text-center">
                No upcoming follow-ups scheduled for Rahul/this lead. Click "Add Follow-up" above to schedule a call or proposal reminder.
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map(t => (
                  <div
                    key={t._id}
                    className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTask(t._id, t.status)}
                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${
                          t.status === 'Completed' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-500'
                        }`}
                      >
                        {t.status === 'Completed' && <Check className="w-3 h-3" />}
                      </button>
                      <div>
                        <p className={`font-semibold ${t.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {t.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Due: {t.dueDate} {t.dueTime} • Assigned: {t.assignedUserName}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${t.status === 'Completed' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Communication Logger */}
          <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Record Sales Communication</span>
            </h3>
            
            <form onSubmit={handleLogActivity} className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                {(['Call', 'Email', 'Meeting', 'Note'] as ActivityType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActType(type)}
                    className={`px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                      actType === type
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder={`e.g. Discussed payment gateway & hosting with Rahul`}
                    value={actTitle}
                    onChange={e => setActTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoggingAct}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {isLoggingAct ? 'Saving...' : `Log ${actType}`}
                  </button>
                </div>
              </div>

              <textarea
                rows={2}
                placeholder="Optional details, discussion summary, outcome or next steps..."
                value={actDescription}
                onChange={e => setActDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </form>
          </div>

          {/* Activity History Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Full Activity History & Journey Log</span>
            </h3>

            <div className="space-y-3 pl-2 border-l-2 border-slate-800">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-500 pl-2">No activity records logged yet.</p>
              ) : (
                activities.map(act => (
                  <div key={act._id} className="relative pl-4 text-xs">
                    <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-900" />
                    <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold">
                            {act.type}
                          </span>
                          {act.title}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(act.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      {act.description && (
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{act.description}</p>
                      )}
                      <p className="text-[10px] text-indigo-300 mt-1">
                        Recorded by {act.performedByName || 'Sales Executive'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Current Stage: <strong className="text-white">{lead.status}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};
