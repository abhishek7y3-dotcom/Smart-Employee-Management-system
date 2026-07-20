import React from 'react';
import { Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { Trash2 } from 'lucide-react';

interface EmployeeCardProps {
  employee: Employee;
}

const DESIGNATIONS = [
  'CEO',
  'Employee',
  'Software Developer',
  'Senior Developer',
  'Product Designer',
  'QA Analyst',
  'Project Manager',
  'HR Specialist',
  'Intern'
];

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  const { user } = useAuth();
  const { updateEmployeeDesignation, updateEmployeeRole, removeEmployee } = useTasks();

  const isAdmin = user?.role === 'admin';
  const canEditDesignation = isAdmin && (employee.role !== 'admin' || employee.id === user?.id);
  const canEditRole = isAdmin && employee.id !== user?.id;

  const handleDesignationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateEmployeeDesignation(employee.id, e.target.value);
  };

  const handleRemoveUser = () => {
    if (window.confirm(`Are you sure you want to remove ${employee.name}?`)) {
      removeEmployee(employee.id);
    }
  };

  return (
    <div className="enterprise-card flex flex-col gap-3 p-3.5 rounded-xl transition-all duration-300 sm:flex-row sm:items-center sm:justify-between hover:-translate-y-0.5 hover:shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex items-center space-x-3">
        {employee.avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={employee.avatarUrl}
            alt={employee.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-200/60 dark:ring-zinc-800/60 hover:scale-105 transition-all duration-300"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/10 hover:scale-105 transition-all duration-300 shrink-0">
            {employee.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-200 text-sm truncate">{employee.name}</h4>
            {employee.role === 'admin' && (
              <span className="flex items-center gap-1 text-[9px] bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-200/40 dark:border-amber-900/40 shadow-sm shrink-0">
                👑 Admin
              </span>
            )}
          </div>
          <p className="text-zinc-400 dark:text-zinc-500 text-[10px] truncate">{employee.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {canEditDesignation ? (
          <div className="relative">
            <select
              value={employee.designation || 'Employee'}
              onChange={handleDesignationChange}
              className="text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg px-2.5 py-1.5 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer"
            >
              {DESIGNATIONS.map((des) => (
                <option key={des} value={des}>
                  {des}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="text-zinc-600 dark:text-zinc-400 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200/40 dark:border-zinc-800/40">
            {employee.designation || (employee.role === 'admin' ? 'Admin' : 'Employee')}
          </span>
        )}

        {canEditRole && (
          <div className="relative">
            <select
              value={employee.role === 'user' || employee.role === 'employee' ? 'member' : employee.role}
              onChange={(e) => updateEmployeeRole(employee.id, e.target.value)}
              className="text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg px-2.5 py-1.5 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer"
            >
              <option value="member">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        {isAdmin && employee.id !== user?.id && (
          <button
            type="button"
            onClick={handleRemoveUser}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer shrink-0"
            title={`Remove ${employee.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
