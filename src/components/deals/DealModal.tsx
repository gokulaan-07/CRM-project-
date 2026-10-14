import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, User, Percent, Building2 } from 'lucide-react';
import { Deal, DealStage, Lead, Customer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealSaved: () => void;
  dealToEdit?: Deal | null;
  leads: Lead[];
  customers: Customer[];
}

const STAGES: DealStage[] = ['Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export const DealModal: React.FC<DealModalProps> = ({
  isOpen,
  onClose,
  onDealSaved,
  dealToEdit,
  leads,
  customers
}) => {
  const { currentUser, users, showToast } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    leadId: '',
    customerId: '',
    value: 200000,
    stage: 'Qualified' as DealStage,
    probability: 50,
    expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTo: currentUser?._id || 'usr-1',
    notes: ''
  });

  useEffect(() => {
    if (dealToEdit) {
      setFormData({
        title: dealToEdit.title,
        leadId: dealToEdit.leadId || '',
        customerId: dealToEdit.customerId || '',
        value: dealToEdit.value,
        stage: dealToEdit.stage,
        probability: dealToEdit.probability,
        expectedCloseDate: dealToEdit.expectedCloseDate,
        assignedTo: dealToEdit.assignedTo,
        notes: dealToEdit.notes || ''
      });
    } else {
      setFormData({
        title: '',
        leadId: '',
        customerId: '',
        value: 200000,
        stage: 'Qualified',
        probability: 50,
        expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignedTo: currentUser?._id || 'usr-1',
        notes: ''
      });
    }
  }, [dealToEdit, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      showToast('Deal title is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (dealToEdit) {
        await api.updateDeal(dealToEdit._id, formData);
        showToast(`Deal "${formData.title}" updated`, 'success');
      } else {
        await api.createDeal(formData);
        showToast(`New deal "${formData.title}" created`, 'success');
      }
      onDealSaved();
      onClose();
    } catch (err) {
      showToast('Failed to save deal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="deal-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {dealToEdit ? 'Edit Sales Opportunity Deal' : 'Create New Sales Deal'}
              </h2>
              <p className="text-xs text-slate-400">
                Track revenue, expected closing date, and contract stage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Deal Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. E-commerce Website - ABC Technologies"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Associated Lead */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Link to Lead
              </label>
              <select
                value={formData.leadId}
                onChange={e => setFormData({ ...formData, leadId: e.target.value, customerId: '' })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- None / Select Lead --</option>
                {leads.map(l => (
                  <option key={l._id} value={l._id}>
                    {l.name} ({l.company || 'Individual'})
                  </option>
                ))}
              </select>
            </div>

            {/* Associated Customer */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Link to Customer
              </label>
              <select
                value={formData.customerId}
                onChange={e => setFormData({ ...formData, customerId: e.target.value, leadId: '' })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- None / Select Customer --</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.company || c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Deal Value */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Deal Value (₹ INR)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={formData.value}
                onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-bold text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Deal Stage */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Deal Stage
              </label>
              <select
                value={formData.stage}
                onChange={e => {
                  const stage = e.target.value as DealStage;
                  const prob = stage === 'Won' ? 100 : stage === 'Lost' ? 0 : stage === 'Negotiation' ? 80 : stage === 'Proposal' ? 50 : 30;
                  setFormData({ ...formData, stage, probability: prob });
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {STAGES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Probability */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Win Probability (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={e => setFormData({ ...formData, probability: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Expected Close Date */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Expected Close Date
              </label>
              <input
                type="date"
                value={formData.expectedCloseDate}
                onChange={e => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Assigned Rep */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Assigned Sales Representative
              </label>
              <select
                value={formData.assignedTo}
                onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {users.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role === 'admin' ? 'Admin / Manager' : 'Sales Executive'})
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Deal Notes & Terms
              </label>
              <textarea
                rows={2}
                placeholder="Scope, terms discussed, payment milestones..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : dealToEdit ? 'Save Deal' : 'Create Deal'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
