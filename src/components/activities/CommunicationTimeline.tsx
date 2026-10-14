import React, { useState } from 'react';
import { 
  MessageSquare, Phone, Mail, FileText, Calendar, 
  Search, Filter, Plus, Clock, User, Building2
} from 'lucide-react';
import { Activity, ActivityType, Lead, Customer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface CommunicationTimelineProps {
  activities: Activity[];
  leads: Lead[];
  customers: Customer[];
  onRefreshData: () => void;
}

export const CommunicationTimeline: React.FC<CommunicationTimelineProps> = ({
  activities,
  leads,
  customers,
  onRefreshData
}) => {
  const { currentUser, showToast } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Quick log state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newType, setNewType] = useState<ActivityType>('Call');
  const [leadId, setLeadId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('15 mins');
  const [outcome, setOutcome] = useState('Positive');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showToast('Title is required', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const selectedLead = leads.find(l => l._id === leadId);
      const selectedCustomer = customers.find(c => c._id === customerId);

      await api.createActivity({
        type: newType,
        title,
        description: description + (duration ? ` (Duration: ${duration})` : '') + (outcome ? ` [Outcome: ${outcome}]` : ''),
        leadId: leadId || undefined,
        leadName: selectedLead?.name,
        customerId: customerId || undefined,
        customerName: selectedCustomer?.company || selectedCustomer?.name,
        performedBy: currentUser?._id || 'usr-1',
        timestamp: new Date().toISOString()
      }, currentUser?._id || 'usr-1');

      showToast(`${newType} logged successfully!`, 'success');
      setTitle('');
      setDescription('');
      setIsModalOpen(false);
      onRefreshData();
    } catch (err) {
      showToast('Failed to log communication', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'Call': return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'Email': return <Mail className="w-4 h-4 text-sky-400" />;
      case 'Meeting': return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'Note': return <FileText className="w-4 h-4 text-amber-400" />;
      case 'StatusChange': return <Clock className="w-4 h-4 text-indigo-400" />;
      default: return <MessageSquare className="w-4 h-4 text-slate-400" />;
    }
  };

  const safeActivities = Array.isArray(activities) ? activities : [];
  const filtered = safeActivities.filter(a => {
    const matchesSearch = 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.leadName && a.leadName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.customerName && a.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div id="communication-history-view" className="space-y-5 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Communication History & Logs</h1>
            <span className="text-xs bg-sky-500/20 text-sky-300 font-semibold px-2 py-0.5 rounded-full border border-sky-500/30">
              {activities.length} Logs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete audit trail of all phone calls, meetings, client emails, status advances, and negotiation notes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Communication</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search communications by subject, lead name, notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="ALL">All Communication Types</option>
          <option value="Call">Calls</option>
          <option value="Meeting">Meetings</option>
          <option value="Email">Emails</option>
          <option value="Note">Notes</option>
          <option value="StatusChange">Status Updates</option>
        </select>
      </div>

      {/* Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No communication records found.</p>
          ) : (
            filtered.map(item => (
              <div key={item._id} className="relative flex items-start gap-4 text-xs group">
                <div className="w-7 h-7 rounded-xl bg-slate-850 border border-slate-700 flex items-center justify-center shrink-0 z-10 shadow-xs group-hover:border-sky-500 transition-colors">
                  {getActivityIcon(item.type)}
                </div>

                <div className="flex-1 bg-slate-850 border border-slate-800 rounded-xl p-4 space-y-1.5 hover:border-slate-700 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-200 text-sm">{item.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {item.type}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-slate-400 text-[11px] pt-1">
                    {item.leadName && (
                      <span className="flex items-center gap-1 text-indigo-300 font-medium">
                        <User className="w-3 h-3 text-indigo-400" />
                        Lead: {item.leadName}
                      </span>
                    )}
                    {item.customerName && (
                      <span className="flex items-center gap-1 text-teal-300 font-medium">
                        <Building2 className="w-3 h-3 text-teal-400" />
                        Client: {item.customerName}
                      </span>
                    )}
                    <span className="text-slate-400">
                      Logged by: <strong className="text-slate-300">{item.performedByName || 'Sales Rep'}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-white">Record Communication / Meeting</h2>

            <form onSubmit={handleCreateActivity} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Communication Type</label>
                <div className="flex gap-2">
                  {(['Call', 'Email', 'Meeting', 'Note'] as ActivityType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`flex-1 py-1.5 rounded-lg border font-medium ${
                        newType === t ? 'bg-sky-600 border-sky-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subject / Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discussed discount terms & kickoff date"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Link to Lead</label>
                  <select
                    value={leadId}
                    onChange={e => { setLeadId(e.target.value); setCustomerId(''); }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="">-- None / Select Lead --</option>
                    {leads.map(l => (
                      <option key={l._id} value={l._id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Link to Customer</label>
                  <select
                    value={customerId}
                    onChange={e => { setCustomerId(e.target.value); setLeadId(''); }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="">-- None / Select Customer --</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.company || c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Discussion Notes</label>
                <textarea
                  rows={3}
                  placeholder="Key topics discussed, client feedback, next steps agreed upon..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm"
                >
                  {isSaving ? 'Logging...' : 'Save Communication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
