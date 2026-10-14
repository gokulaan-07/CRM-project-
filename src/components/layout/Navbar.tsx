import React, { useState, useEffect } from 'react';
import { 
  Bell, Search, Plus, UserCheck, Shield, ChevronDown, 
  RotateCcw, Sparkles, Check, Phone, Calendar, DollarSign, UserPlus, Menu, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Notification, Task } from '../../types';

interface NavbarProps {
  onOpenNewLead: () => void;
  onOpenNewDeal: () => void;
  onOpenNewFollowUp?: () => void;
  onOpenWorkflowGuide: () => void;
  onNavigate?: (tab: string) => void;
  onToggleMobileSidebar?: () => void;
  tasks?: Task[];
  onRefreshData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewLead,
  onOpenNewDeal,
  onOpenNewFollowUp,
  onOpenWorkflowGuide,
  onNavigate,
  onToggleMobileSidebar,
  tasks,
  onRefreshData
}) => {
  const { currentUser, users, switchUser, logout, showToast } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications(currentUser?._id);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead(currentUser?._id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('All notifications marked as read', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset CRM database to fresh sample data (including Rahul Kumar e-commerce lead)?')) return;
    setIsResetting(true);
    try {
      await api.resetSeed();
      showToast('Database reset to fresh initial state with Rahul Kumar lead!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (e) {
      showToast('Failed to reset database', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header id="crm-top-navbar" className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 px-3 lg:px-6 py-2.5 flex items-center justify-between shadow-sm">
      {/* Left Search, Mobile Menu Toggle and Title Info */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-xl">
        {onToggleMobileSidebar && (
          <button
            id="btn-toggle-mobile-sidebar"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="global-crm-search-input"
            type="text"
            placeholder="Search leads, customers, deals, phone..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs lg:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Guided Workflow Button */}
        <button
          id="btn-crm-workflow-guide"
          onClick={onOpenWorkflowGuide}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-600/40 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          title="See Rahul's Journey from Inquiry to Customer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
          <span className="hidden xs:inline">Sales Journey</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            id="btn-quick-create-menu"
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Quick Add</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showQuickCreate && (
            <div 
              id="quick-create-dropdown"
              className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1.5 z-40 text-xs"
              onClick={() => setShowQuickCreate(false)}
            >
              <button
                id="quick-add-lead-btn"
                onClick={onOpenNewLead}
                className="w-full text-left px-4 py-2 hover:bg-slate-700/60 text-slate-200 flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>New Lead</span>
              </button>
              <button
                id="quick-add-deal-btn"
                onClick={onOpenNewDeal}
                className="w-full text-left px-4 py-2 hover:bg-slate-700/60 text-slate-200 flex items-center gap-2 cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                <span>New Deal</span>
              </button>
              <button
                id="quick-add-followup-btn"
                onClick={onOpenNewFollowUp}
                className="w-full text-left px-4 py-2 hover:bg-slate-700/60 text-slate-200 flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Schedule Follow-up</span>
              </button>
            </div>
          )}
        </div>

        {/* Database Reset Button */}
        <button
          id="btn-reset-seed-data"
          onClick={handleResetData}
          disabled={isResetting}
          className="p-1.5 lg:px-2.5 lg:py-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Reset database to fresh default state"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden xl:inline">Reset Data</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="btn-navbar-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 relative transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div 
              id="notifications-dropdown-menu"
              className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-40 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-700 flex items-center justify-between bg-slate-800/90">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-100">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    id="btn-mark-all-notifications-read"
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-700/50">
                {safeNotifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  safeNotifications.map(n => (
                    <div
                      key={n._id}
                      className={`p-3 text-xs transition-colors hover:bg-slate-700/40 ${!n.read ? 'bg-indigo-950/20' : ''}`}
                    >
                      <p className="font-medium text-slate-200">{n.title}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Switcher Dropdown */}
        <div className="relative">
          <button
            id="btn-user-profile-switcher"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/90 border border-slate-700 rounded-lg p-1 lg:px-2.5 lg:py-1.5 transition-colors cursor-pointer text-left"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-6 h-6 rounded-full object-cover border border-slate-600"
            />
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-slate-200 leading-tight flex items-center gap-1">
                {currentUser?.name}
                {currentUser?.role === 'admin' && (
                  <Shield className="w-3 h-3 text-amber-400" />
                )}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">
                {currentUser?.role === 'admin' ? 'Admin / Manager' : 'Sales Representative'}
              </p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
          </button>

          {showUserMenu && (
            <div
              id="user-switcher-dropdown"
              className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-40 text-xs"
            >
              <div className="px-2 py-1.5 border-b border-slate-700/80 mb-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active User
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Test CRM as Admin or Sales Rep
                </p>
              </div>

              <div className="space-y-1">
                {users.map(u => (
                  <button
                    key={u._id}
                    onClick={() => {
                      switchUser(u._id);
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                      currentUser?._id === u._id 
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                        : 'hover:bg-slate-700/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-slate-200 text-xs">{u.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">
                          {u.role === 'admin' ? 'Admin / Manager' : 'Sales Executive'}
                        </p>
                      </div>
                    </div>
                    {currentUser?._id === u._id && (
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Sign Out Option */}
              <div className="pt-2 mt-2 border-t border-slate-700/80">
                <button
                  id="btn-navbar-logout"
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-rose-300 hover:text-white hover:bg-rose-950/60 border border-transparent hover:border-rose-800/60 transition-colors cursor-pointer text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out of CRM</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
