import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, CheckSquare } from 'lucide-react';
import { Task, TaskType, Priority, Lead, Customer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskSaved: () => void;
  taskToEdit?: Task | null;
  defaultLead?: Lead | null;
  leads: Lead[];
  customers: Customer[];
}

const TASK_TYPES: TaskType[] = ['FollowUp', 'Call', 'Email', 'Meeting', 'Proposal', 'Task'];
const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onTaskSaved,
  taskToEdit,
  defaultLead,
  leads,
  customers
}) => {
  const { currentUser, users, showToast } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    leadId: defaultLead?._id || '',
    customerId: '',
    type: 'FollowUp' as TaskType,
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '11:00 AM',
    priority: 'High' as Priority,
    assignedTo: currentUser?._id || 'usr-1',
    description: ''
  });

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title,
        leadId: taskToEdit.leadId || '',
        customerId: taskToEdit.customerId || '',
        type: taskToEdit.type,
        dueDate: taskToEdit.dueDate,
        dueTime: taskToEdit.dueTime || '11:00 AM',
        priority: taskToEdit.priority,
        assignedTo: taskToEdit.assignedTo,
        description: taskToEdit.description || ''
      });
    } else if (defaultLead) {
      setFormData({
        title: `Follow up with ${defaultLead.name} regarding quotation`,
        leadId: defaultLead._id,
        customerId: '',
        type: 'FollowUp',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueTime: '11:00 AM',
        priority: 'High',
        assignedTo: currentUser?._id || 'usr-1',
        description: `Follow-up on ${defaultLead.interest}`
      });
    } else {
      setFormData({
        title: '',
        leadId: '',
        customerId: '',
        type: 'FollowUp',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '11:00 AM',
        priority: 'Medium',
        assignedTo: currentUser?._id || 'usr-1',
        description: ''
      });
    }
  }, [taskToEdit, defaultLead, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) {
      showToast('Title and Due Date are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (taskToEdit) {
        await api.updateTask(taskToEdit._id, formData);
        showToast('Follow-up task updated', 'success');
      } else {
        await api.createTask(formData);
        showToast('New follow-up scheduled!', 'success');
      }
      onTaskSaved();
      onClose();
    } catch (err) {
      showToast('Failed to schedule task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="task-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {taskToEdit ? 'Edit Follow-up Action' : 'Schedule Sales Follow-up'}
              </h2>
              <p className="text-xs text-slate-400">
                Set a reminder task for contacting a lead or customer
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Call Rahul about quotation & payment terms"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Relate to Lead */}
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
                    {l.name} ({l.company || 'Lead'})
                  </option>
                ))}
              </select>
            </div>

            {/* Relate to Customer */}
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

            {/* Task Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Activity Type
              </label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as TaskType })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {TASK_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Due Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Due Time */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Time
              </label>
              <input
                type="text"
                placeholder="e.g. 10:00 AM"
                value={formData.dueTime}
                onChange={e => setFormData({ ...formData, dueTime: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Assigned Rep */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Assigned Salesperson
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
                Task Context / Instructions
              </label>
              <textarea
                rows={2}
                placeholder="What points need to be discussed during this follow-up..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

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
              className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : taskToEdit ? 'Save Task' : 'Schedule Follow-up'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
