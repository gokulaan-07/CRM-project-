import React, { useState } from 'react';
import { 
  X, CheckCircle2, ArrowRight, Sparkles, User, DollarSign, 
  Building2, Phone, FileText, ShoppingCart, Award, Check, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LeadStatus } from '../../types';

interface WorkflowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadConverted?: () => void;
  onNavigateToLead?: (leadId: string) => void;
}

const STEPS = [
  {
    step: 1,
    title: 'Inquiry Received',
    status: 'New' as LeadStatus,
    icon: User,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    description: 'Rahul Kumar from ABC Technologies inquiries about developing a full e-commerce website.',
    action: 'Salesperson registers Rahul as a new Lead in the CRM.'
  },
  {
    step: 2,
    title: 'First Discovery Call',
    status: 'Contacted' as LeadStatus,
    icon: Phone,
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    description: 'Sales team contacts Rahul to understand requirements (~500 product catalog, payment gateways, order management).',
    action: 'Call logged in activity history, status updated to Contacted.'
  },
  {
    step: 3,
    title: 'Lead Qualification',
    status: 'Qualified' as LeadStatus,
    icon: CheckCircle2,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'Budget confirmed at ₹2,00,000 with realistic 4-week timeline. Rahul has decision-making authority.',
    action: 'Status updated to Qualified. Automatic pipeline deal created.'
  },
  {
    step: 4,
    title: 'Quotation & Scope',
    status: 'Proposal' as LeadStatus,
    icon: FileText,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Company sends formal proposal and milestone payment structure (₹2L). Follow-up scheduled.',
    action: 'Proposal email logged, follow-up task added to calendar.'
  },
  {
    step: 5,
    title: 'Pricing Negotiation',
    status: 'Negotiation' as LeadStatus,
    icon: DollarSign,
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    description: 'Rahul discusses free 3-month post-launch maintenance. Agreement reached.',
    action: 'Status updated to Negotiation, probability increased to 80%.'
  },
  {
    step: 6,
    title: 'Deal Won',
    status: 'Won' as LeadStatus,
    icon: Award,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    description: 'Rahul accepts the proposal and agrees to proceed. Sale closed!',
    action: 'Status set to Won. Ready for customer conversion.'
  },
  {
    step: 7,
    title: 'Convert to Customer 🎉',
    status: 'Converted' as LeadStatus,
    icon: Sparkles,
    color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
    description: 'Lead converted into an official Customer! Deal linked, ₹2,00,000 revenue counted, complete communication history preserved.',
    action: 'Customer record created in CRM. Dashboard statistics updated!'
  }
];

export const WorkflowGuideModal: React.FC<WorkflowGuideModalProps> = ({
  isOpen,
  onClose,
  onLeadConverted,
  onNavigateToLead
}) => {
  const { currentUser, showToast } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(2); // starts around Qualified for Rahul
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentStep = STEPS[currentStepIndex];

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // fallback
    }
  };

  const handleSimulateStep = async (index: number) => {
    setCurrentStepIndex(index);
    const target = STEPS[index];

    if (target.status === 'Won') {
      triggerConfetti();
    }

    if (target.status === 'Converted') {
      triggerConfetti();
      setIsProcessing(true);
      try {
        await api.convertLeadToCustomer('lead-rahul', currentUser?._id || 'usr-1');
        showToast('🎉 Rahul Kumar converted to Customer! Deal linked & revenue added to dashboard.', 'success');
        if (onLeadConverted) onLeadConverted();
      } catch (e) {
        console.error(e);
      } finally {
        setIsProcessing(false);
      }
    } else {
      try {
        await api.updateLeadStatus('lead-rahul', target.status, currentUser?._id || 'usr-1');
        showToast(`Rahul Kumar lead status updated to "${target.status}"`, 'info');
        if (onLeadConverted) onLeadConverted();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div id="workflow-guide-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                The Core CRM Sales Journey
                <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Real-World Story
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                How an inquiry from Rahul becomes a Qualified Lead, a Won Deal, and a Customer
              </p>
            </div>
          </div>
          <button
            id="close-workflow-guide-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Visual Step Progress Chain */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {STEPS.map((s, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={s.step}
                  onClick={() => handleSimulateStep(idx)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isCurrent
                      ? 'bg-indigo-600/30 border-indigo-500 text-white ring-2 ring-indigo-500/40 shadow-lg'
                      : isCompleted
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Step {s.step}
                    </span>
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <s.icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-400' : 'text-slate-500'}`} />
                    )}
                  </div>
                  <p className="text-xs font-semibold truncate text-white">{s.status}</p>
                </button>
              );
            })}
          </div>

          {/* Detailed Highlight Card for Current Step */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl border ${currentStep.color}`}>
                  <currentStep.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Step {currentStep.step} of 7
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-700 text-slate-200">
                      Status: {currentStep.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">{currentStep.title}</h3>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    onClick={() => handleSimulateStep(currentStepIndex - 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
                  >
                    Previous Step
                  </button>
                )}
                {currentStepIndex < STEPS.length - 1 ? (
                  <button
                    onClick={() => handleSimulateStep(currentStepIndex + 1)}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Advance to {STEPS[currentStepIndex + 1].status}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigateToLead) onNavigateToLead('lead-rahul');
                    }}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>View Converted Customer</span>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Step Story Narrative */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-700/60">
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-300 block mb-1">Scenario Description:</span>
                <p className="text-slate-400 leading-relaxed">{currentStep.description}</p>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="font-semibold text-indigo-300 block mb-1">CRM System Action:</span>
                <p className="text-slate-400 leading-relaxed">{currentStep.action}</p>
              </div>
            </div>

            {/* Target Lead Summary */}
            <div className="bg-indigo-950/30 border border-indigo-900/60 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  RK
                </div>
                <div>
                  <p className="font-bold text-white">Rahul Kumar</p>
                  <p className="text-indigo-300 text-[11px]">ABC Technologies • E-commerce Website</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 block">Estimated Value</span>
                  <span className="font-bold text-emerald-400">₹2,00,000</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Assigned Rep</span>
                  <span className="font-semibold text-slate-200">Gokulaan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-800/40 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Click any step above or use the advance button to test the complete sales lifecycle.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-medium cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
