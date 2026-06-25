import React from 'react';
import { Employee } from '../../types';

interface EmployeeCardProps {
  employee: Employee;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  return (
    <div className="flex items-center space-x-3 p-3 border border-zinc-100 dark:border-zinc-800/80 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors duration-300">
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
        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">{employee.name}</h4>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs">{employee.role}</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-[10px]">{employee.email}</p>
      </div>
    </div>
  );
};

