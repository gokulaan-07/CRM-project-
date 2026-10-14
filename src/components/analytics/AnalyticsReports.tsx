import React from 'react';
import { 
  BarChart3, TrendingUp, Users, Target, IndianRupee, 
  PieChart as PieIcon, Award, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from 'recharts';
import { Lead, Customer, Deal, Task, User as UserType } from '../../types';

interface AnalyticsReportsProps {
  leads: Lead[];
  customers: Customer[];
  deals: Deal[];
  tasks: Task[];
  users: UserType[];
}

const COLORS = ['#6366f1', '#38bdf8', '#34d399', '#f59e0b', '#f97316', '#a855f7', '#f43f5e'];

export const AnalyticsReports: React.FC<AnalyticsReportsProps> = ({
  leads,
  customers,
  deals,
  tasks,
  users
}) => {
  const safeLeads = Array.isArray(leads) ? leads : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeDeals = Array.isArray(deals) ? deals : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeUsers = Array.isArray(users) ? users : [];

  // 1. Pipeline Funnel by Stage
  const stageCounts: { [key: string]: { count: number; value: number } } = {
    New: { count: 0, value: 0 },
    Contacted: { count: 0, value: 0 },
    Qualified: { count: 0, value: 0 },
    Proposal: { count: 0, value: 0 },
    Negotiation: { count: 0, value: 0 },
    Won: { count: 0, value: 0 },
    Lost: { count: 0, value: 0 }
  };

  safeLeads.forEach(l => {
    if (stageCounts[l.status]) {
      stageCounts[l.status].count += 1;
      stageCounts[l.status].value += (l.estimatedValue || 0);
    }
  });

  const funnelData = Object.keys(stageCounts).map(stage => ({
    stage,
    leads: stageCounts[stage].count,
    value: Math.round(stageCounts[stage].value / 1000) // in thousands
  }));

  // 2. Lead Sources Breakdown
  const sourceMap: { [key: string]: number } = {};
  safeLeads.forEach(l => {
    sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
  });
  const sourceData = Object.keys(sourceMap).map(src => ({
    name: src,
    value: sourceMap[src]
  }));

  // 3. Sales Rep Performance
  const repPerformance = safeUsers.map(u => {
    const userLeads = safeLeads.filter(l => l.assignedTo === u._id);
    const userDeals = safeDeals.filter(d => d.assignedTo === u._id);
    const wonDeals = userDeals.filter(d => d.stage === 'Won');
    const revenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const convertedLeads = userLeads.filter(l => l.isConverted || l.status === 'Converted' || l.status === 'Won').length;

    return {
      name: u.name,
      leads: userLeads.length,
      converted: convertedLeads,
      wonDeals: wonDeals.length,
      revenue: Math.round(revenue / 1000) // in '000s
    };
  });

  // KPI Calculations
  const totalLeads = safeLeads.length;
  const convertedLeadsCount = safeLeads.filter(l => l.isConverted || l.status === 'Converted' || l.status === 'Won').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeadsCount / totalLeads) * 100).toFixed(1) : '0';

  const totalWonRevenue = safeDeals.filter(d => d.stage === 'Won').reduce((sum, d) => sum + (d.value || 0), 0);
  const totalPipelineRevenue = safeDeals.filter(d => d.stage !== 'Lost').reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div id="analytics-reports-view" className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Sales Analytics & KPI Reports</h1>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
              Live Metrics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor conversion rates, sales rep leaderboard, lead acquisition channels, and revenue trends.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Leads Pipeline</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{totalLeads}</span>
            <span className="text-xs text-indigo-400 font-semibold">{customers.length} Customers</span>
          </div>
          <p className="text-[11px] text-slate-400">Inquiry-to-deal conversion base</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Lead Conversion Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400">{conversionRate}%</span>
            <span className="text-xs text-emerald-400/80 font-medium">Industry Avg: 15%</span>
          </div>
          <p className="text-[11px] text-slate-400">{convertedLeadsCount} won/converted accounts</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Closed Won Revenue</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-purple-400">₹{(totalWonRevenue / 100000).toFixed(1)}L</span>
            <span className="text-xs text-purple-300 font-medium">{deals.filter(d => d.stage === 'Won').length} Deals</span>
          </div>
          <p className="text-[11px] text-slate-400">Total verified client revenue</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Active Deals In Pipe</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-400">₹{(totalPipelineRevenue / 100000).toFixed(1)}L</span>
            <span className="text-xs text-amber-300 font-medium">{deals.length} Opportunities</span>
          </div>
          <p className="text-[11px] text-slate-400">Across proposal & negotiation</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Pipeline Funnel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Lead Pipeline Funnel</h2>
              <p className="text-xs text-slate-400">Number of leads at each stage of the sales journey</p>
            </div>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Bar dataKey="leads" fill="#6366f1" radius={[6, 6, 0, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Pie */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Lead Acquisition Sources</h2>
              <p className="text-xs text-slate-400">Where high-value inquiries originate from</p>
            </div>
            <PieIcon className="w-4 h-4 text-teal-400" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Sales Team Performance Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Sales Team Performance Leaderboard</h2>
            <p className="text-xs text-slate-400">Assigned leads, conversion counts, and closed revenue per representative</p>
          </div>
          <Award className="w-5 h-5 text-amber-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-slate-400 bg-slate-850 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Sales Representative</th>
                <th className="py-3 px-4 font-semibold">Assigned Leads</th>
                <th className="py-3 px-4 font-semibold">Converted Leads</th>
                <th className="py-3 px-4 font-semibold">Deals Won</th>
                <th className="py-3 px-4 font-semibold">Conversion Rate</th>
                <th className="py-3 px-4 font-semibold text-right">Closed Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {repPerformance.map((rep, idx) => {
                const repRate = rep.leads > 0 ? ((rep.converted / rep.leads) * 100).toFixed(0) : '0';
                return (
                  <tr key={rep.name} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <span>{rep.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{rep.leads} Leads</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">{rep.converted} Clients</td>
                    <td className="py-3.5 px-4 text-purple-300 font-medium">{rep.wonDeals} Won</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                        {repRate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400 text-sm">
                      ₹{(rep.revenue * 1000).toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
