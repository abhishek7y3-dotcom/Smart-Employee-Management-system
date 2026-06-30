'use client';

import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { EmployeeCard } from '../../components/employee/EmployeeCard';
import { Search } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function EmployeesPage() {
  const { employees } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl space-y-6 pb-12 transition-colors duration-300 relative">
        {/* Decorative background glows */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Team Members</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Manage designations, workspace roles, and employee records.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/60 bg-white/90 p-4.5 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950/45 backdrop-blur-sm transition-colors duration-300 md:flex-row md:items-center md:justify-between relative z-10">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search team members..."
              className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-11 pr-4 text-xs text-zinc-955 outline-none transition duration-205 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
          <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
            Showing {filteredEmployees.length} of {employees.length} members
          </div>
        </div>

        <div className="space-y-3.5 relative z-10">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">No team members found</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
