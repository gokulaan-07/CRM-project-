import React, { useState } from 'react';
import { 
  Briefcase, Mail, Lock, User, ArrowRight, ShieldCheck, 
  Eye, EyeOff, Building, Users, CheckCircle, Sparkles, KeyRound, 
  HelpCircle, ChevronRight, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, register, switchUser, users } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('gokulaan9c@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'sales'>('sales');
  const [department, setDepartment] = useState('Enterprise Sales');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.');
        }
        await login(email.trim().toLowerCase(), password);
      } else {
        if (!name.trim()) throw new Error('Full name is required.');
        if (!email.trim()) throw new Error('Work email is required.');
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          department,
          phone: phone.trim()
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, userPass: string = 'password123') => {
    setErrorMessage(null);
    setEmail(userEmail);
    setPassword(userPass);
    setIsLoading(true);
    try {
      await login(userEmail, userPass);
    } catch (err: any) {
      // If direct login fails, try switchUser if matched in preloaded users list
      const matched = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
      if (matched) {
        try {
          await switchUser(matched._id);
          return;
        } catch {}
      }
      setErrorMessage(err.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top Header */}
      <header className="border-b border-slate-850 px-6 py-4 flex items-center justify-between relative z-10 backdrop-blur-md bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">Sales CRM</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Customer Relationship & Sales Pipeline System</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Secure Session (JWT & MongoDB)</span>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Value Proposition & Workflow Overview */}
          <div className="lg:col-span-5 space-y-6 hidden lg:block pr-4">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950/70 text-indigo-300 border border-indigo-800/60">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                Production Sales Platform
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                Accelerate deals from inquiry to closed customer.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                A unified sales workspace for managing leads, tracking pipeline progression, scheduling follow-ups, and collaborating across your enterprise sales team.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-800/50 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">360° Lead & Customer Records</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Track interaction history, contact channels, lead scores, and 1-click customer conversions.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-950/70 text-indigo-400 border border-indigo-800/50 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Interactive Kanban Deal Pipeline</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Drag-and-drop deals across Qualification, Proposal, Negotiation, and Closed-Won stages.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-950/70 text-amber-400 border border-amber-800/50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Role-Based Access Control (RBAC)</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Full administrator governance or focused sales representative workspaces.
                  </p>
                </div>
              </div>
            </div>

            {/* Walkthrough Highlight */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-600/30 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preloaded Demonstration Data</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Includes active lead <span className="text-white font-medium">Rahul Kumar (Zenith Retails)</span> exploring an E-commerce platform implementation.
              </p>
            </div>
          </div>

          {/* Right Column: Auth Card */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative">
              
              {/* Card Header & Mode Switcher */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {mode === 'login' ? 'Sign In to Your Workspace' : 'Create Team Account'}
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    {mode === 'login' 
                      ? 'Enter your CRM credentials to access the sales platform' 
                      : 'Register a new sales executive or manager profile'}
                  </p>
                </div>

                <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMessage(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      mode === 'login' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setErrorMessage(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      mode === 'register' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="flex-1">{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Additional Register Fields */}
                {mode === 'register' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Verma"
                        required
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        Role Access
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'admin' | 'sales')}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      >
                        <option value="sales">Sales Representative</option>
                        <option value="admin">Administrator / Manager</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      >
                        <option value="Enterprise Sales">Enterprise Sales</option>
                        <option value="Inside Sales">Inside Sales</option>
                        <option value="Mid-Market Sales">Mid-Market Sales</option>
                        <option value="Customer Success">Customer Success</option>
                        <option value="Sales & Management">Sales & Management</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Work Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="crm-login-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      autoComplete="email"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="crm-login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                {mode === 'login' && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Keep me signed in on this workstation</span>
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  id="crm-login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign In to CRM' : 'Create & Access Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Login Section */}
              <div className="mt-6 pt-5 border-t border-slate-850">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    Quick One-Click Demo Access
                  </span>
                  <span className="text-[10px] text-slate-500">No typing needed</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Admin Account: Gokulaan */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('gokulaan9c@gmail.com', 'password123')}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-left transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-300 border border-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                        GK
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-white group-hover:text-indigo-300 truncate">
                            Gokulaan
                          </p>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-purple-900/60 text-purple-200 border border-purple-700/50">
                            Admin
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">gokulaan9c@gmail.com</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* Sales Rep: Priya Sharma */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('priya.sharma@example.com', 'password123')}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                        PS
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-white group-hover:text-emerald-300 truncate">
                            Priya Sharma
                          </p>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/50">
                            Sales
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">priya.sharma@example.com</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset CRM Credentials</h3>
                <p className="text-xs text-slate-400">Authentication assistance for sales team</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              All pre-configured team accounts (including administrator <strong className="text-white">gokulaan9c@gmail.com</strong> and sales reps) use the default password:
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
              <code className="text-sm font-mono text-indigo-300 font-bold">password123</code>
            </div>

            <p className="text-[11px] text-slate-400">
              For custom accounts created during this session, credentials are stored in your active MongoDB database instance. You can reset the database at any time using the Reset Data tool.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimalistic Footer */}
      <footer className="border-t border-slate-850 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 relative z-10 bg-slate-950/80">
        <p>© {new Date().getFullYear()} Sales CRM Platform • Enterprise Customer & Pipeline Management</p>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span>Role-Based Access</span>
          <span>•</span>
          <span>MongoDB Persistence</span>
          <span>•</span>
          <span>JWT Security</span>
        </div>
      </footer>
    </div>
  );
};
