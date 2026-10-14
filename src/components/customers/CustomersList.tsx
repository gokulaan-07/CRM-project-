import React, { useState } from 'react';
import { 
  UserCheck, Search, Plus, Building2, Phone, Mail, User, 
  IndianRupee, ExternalLink, ShieldCheck, Sparkles, Filter
} from 'lucide-react';
import { Customer, CustomerStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface CustomersListProps {
  customers: Customer[];
  onOpenCustomerDetails: (customer: Customer) => void;
  onRefreshData: () => void;
}

export const CustomersList: React.FC<CustomersListProps> = ({
  customers,
  onOpenCustomerDetails,
  onRefreshData
}) => {
  const { currentUser, showToast } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case 'VIP': return 'bg-purple-500/10 text-purple-400 border-purple-500/30 font-bold';
      case 'Active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold';
      case 'Inactive': return 'bg-slate-700/60 text-slate-400 border-slate-600';
      case 'Churned': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const safeCustomers = Array.isArray(customers) ? customers : [];
  const filtered = safeCustomers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCustomerValue = safeCustomers.reduce((sum, c) => sum + (c.totalValue || 0), 0);

  return (
    <div id="customers-list-view" className="space-y-5 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Active Customers & Clients</h1>
            <span className="text-xs bg-teal-500/20 text-teal-300 font-semibold px-2 py-0.5 rounded-full border border-teal-500/30">
              {customers.length} Accounts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            A customer is a lead that successfully converted after winning the sale. Total Customer Value: <strong className="text-emerald-400">₹{(totalCustomerValue / 100000).toFixed(1)} Lakhs</strong>
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="customers-search-input"
            type="text"
            placeholder="Search customers by contact, company, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          id="customers-status-filter"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="Active">Active</option>
          <option value="VIP">VIP</option>
          <option value="Inactive">Inactive</option>
          <option value="Churned">Churned</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-slate-400 bg-slate-850 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Customer / Account</th>
                <th className="py-3 px-4 font-semibold">Contact Person</th>
                <th className="py-3 px-4 font-semibold">Email & Phone</th>
                <th className="py-3 px-4 font-semibold">Account Value</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Assigned Salesperson</th>
                <th className="py-3 px-4 font-semibold text-right">360 View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No customer accounts found matching your query.
                  </td>
                </tr>
              ) : (
                filtered.map(cust => (
                  <tr
                    key={cust._id}
                    onClick={() => onOpenCustomerDetails(cust)}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                        {cust.company || cust.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {cust.industry || 'Technology Client'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {cust.name}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-300">{cust.email}</div>
                      <div className="text-[11px] text-slate-400">{cust.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      ₹{cust.totalValue.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] border ${getStatusBadge(cust.status)}`}>
                        {cust.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-indigo-300 font-medium">
                      {cust.assignedUserName || 'Gokulaan'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOpenCustomerDetails(cust)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <span>View 360°</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
