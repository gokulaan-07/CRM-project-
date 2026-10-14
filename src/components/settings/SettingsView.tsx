import React, { useState } from 'react';
import { 
  Settings, Users, Shield, Database, RefreshCw, 
  CheckCircle2, Sparkles, User, Info, Building2, Sliders, LogOut
} from 'lucide-react';
import { User as UserType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface SettingsViewProps {
  onRefreshData: () => void;
  onOpenWorkflowGuide: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onRefreshData,
  onOpenWorkflowGuide
}) => {
  const { currentUser, switchUser, users, logout, showToast } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const safeUsers = Array.isArray(users) ? users : [];

  const handleResetData = async () => {
    if (!window.confirm('Reset database to clean Rahul Kumar demonstration data? This will reset all demo leads, deals, and activities.')) {
      return;
    }

    setIsResetting(true);
    try {
      await api.resetSeed();
      showToast('Database reset to standard CRM walkthrough data!', 'success');
      onRefreshData();
    } catch (e) {
      showToast('Failed to reset database', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div id="crm-settings-view" className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">CRM Settings & Sales Team</h1>
            <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-full border border-slate-700">
              System Control
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage sales team roles, simulate multi-user workflows, and inspect CRM sales process parameters.
          </p>
        </div>

        <button
          onClick={onOpenWorkflowGuide}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>Rahul Sales Journey Guide</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Team & Role Switcher */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Sales Team & Role Simulation</span>
              </h2>
              <p className="text-xs text-slate-400">Switch current active user to test Admin vs Sales views</p>
            </div>
            <span className="text-xs text-indigo-400 font-semibold">{users.length} Users</span>
          </div>

          <div className="space-y-2.5">
            {safeUsers.map(u => {
              const isCurrent = currentUser?._id === u._id;
              return (
                <div
                  key={u._id}
                  onClick={() => {
                    switchUser(u._id);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500/80 text-white shadow-xs'
                      : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-slate-700 flex items-center justify-center text-white font-bold text-xs">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        <span>{u.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                            Active User
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px]">{u.email}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    u.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {u.role === 'admin' ? 'Admin / Manager' : 'Sales Representative'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales Pipeline Rules & Stages */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>CRM Sales Workflow Hierarchy</span>
              </h2>
              <p className="text-xs text-slate-400">Pre-configured sales stages for inquiry-to-customer conversion</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-blue-300">1. NEW</span>
              <span className="text-slate-400 text-[11px]">Inquiry captured from website, referral, or email</span>
            </div>
            <div className="p-3 bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-sky-300">2. CONTACTED</span>
              <span className="text-slate-400 text-[11px]">Salesperson called or emailed to confirm requirements</span>
            </div>
            <div className="p-3 bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-emerald-300">3. QUALIFIED</span>
              <span className="text-slate-400 text-[11px]">Budget, timeline, and decision-maker verified</span>
            </div>
            <div className="p-3 bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-amber-300">4. PROPOSAL</span>
              <span className="text-slate-400 text-[11px]">Quotation and scope of work sent for review</span>
            </div>
            <div className="p-3 bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-orange-300">5. NEGOTIATION</span>
              <span className="text-slate-400 text-[11px]">Final price, discounts, and payment terms discussion</span>
            </div>
            <div className="p-3 bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-purple-300">6. WON → CUSTOMER</span>
              <span className="text-slate-400 text-[11px]">Deal closed, converted to active customer record</span>
            </div>
          </div>
        </div>

      </div>

      {/* Current User Session & Account */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">{currentUser?.name}</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  currentUser?.role === 'admin'
                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {currentUser?.role === 'admin' ? 'Administrator' : 'Sales Representative'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentUser?.email} • {currentUser?.department || 'Sales Department'}</p>
            </div>
          </div>

          <button
            id="btn-settings-logout"
            onClick={() => logout()}
            className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 hover:border-rose-600 text-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out of CRM</span>
          </button>
        </div>
      </div>

      {/* Database Reset & Demo Data Setup */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Reset CRM Demonstration Data</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Restores the database with the pre-seeded "Rahul Kumar - E-commerce Website" inquiry and sample pipeline data.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="px-4 py-2 bg-slate-800 hover:bg-rose-950 border border-slate-700 hover:border-rose-700/80 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset to Demo Data'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
