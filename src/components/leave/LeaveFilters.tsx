import React from 'react';
import { Search, Filter } from 'lucide-react';

interface Props {
  filters: any;
  setFilters: (filters: any) => void;
  isAdmin: boolean;
}

export const LeaveFilters: React.FC<Props> = ({ filters, setFilters, isAdmin }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const leaveTypes = [
    'Sick Leave', 'Casual Leave', 'Earned Leave', 'Annual Leave', 
    'Half-Day Leave', 'Work From Home', 'Maternity Leave', 
    'Paternity Leave', 'Marriage Leave', 'Bereavement Leave', 
    'Compensatory Leave', 'Unpaid Leave'
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input 
          type="text" 
          name="search"
          value={filters.search || ''}
          onChange={handleChange}
          placeholder="Search by reason or employee name..." 
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-zinc-600" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Filters:</span>
        </div>

        <select 
          name="status"
          value={filters.status || ''}
          onChange={handleChange}
          className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100 min-w-[120px]"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>

        <select 
          name="leaveType"
          value={filters.leaveType || ''}
          onChange={handleChange}
          className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100 max-w-[160px]"
        >
          <option value="">All Types</option>
          {leaveTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>

        {isAdmin && (
          <select 
            name="department"
            value={filters.department || ''}
            onChange={handleChange}
            className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100 min-w-[140px]"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
          </select>
        )}
      </div>
    </div>
  );
};
