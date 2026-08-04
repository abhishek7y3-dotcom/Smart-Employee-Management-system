'use client';

import React from 'react';
import { Task, Employee } from '../../types';
import { formatDate } from '../../utils/format';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { LoadingState } from '../ui/LoadingState';
import { Trash2, Pencil, Eye, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TaskTableProps {
  tasks: Task[];
  employees: Employee[];
  onDeleteTask: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onViewTask?: (task: Task) => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  priorityFilter?: string;
  onPriorityFilterChange?: (priority: string) => void;
  isLoading?: boolean;
}

const priorityColors = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-300 border-green-300 dark:border-green-700 font-bold shadow-sm',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-bold shadow-sm',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold shadow-sm',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-300 border-red-300 dark:border-red-700 font-bold shadow-sm',
};

const statusColors: Record<string, string> = {
  todo: 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-300 border-red-300 dark:border-red-700',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300 border-amber-300 dark:border-amber-700',
  'in-progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300 border-amber-300 dark:border-amber-700',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-300 border-green-300 dark:border-green-700',
};

const getEmployeeDisplayName = (employees: Employee[], assignedTo: string) => {
  const employee = employees.find((emp) => emp.id === assignedTo);
  if (!employee) return 'Unassigned';
  return employee.designation ? `${employee.name} (${employee.designation})` : employee.name;
};

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  employees,
  onDeleteTask,
  onEditTask,
  onViewTask,
  onStatusChange,
  priorityFilter = 'all',
  onPriorityFilterChange,
  isLoading = false
}) => {
  const truncateDescription = (desc: string) => {
    if (!desc) return '';
    if (desc.length <= 25) return desc;
    return desc.slice(0, 25) + '...';
  };
  const { user } = useAuth();
  const isAdmin = (user?.role === 'admin' || user?.role === 'superadmin');

  const handleDownloadSingleCSV = (task: Task) => {
    const headers = ['Title', 'Description', 'Priority', 'Status', 'Assigned To', 'Due Date', 'Created At'];
    const employee = employees.find(e => e.id === task.assignedTo);
    const assigneeName = employee ? employee.name : 'Unknown';
    
    const escapeCSV = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
    
    const row = [
      escapeCSV(task.title),
      escapeCSV(task.description),
      escapeCSV(task.priority),
      escapeCSV(task.status),
      escapeCSV(assigneeName),
      escapeCSV(task.dueDate),
      escapeCSV(new Date(task.createdAt || Date.now()).toLocaleDateString())
    ].join(',');
    
    const csvContent = `${headers.join(',')}\n${row}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `task_${task.id.substring(0, 8)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 dark:border-zinc-800/60 dark:bg-zinc-950 transition-colors duration-300">
        <LoadingState />
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState title="No tasks available" message="There are no matching tasks right now." />;
  }

  return (
    <div className="enterprise-card overflow-hidden rounded-2xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-base text-zinc-800 dark:text-zinc-200">
          <thead className="bg-zinc-50/50 text-[13px] font-bold uppercase tracking-[0.1em] text-zinc-950 border-b border-zinc-200/60 dark:bg-zinc-900/20 dark:text-zinc-50 dark:border-zinc-800/60">
            <tr>
              <th className="pl-6 pr-2 py-4 text-blue-700 dark:text-blue-400">Task</th>
              <th className="pl-2 pr-6 py-4 text-purple-700 dark:text-purple-400">Assigned To</th>
              <th className="px-6 py-4 text-amber-700 dark:text-amber-400">Priority</th>
              <th className="px-6 py-4 text-pink-700 dark:text-pink-400">Status</th>
              <th className="px-6 py-4 text-cyan-700 dark:text-cyan-400">Due Date</th>
              <th className="px-6 py-4 text-right text-slate-700 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10 transition-colors duration-300">
                <td className="pl-6 pr-2 py-4 max-w-xs">
                  <div className="font-extrabold text-zinc-950 dark:text-zinc-50 text-sm break-words">{task.title}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed break-words">{truncateDescription(task.description)}</div>
                </td>
                <td className="pl-2 pr-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">{getEmployeeDisplayName(employees, task.assignedTo)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${priorityColors[task.priority]}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-6 py-4 text-sm font-bold text-zinc-700 dark:text-zinc-300">{formatDate(task.dueDate)}</td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownloadSingleCSV(task)}
                      className="rounded-xl p-2 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105 transition-all dark:text-indigo-400 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-300 cursor-pointer"
                      title="Download CSV"
                    >
                      <Download className="h-4.5 w-4.5" />
                    </button>
                    {onViewTask && (
                      <button
                        type="button"
                        onClick={() => onViewTask(task)}
                        className="rounded-xl p-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:scale-105 transition-all dark:text-emerald-450 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-300 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                    )}
                    {isAdmin && onEditTask && (
                      <button
                        type="button"
                        onClick={() => onEditTask(task)}
                        className="rounded-xl p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:scale-105 transition-all dark:text-blue-400 dark:hover:bg-blue-950/20 dark:hover:text-blue-300 cursor-pointer"
                        title="Edit Task"
                      >
                        <Pencil className="h-4.5 w-4.5" />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => onDeleteTask(task)}
                        className="rounded-xl p-2 text-red-500 hover:bg-red-50 hover:text-red-600 hover:scale-105 transition-all dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300 cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
