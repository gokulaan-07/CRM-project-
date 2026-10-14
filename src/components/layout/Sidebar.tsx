import React from 'react';
import { 
  LayoutDashboard, Users, Kanban, UserCheck, DollarSign, 
  CalendarCheck, MessageSquare, Calendar, BarChart3, Settings,
  ShieldCheck, Sparkles, Briefcase, ChevronLeft, ChevronRight, X, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  leadsCount?: number;
  customersCount?: number;
  dealsCount?: number;
  pendingTasksCount?: number;
  pendingFollowupsCount?: number;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  onOpenWorkflowGuide?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onSelectTab,
  leadsCount = 0,
  customersCount = 0,
  dealsCount = 0,
  pendingTasksCount = 0,
  pendingFollowupsCount = 0,
  isCollapsed = false,
  setIsCollapsed,
  isMobileOpen = false,
  setIsMobileOpen,
  onOpenWorkflowGuide
}) => {
  const { currentUser, logout } = useAuth();
  const followupsCount = pendingTasksCount || pendingFollowupsCount || 0;

  const handleSelectTab = (tabId: string) => {
    if (setActiveTab) {
      setActiveTab(tabId);
    }
    if (onSelectTab) {
      onSelectTab(tabId);
    }
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const navItemClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-all cursor-pointer ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
    }`;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        id="crm-main-sidebar"
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div 
            onClick={() => handleSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-sm lg:text-base text-white tracking-tight flex items-center gap-1.5">
                  Sales CRM
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Pro
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 truncate">Internal Sales Platform</p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Button */}
          {setIsCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Core Dashboard */}
          <div>
            <button
              id="nav-dashboard"
              onClick={() => handleSelectTab('dashboard')}
              className={navItemClass('dashboard')}
              title="Dashboard"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 shrink-0 text-indigo-400" />
                {!isCollapsed && <span>Dashboard</span>}
              </div>
            </button>
          </div>

          {/* Section: SALES */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Sales Pipeline
              </div>
            )}

            <button
              id="nav-leads"
              onClick={() => handleSelectTab('leads')}
              className={navItemClass('leads')}
              title="Leads"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 shrink-0 text-emerald-400" />
                {!isCollapsed && <span>Leads</span>}
              </div>
              {!isCollapsed && leadsCount > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === 'leads' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {leadsCount}
                </span>
              )}
            </button>

            <button
              id="nav-lead-pipeline"
              onClick={() => handleSelectTab('pipeline')}
              className={navItemClass('pipeline')}
              title="Lead Pipeline"
            >
              <div className="flex items-center gap-3">
                <Kanban className="w-4 h-4 shrink-0 text-amber-400" />
                {!isCollapsed && <span>Lead Pipeline</span>}
              </div>
            </button>

            <button
              id="nav-customers"
              onClick={() => handleSelectTab('customers')}
              className={navItemClass('customers')}
              title="Customers"
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4 shrink-0 text-blue-400" />
                {!isCollapsed && <span>Customers</span>}
              </div>
              {!isCollapsed && customersCount > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === 'customers' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {customersCount}
                </span>
              )}
            </button>

            <button
              id="nav-deals"
              onClick={() => handleSelectTab('deals')}
              className={navItemClass('deals')}
              title="Deals"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 shrink-0 text-purple-400" />
                {!isCollapsed && <span>Deals</span>}
              </div>
              {!isCollapsed && dealsCount > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === 'deals' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {dealsCount}
                </span>
              )}
            </button>
          </div>

          {/* Section: ACTIVITIES */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Activities & Comms
              </div>
            )}

            <button
              id="nav-followups"
              onClick={() => handleSelectTab('followups')}
              className={navItemClass('followups')}
              title="Follow-ups"
            >
              <div className="flex items-center gap-3">
                <CalendarCheck className="w-4 h-4 shrink-0 text-orange-400" />
                {!isCollapsed && <span>Follow-ups</span>}
              </div>
              {!isCollapsed && followupsCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  {followupsCount}
                </span>
              )}
            </button>

            <button
              id="nav-communication"
              onClick={() => handleSelectTab('communication')}
              className={navItemClass('communication')}
              title="Communication Timeline"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 shrink-0 text-teal-400" />
                {!isCollapsed && <span>Communication</span>}
              </div>
            </button>

            <button
              id="nav-calendar"
              onClick={() => handleSelectTab('calendar')}
              className={navItemClass('calendar')}
              title="Calendar"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 shrink-0 text-rose-400" />
                {!isCollapsed && <span>Calendar</span>}
              </div>
            </button>
          </div>

          {/* Section: ANALYTICS & SETTINGS */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Intelligence & Admin
              </div>
            )}

            <button
              id="nav-analytics"
              onClick={() => handleSelectTab('analytics')}
              className={navItemClass('analytics')}
              title="Analytics"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 shrink-0 text-cyan-400" />
                {!isCollapsed && <span>Analytics</span>}
              </div>
            </button>

            <button
              id="nav-settings"
              onClick={() => handleSelectTab('settings')}
              className={navItemClass('settings')}
              title="Settings & Team"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 shrink-0 text-indigo-400" />
                {!isCollapsed && <span>Settings & Team</span>}
              </div>
              {!isCollapsed && currentUser?.role === 'admin' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  Admin
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Footer / Workflow Summary Guide Card */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-800 bg-slate-900/90">
            <button
              onClick={onOpenWorkflowGuide}
              className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-indigo-300 font-semibold mb-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Sales Workflow</span>
                </div>
                <span className="text-[10px] text-amber-400 font-normal underline">Guide</span>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-tight">
                Lead → Contacted → Qualified → Proposal → Negotiation → Won → Convert
              </p>
            </button>
          </div>
        )}

        {/* User Account & Logout Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
            />
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 truncate capitalize">
                  {currentUser?.role === 'admin' ? 'Admin / Manager' : 'Sales Representative'}
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={() => logout()}
              title="Sign Out of CRM"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
