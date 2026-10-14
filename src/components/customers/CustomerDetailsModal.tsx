import React, { useState, useEffect } from 'react';
import { 
  X, Building2, Phone, Mail, User, IndianRupee, Calendar, 
  MessageSquare, Clock, Check, Plus, DollarSign, Award, Briefcase, FileText
} from 'lucide-react';
import { Customer, Activity, Task, Deal, ActivityType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface CustomerDetailsModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onCustomerUpdated: () => void;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  customer,
  isOpen,
  onClose,
  onCustomerUpdated
}) => {
  const { currentUser, showToast } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Quick activity logger state
  const [actType, setActType] = useState<ActivityType>('Call');
  const [actTitle, setActTitle] = useState('');
  const [actDescription, setActDescription] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const fetchCustomerData = async () => {
    if (!customer) return;
    try {
      setIsLoading(true);
      const [acts, allTasks, allDeals] = await Promise.all([
        api.getActivities({ customerId: customer._id }),
        api.getTasks(),
        api.getDeals()
      ]);
      setActivities(acts);
      setTasks(allTasks.filter(t => t.customerId === customer._id));
      setDeals(allDeals.filter(d => d.customerId === customer._id));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && customer) {
      fetchCustomerData();
    }
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle) return;
    setIsLogging(true);
    try {
      await api.createActivity({
        customerId: customer._id,
        customerName: customer.company || customer.name,
        type: actType,
        title: actTitle,
        description: actDescription,
        performedBy: currentUser?._id || 'usr-1',
        timestamp: new Date().toISOString()
      }, currentUser?._id || 'usr-1');

      showToast(`${actType} recorded for customer!`, 'success');
      setActTitle('');
      setActDescription('');
      fetchCustomerData();
    } catch (e) {
      showToast('Failed to record activity', 'error');
    } finally {
      setIsLogging(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const next = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      await api.toggleTaskStatus(taskId, next);
      showToast(next === 'Completed' ? 'Task marked complete' : 'Task pending', 'info');
      fetchCustomerData();
    } catch (e) {
      showToast('Failed to update task', 'error');
    }
  };

  return (
    <div id="customer-details-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-850 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-teal-600/30 shrink-0">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white tracking-tight">{customer.company || customer.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {customer.status} Client
                </span>
                {customer.industry && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                    {customer.industry}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>Contact Person: <strong className="text-slate-200">{customer.name}</strong></span>
                <span>•</span>
                <span>Assigned Salesperson: <strong className="text-indigo-300">{customer.assignedUserName || 'Gokulaan'}</strong></span>
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

        {/* Scrollable Content (360-degree view) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Total Account Value</span>
              <span className="text-base font-bold text-emerald-400">
                ₹{customer.totalValue.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Client Email</span>
              <span className="font-semibold text-slate-200 truncate block">{customer.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Phone Number</span>
              <span className="font-semibold text-slate-200">{customer.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Client Since</span>
              <span className="text-slate-300">
                {customer.convertedAt ? new Date(customer.convertedAt).toLocaleDateString() : new Date(customer.createdAt).toLocaleDateString()}
              </span>
            </div>

            {customer.address && (
              <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-700/40">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Office / Billing Address</span>
                <p className="text-slate-300 mt-0.5">{customer.address}</p>
              </div>
            )}

            {customer.notes && (
              <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-700/40">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Account Notes</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">{customer.notes}</p>
              </div>
            )}
          </div>

          {/* Associated Deals */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <span>Contracts & Closed Deals ({deals.length})</span>
            </h3>

            {deals.length === 0 ? (
              <div className="p-3 bg-slate-800/30 border border-slate-800 rounded-xl text-xs text-slate-400">
                No deals recorded for this customer.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {deals.map(d => (
                  <div key={d._id} className="p-3 bg-slate-800/60 border border-slate-700/70 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{d.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.stage === 'Won' ? 'bg-emerald-950 text-emerald-300' : 'bg-indigo-950 text-indigo-300'}`}>
                        {d.stage}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-emerald-400">₹{d.value.toLocaleString('en-IN')}</span>
                      <span className="text-slate-400 text-[10px]">Closed: {d.expectedCloseDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks & Follow-ups */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span>Customer Tasks & Follow-ups</span>
            </h3>

            {tasks.length === 0 ? (
              <div className="p-3 bg-slate-800/30 border border-slate-800 rounded-xl text-xs text-slate-400">
                No active tasks scheduled for this customer.
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map(t => (
                  <div key={t._id} className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
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
                        <p className="text-[11px] text-slate-400">Due: {t.dueDate} {t.dueTime}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">{t.assignedUserName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Log Communication Form */}
          <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-400" />
              <span>Log Client Communication</span>
            </h3>

            <form onSubmit={handleLogActivity} className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                {(['Call', 'Email', 'Meeting', 'Note'] as ActivityType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActType(type)}
                    className={`px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                      actType === type ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Summary, e.g. Sprint check-in call with client"
                  value={actTitle}
                  onChange={e => setActTitle(e.target.value)}
                  className="sm:col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isLogging}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg py-2 cursor-pointer transition-colors"
                >
                  {isLogging ? 'Logging...' : `Log ${actType}`}
                </button>
              </div>

              <textarea
                rows={2}
                placeholder="Discussion details, feedback, or deliverables..."
                value={actDescription}
                onChange={e => setActDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </form>
          </div>

          {/* Full Activity & Communication History */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Full Communication & Activity Timeline</span>
            </h3>

            <div className="space-y-3 pl-2 border-l-2 border-slate-800">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-500 pl-2">No activities recorded for this customer.</p>
              ) : (
                activities.map(act => (
                  <div key={act._id} className="relative pl-4 text-xs">
                    <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-slate-900" />
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
                        <p className="text-slate-400 text-xs mt-1">{act.description}</p>
                      )}
                      <p className="text-[10px] text-teal-300 mt-1">Recorded by {act.performedByName || 'Sales'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Close 360 View
          </button>
        </div>

      </div>
    </div>
  );
};
