import React from 'react';
import { Employee } from '../../types';

interface EmployeeCardProps {
  employee: Employee;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  return (
    <div className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      {employee.avatarUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={employee.avatarUrl}
          alt={employee.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
          {employee.name.charAt(0)}
        </div>
      )}
      <div>
        <h4 className="font-semibold text-gray-800 text-sm">{employee.name}</h4>
        <p className="text-gray-500 text-xs">{employee.role}</p>
        <p className="text-gray-400 text-[10px]">{employee.email}</p>
      </div>
    </div>
  );
};
