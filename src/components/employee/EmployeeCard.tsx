import React from 'react';
import { Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { Trash2 } from 'lucide-react';

interface EmployeeCardProps {
  employee: Employee;
}

const DESIGNATIONS = [
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
  const { updateEmployeeDesignation, removeEmployee } = useTasks();

  const isAdmin = user?.role === 'admin';
  const canEditDesignation = isAdmin && (employee.role !== 'admin' || employee.id === user?.id);

  const handleDesignationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateEmployeeDesignation(employee.id, e.target.value);
  };

  const handleRemoveUser = () => {
    if (window.confirm(`Are you sure you want to remove ${employee.name}?`)) {
      removeEmployee(employee.id);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-800/80 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-all duration-300">
      <div className="flex items-center space-x-3">
        {employee.avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={employee.avatarUrl}
            alt={employee.name}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200/50 dark:ring-zinc-800/50"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
            {employee.name.charAt(0)}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">{employee.name}</h4>
            {employee.role === 'admin' && (
              <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/40">
                Admin
              </span>
            )}
          </div>
          <p className="text-zinc-400 dark:text-zinc-500 text-[10px]">{employee.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {canEditDesignation ? (
          <div className="relative">
            <select
              value={employee.designation || 'Employee'}
              onChange={handleDesignationChange}
              className="text-xs bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 text-zinc-700 dark:text-zinc-300 rounded-lg px-2.5 py-1.5 outline-none transition focus:border-blue-500"
            >
              {DESIGNATIONS.map((des) => (
                <option key={des} value={des}>
                  {des}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-medium px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200/30 dark:border-zinc-800/30">
            {employee.designation || (employee.role === 'admin' ? 'Admin' : 'Employee')}
          </span>
        )}

        {isAdmin && employee.id !== user?.id && (
          <button
            type="button"
            onClick={handleRemoveUser}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            title={`Remove ${employee.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
