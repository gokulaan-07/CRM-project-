import React, { useState, useEffect } from 'react';
import { X, UserPlus, Building2, Mail, Phone, IndianRupee, FileText, User } from 'lucide-react';
import { Lead, LeadSource, LeadStatus, Priority } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadSaved: () => void;
  leadToEdit?: Lead | null;
}

const SOURCES: LeadSource[] = [
  'Website',
  'Referral',
  'Advertisement',
  'Social Media',
  'Email',
  'Phone',
  'Other'
];

const STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost'
];

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onLeadSaved,
  leadToEdit
}) => {
  const { currentUser, users, showToast } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    interest: '',
    source: 'Website' as LeadSource,
    status: 'New' as LeadStatus,
    priority: 'Medium' as Priority,
    estimatedValue: 150000,
    assignedTo: currentUser?._id || 'usr-1',
    notes: ''
  });

  useEffect(() => {
    if (leadToEdit) {
      setFormData({
        name: leadToEdit.name,
        company: leadToEdit.company,
        email: leadToEdit.email,
        phone: leadToEdit.phone,
        interest: leadToEdit.interest,
        source: leadToEdit.source,
        status: leadToEdit.status,
        priority: leadToEdit.priority,
        estimatedValue: leadToEdit.estimatedValue,
        assignedTo: leadToEdit.assignedTo,
        notes: leadToEdit.notes || ''
      });
    } else {
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        interest: '',
        source: 'Website',
        status: 'New',
        priority: 'Medium',
        estimatedValue: 150000,
        assignedTo: currentUser?._id || 'usr-1',
        notes: ''
      });
    }
  }, [leadToEdit, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Lead name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (leadToEdit) {
        await api.updateLead(leadToEdit._id, formData, currentUser?._id || 'usr-1');
        showToast(`Lead "${formData.name}" updated successfully!`, 'success');
      } else {
        await api.createLead(formData, currentUser?._id || 'usr-1');
        showToast(`New lead "${formData.name}" added to CRM!`, 'success');
      }
      onLeadSaved();
      onClose();
    } catch (err) {
      showToast('Error saving lead. Please try again.', 'error');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="lead-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {leadToEdit ? 'Edit Lead Details' : 'Add New Potential Customer (Lead)'}
              </h2>
              <p className="text-xs text-slate-400">
                Enter contact requirements and estimated opportunity value
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="lead-form-name"
                type="text"
                required
                placeholder="e.g. Rahul Kumar"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Company / Organization
              </label>
              <input
                id="lead-form-company"
                type="text"
                placeholder="e.g. ABC Technologies"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Email Address
              </label>
              <input
                id="lead-form-email"
                type="email"
                placeholder="e.g. rahul.kumar@abctech.in"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Phone Number
              </label>
              <input
                id="lead-form-phone"
                type="text"
                placeholder="e.g. +91 98112 34567"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Product / Requirement Interest */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Requirement / Interest
              </label>
              <input
                id="lead-form-interest"
                type="text"
                placeholder="e.g. E-commerce Website with payment integration"
                value={formData.interest}
                onChange={e => setFormData({ ...formData, interest: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Estimated Value */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Estimated Value (₹ INR)
              </label>
              <input
                id="lead-form-value"
                type="number"
                min="0"
                step="5000"
                value={formData.estimatedValue}
                onChange={e => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-semibold text-emerald-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Source */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Lead Source
              </label>
              <select
                id="lead-form-source"
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value as LeadSource })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {SOURCES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Sales Stage / Status
              </label>
              <select
                id="lead-form-status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {STATUSES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Priority
              </label>
              <select
                id="lead-form-priority"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Assigned Salesperson */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Assigned Salesperson
              </label>
              <select
                id="lead-form-assigned"
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
                Requirement Notes & Context
              </label>
              <textarea
                id="lead-form-notes"
                rows={3}
                placeholder="Details gathered during initial inquiry, catalog size, preferred payment gateway, deadlines..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-lead-form-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? 'Saving...' : leadToEdit ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
