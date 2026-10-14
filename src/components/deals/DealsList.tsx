import React, { useState } from 'react';
import { 
  DollarSign, Plus, Search, Filter, Calendar, Award, 
  XCircle, Edit, Trash2, ArrowUpRight, CheckCircle2, Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Deal, DealStage, Lead, Customer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface DealsListProps {
  deals: Deal[];
  leads: Lead[];
  customers: Customer[];
  onOpenNewDeal: () => void;
  onOpenEditDeal: (deal: Deal) => void;
  onRefreshData: () => void;
}

export const DealsList: React.FC<DealsListProps> = ({
  deals,
  leads,
  customers,
  onOpenNewDeal,
  onOpenEditDeal,
  onRefreshData
}) => {
  const { currentUser, showToast } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  const handleStageChange = async (deal: Deal, newStage: DealStage, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.updateDealStage(deal._id, newStage);
      if (newStage === 'Won') {
        try {
          confetti({ particleCount: 70, spread: 60 });
        } catch (err) {}
        showToast(`🎉 Deal "${deal.title}" marked as WON (₹${deal.value.toLocaleString('en-IN')})!`, 'success');
      } else {
        showToast(`Deal moved to ${newStage}`, 'info');
      }
      onRefreshData();
    } catch (err) {
      showToast('Failed to update deal stage', 'error');
    }
  };

  const handleDeleteDeal = async (dealId: string, dealTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete deal "${dealTitle}"?`)) return;
    try {
      await api.deleteDeal(dealId);
      showToast('Deal deleted', 'info');
      onRefreshData();
    } catch (err) {
      showToast('Failed to delete deal', 'error');
    }
  };

  const getStageBadge = (stage: DealStage) => {
    switch (stage) {
      case 'Qualified': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Proposal': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Negotiation': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Won': return 'bg-purple-500/10 text-purple-400 border-purple-500/30 font-bold';
      case 'Lost': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const safeDeals = Array.isArray(deals) ? deals : [];
  const filteredDeals = safeDeals.filter(d => {
    const matchesSearch = 
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.customerName && d.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.leadName && d.leadName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStage = stageFilter === 'ALL' || d.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const wonTotal = safeDeals.filter(d => d.stage === 'Won').reduce((sum, d) => sum + (d.value || 0), 0);
  const activePipelineTotal = safeDeals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div id="deals-list-view" className="space-y-5 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Sales Deals & Revenue Pipeline</h1>
            <span className="text-xs bg-purple-500/20 text-purple-300 font-semibold px-2 py-0.5 rounded-full border border-purple-500/30">
              {deals.length} Total Deals
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Won Revenue: <strong className="text-emerald-400">₹{(wonTotal / 100000).toFixed(1)} Lakhs</strong> • In Negotiation/Proposal: <strong className="text-indigo-300">₹{(activePipelineTotal / 100000).toFixed(1)} Lakhs</strong>
          </p>
        </div>

        <button
          id="btn-create-deal"
          onClick={onOpenNewDeal}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Deal</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="deals-search-input"
            type="text"
            placeholder="Search deals by title, lead, customer..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        <select
          id="deals-stage-filter"
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
        >
          <option value="ALL">All Stages</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal">Proposal</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      {/* Deals Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-slate-400 bg-slate-850 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Deal Title</th>
                <th className="py-3 px-4 font-semibold">Associated Account / Lead</th>
                <th className="py-3 px-4 font-semibold">Deal Value</th>
                <th className="py-3 px-4 font-semibold">Stage</th>
                <th className="py-3 px-4 font-semibold">Win %</th>
                <th className="py-3 px-4 font-semibold">Expected Closing</th>
                <th className="py-3 px-4 font-semibold">Assigned Rep</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No sales deals found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredDeals.map(deal => (
                  <tr
                    key={deal._id}
                    onClick={() => onOpenEditDeal(deal)}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                      {deal.title}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {deal.customerName ? (
                        <span className="flex items-center gap-1 text-teal-300 font-medium">
                          <Building2 className="w-3 h-3 text-teal-400" />
                          {deal.customerName}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {deal.leadName || 'Lead Inquiry'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-400 text-sm">
                      ₹{deal.value.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] border ${getStageBadge(deal.stage)}`}>
                        {deal.stage}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-300">
                      {deal.probability}%
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 flex items-center gap-1 py-4">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{deal.expectedCloseDate}</span>
                    </td>

                    <td className="py-3.5 px-4 text-indigo-300 font-medium">
                      {deal.assignedUserName || 'Gokulaan'}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {deal.stage !== 'Won' && (
                          <button
                            onClick={e => handleStageChange(deal, 'Won', e)}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer transition-colors"
                            title="Mark Won"
                          >
                            Won
                          </button>
                        )}
                        <button
                          onClick={() => onOpenEditDeal(deal)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                          title="Edit Deal"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => handleDeleteDeal(deal._id, deal.title, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 cursor-pointer"
                          title="Delete Deal"
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
