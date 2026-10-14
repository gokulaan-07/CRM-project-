import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Building2, Phone, Mail, User, 
  Sparkles, CheckCircle2, MoreVertical, Edit, Trash2, ArrowUpDown,
  Kanban, UserPlus, IndianRupee
} from 'lucide-react';
import { Lead, LeadStatus, Priority } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface LeadsListProps {
  leads: Lead[];
  onOpenNewLead: () => void;
  onOpenEditLead: (lead: Lead) => void;
  onOpenLeadDetails: (lead: Lead) => void;
  onOpenPipeline: () => void;
  onRefreshData: () => void;
}

export const LeadsList: React.FC<LeadsListProps> = ({
  leads,
  onOpenNewLead,
  onOpenEditLead,
  onOpenLeadDetails,
  onOpenPipeline,
  onRefreshData
}) => {
  const { currentUser, users, showToast } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [assignedFilter, setAssignedFilter] = useState<string>('ALL');

  const handleDeleteLead = async (leadId: string, leadName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete lead "${leadName}"? This action cannot be undone.`)) return;

    try {
      await api.deleteLead(leadId);
      showToast(`Lead "${leadName}" deleted`, 'info');
      onRefreshData();
    } catch (err) {
      showToast('Failed to delete lead', 'error');
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Contacted': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'Qualified': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Proposal': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Negotiation': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Won': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Lost': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Converted': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getPriorityBadge = (p: Priority) => {
    if (p === 'High') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (p === 'Medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  const safeLeads = Array.isArray(leads) ? leads : [];
  const filteredLeads = safeLeads.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.interest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || l.priority === priorityFilter;
    const matchesAssigned = assignedFilter === 'ALL' || l.assignedTo === assignedFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssigned;
  });

  return (
    <div id="leads-list-view" className="space-y-5 animate-in fade-in duration-150">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Potential Customers (Leads)</span>
            <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-full border border-slate-700">
              {filteredLeads.length} of {leads.length}
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            A lead is a person or business inquiring about your services before becoming a customer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPipeline}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Kanban className="w-3.5 h-3.5 text-amber-400" />
            <span>Kanban Pipeline</span>
          </button>

          <button
            id="btn-add-lead-main"
            onClick={onOpenNewLead}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="leads-search-input"
            type="text"
            placeholder="Search by name, company, interest, phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            id="filter-lead-status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Stages</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
            <option value="Converted">Converted</option>
          </select>

          {/* Priority Filter */}
          <select
            id="filter-lead-priority"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Assigned Rep Filter */}
          <select
            id="filter-lead-assigned"
            value={assignedFilter}
            onChange={e => setAssignedFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Sales Reps</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-slate-400 bg-slate-850 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Lead Name / Company</th>
                <th className="py-3 px-4 font-semibold">Requirement Interest</th>
                <th className="py-3 px-4 font-semibold">Estimated Value</th>
                <th className="py-3 px-4 font-semibold">Stage / Status</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">Source</th>
                <th className="py-3 px-4 font-semibold">Assigned Rep</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No leads found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr
                    key={lead._id}
                    onClick={() => onOpenLeadDetails(lead)}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  >
                    {/* Name / Company */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {lead.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        <span>{lead.company || 'Individual'}</span>
                      </div>
                    </td>

                    {/* Requirement */}
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate font-medium">
                      {lead.interest}
                    </td>

                    {/* Value */}
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      ₹{lead.estimatedValue.toLocaleString('en-IN')}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-block ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${getPriorityBadge(lead.priority)}`}>
                        {lead.priority}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-3.5 px-4 text-slate-400">
                      {lead.source}
                    </td>

                    {/* Assigned Salesperson */}
                    <td className="py-3.5 px-4 text-indigo-300 font-medium">
                      {lead.assignedUserName || 'Gokulaan'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {lead.status === 'Won' && !lead.isConverted && (
                          <button
                            onClick={() => onOpenLeadDetails(lead)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                            title="Convert won lead to customer"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Convert</span>
                          </button>
                        )}
                        <button
                          onClick={() => onOpenEditLead(lead)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors"
                          title="Edit Lead"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => handleDeleteLead(lead._id, lead.name, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 cursor-pointer transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
