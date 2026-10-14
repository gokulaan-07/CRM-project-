import React, { useState } from 'react';
import { 
  Calendar, CheckSquare, Plus, Search, Filter, Clock, 
  Check, Trash2, Edit, AlertCircle, Building2, User
} from 'lucide-react';
import { Task, Lead, Customer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface FollowUpsListProps {
  tasks: Task[];
  leads: Lead[];
  customers: Customer[];
  onOpenNewTask: () => void;
  onOpenEditTask: (task: Task) => void;
  onRefreshData: () => void;
}

export const FollowUpsList: React.FC<FollowUpsListProps> = ({
  tasks,
  leads,
  customers,
  onOpenNewTask,
  onOpenEditTask,
  onRefreshData
}) => {
  const { currentUser, showToast } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Completed'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.toggleTaskStatus(task._id, nextStatus);
      showToast(nextStatus === 'Completed' ? 'Task marked completed' : 'Task marked pending', 'info');
      onRefreshData();
    } catch (err) {
      showToast('Failed to update task status', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!window.confirm(`Delete task "${title}"?`)) return;
    try {
      await api.deleteTask(taskId);
      showToast('Task deleted', 'info');
      onRefreshData();
    } catch (err) {
      showToast('Failed to delete task', 'error');
    }
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const filteredTasks = safeTasks.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.leadName && t.leadName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = safeTasks.filter(t => t.status === 'Pending').length;
  const completedCount = safeTasks.filter(t => t.status === 'Completed').length;

  return (
    <div id="followups-tasks-view" className="space-y-5 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Sales Follow-ups & Reminders</h1>
            <span className="text-xs bg-orange-500/20 text-orange-300 font-semibold px-2 py-0.5 rounded-full border border-orange-500/30">
              {pendingCount} Pending
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Never miss a follow-up call, proposal submission, or customer check-in.
          </p>
        </div>

        <button
          onClick={onOpenNewTask}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Follow-up</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search follow-up tasks, lead names, reminders..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Status ({tasks.length})</option>
            <option value="Pending">Pending ({pendingCount})</option>
            <option value="Completed">Completed ({completedCount})</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Task Types</option>
            <option value="FollowUp">Follow-up</option>
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Meeting">Meeting</option>
            <option value="Proposal">Proposal</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
            No follow-up tasks found matching your filters.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task._id}
              className={`bg-slate-900 border rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs ${
                task.status === 'Completed'
                  ? 'border-slate-800/80 bg-slate-900/60 opacity-75'
                  : task.priority === 'High'
                  ? 'border-orange-500/30 bg-slate-900 hover:border-orange-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <button
                  onClick={() => handleToggleStatus(task)}
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    task.status === 'Completed'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-slate-600 bg-slate-800 hover:border-indigo-500'
                  }`}
                  title={task.status === 'Completed' ? 'Mark Pending' : 'Mark Complete'}
                >
                  {task.status === 'Completed' && <Check className="w-3.5 h-3.5" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-sm ${task.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {task.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {task.type}
                    </span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                      task.priority === 'High' ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-slate-400 text-xs">{task.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-slate-400 text-[11px] pt-1">
                    {task.leadName && (
                      <span className="flex items-center gap-1 text-indigo-300">
                        <User className="w-3 h-3 text-indigo-400" />
                        Lead: {task.leadName}
                      </span>
                    )}
                    {task.customerName && (
                      <span className="flex items-center gap-1 text-teal-300">
                        <Building2 className="w-3 h-3 text-teal-400" />
                        Client: {task.customerName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-400" />
                      Due: {task.dueDate} {task.dueTime}
                    </span>
                    <span>• Assigned: {task.assignedUserName || 'Sales Rep'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => onOpenEditTask(task)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Edit task"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task._id, task.title)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
