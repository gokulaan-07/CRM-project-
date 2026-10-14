import React, { useState } from 'react';
import { 
  Kanban, Plus, Sparkles, ChevronRight, ChevronLeft, ArrowRight, 
  Building2, User, IndianRupee, Award, Check, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lead, LeadStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface LeadPipelineProps {
  leads: Lead[];
  onOpenNewLead: () => void;
  onOpenLeadDetails: (lead: Lead) => void;
  onRefreshData: () => void;
}

const PIPELINE_COLUMNS: { stage: LeadStatus; title: string; color: string; headerBg: string }[] = [
  { stage: 'New', title: 'NEW', color: 'border-blue-500/40 text-blue-400', headerBg: 'bg-blue-950/40 text-blue-300' },
  { stage: 'Contacted', title: 'CONTACTED', color: 'border-sky-500/40 text-sky-400', headerBg: 'bg-sky-950/40 text-sky-300' },
  { stage: 'Qualified', title: 'QUALIFIED', color: 'border-emerald-500/40 text-emerald-400', headerBg: 'bg-emerald-950/40 text-emerald-300' },
  { stage: 'Proposal', title: 'PROPOSAL', color: 'border-amber-500/40 text-amber-400', headerBg: 'bg-amber-950/40 text-amber-300' },
  { stage: 'Negotiation', title: 'NEGOTIATION', color: 'border-orange-500/40 text-orange-400', headerBg: 'bg-orange-950/40 text-orange-300' },
  { stage: 'Won', title: 'WON', color: 'border-purple-500/40 text-purple-400', headerBg: 'bg-purple-950/40 text-purple-300' },
  { stage: 'Lost', title: 'LOST', color: 'border-rose-500/40 text-rose-400', headerBg: 'bg-rose-950/40 text-rose-300' }
];

export const LeadPipeline: React.FC<LeadPipelineProps> = ({
  leads,
  onOpenNewLead,
  onOpenLeadDetails,
  onRefreshData
}) => {
  const { currentUser, showToast } = useAuth();
  const [movingLeadId, setMovingLeadId] = useState<string | null>(null);

  const handleMoveStage = async (lead: Lead, targetStage: LeadStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    setMovingLeadId(lead._id);
    try {
      await api.updateLeadStatus(lead._id, targetStage, currentUser?._id || 'usr-1');
      if (targetStage === 'Won') {
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (err) {}
        showToast(`🎉 "${lead.name}" moved to WON! Click to convert into customer.`, 'success');
      } else {
        showToast(`Lead "${lead.name}" moved to ${targetStage}`, 'info');
      }
      onRefreshData();
    } catch (err) {
      showToast('Failed to update stage', 'error');
    } finally {
      setMovingLeadId(null);
    }
  };

  const safeLeads = Array.isArray(leads) ? leads : [];

  const totalPipelineValue = safeLeads
    .filter(l => l.status !== 'Lost')
    .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

  return (
    <div id="lead-pipeline-kanban-view" className="space-y-4 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Lead Sales Pipeline</h1>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
              Interactive Kanban
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize the full sales cycle from initial inquiry to final customer conversion. Total Pipeline: <strong className="text-emerald-400">₹{(totalPipelineValue / 100000).toFixed(1)} Lakhs</strong>
          </p>
        </div>

        <button
          onClick={onOpenNewLead}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Lead</span>
        </button>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-[1350px]">
          {PIPELINE_COLUMNS.map((col, colIndex) => {
            const columnLeads = safeLeads.filter(l => l.status === col.stage);
            const columnValue = columnLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

            return (
              <div
                key={col.stage}
                className="w-72 shrink-0 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div className={`p-3.5 border-b border-slate-800 rounded-t-2xl flex items-center justify-between ${col.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs tracking-wider">{col.title}</span>
                    <span className="w-5 h-5 rounded-full bg-slate-900/80 text-white text-[10px] font-bold flex items-center justify-center">
                      {columnLeads.length}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-300">
                    ₹{((columnValue) / 100000).toFixed(1)}L
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {columnLeads.length === 0 ? (
                    <div className="h-24 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500">
                      No leads in {col.stage}
                    </div>
                  ) : (
                    columnLeads.map(lead => (
                      <div
                        key={lead._id}
                        onClick={() => onOpenLeadDetails(lead)}
                        className={`p-3.5 bg-slate-850 hover:bg-slate-800 border rounded-xl shadow-sm text-xs transition-all cursor-pointer group space-y-2 ${
                          lead._id === 'lead-rahul' ? 'ring-1 ring-amber-500/40 border-amber-500/30' : 'border-slate-700/60'
                        }`}
                      >
                        {/* Title & Priority */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                            {lead.name}
                            {lead._id === 'lead-rahul' && (
                              <span className="ml-1.5 text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-semibold">
                                Demo
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                            {lead.priority}
                          </span>
                        </div>

                        {/* Company & Interest */}
                        <div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                            <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{lead.company || 'Individual'}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                            {lead.interest}
                          </p>
                        </div>

                        {/* Value & Sales Rep */}
                        <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-emerald-400">
                            ₹{lead.estimatedValue.toLocaleString('en-IN')}
                          </span>
                          <span className="text-slate-400 truncate max-w-[100px]">
                            {lead.assignedUserName || 'Sales'}
                          </span>
                        </div>

                        {/* Stage Transition Quick Buttons */}
                        <div className="pt-1.5 flex items-center justify-between gap-1" onClick={e => e.stopPropagation()}>
                          {colIndex > 0 ? (
                            <button
                              onClick={e => handleMoveStage(lead, PIPELINE_COLUMNS[colIndex - 1].stage, e)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title={`Move back to ${PIPELINE_COLUMNS[colIndex - 1].stage}`}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          ) : <div />}

                          {/* Quick Convert button if in Won column */}
                          {col.stage === 'Won' && !lead.isConverted ? (
                            <button
                              onClick={() => onOpenLeadDetails(lead)}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Convert</span>
                            </button>
                          ) : null}

                          {colIndex < PIPELINE_COLUMNS.length - 1 ? (
                            <button
                              onClick={e => handleMoveStage(lead, PIPELINE_COLUMNS[colIndex + 1].stage, e)}
                              className="p-1 rounded bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-0.5"
                              title={`Advance to ${PIPELINE_COLUMNS[colIndex + 1].stage}`}
                            >
                              <span className="text-[10px] hidden group-hover:inline">Advance</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : <div />}
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
