'use client';

import React from 'react';
import { Task, Employee } from '../../types';
import { formatDate } from '../../utils/format';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { LoadingState } from '../ui/LoadingState';
import { Trash2, Pencil, Eye } from 'lucide-react';
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
  low: 'bg-green-50/70 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200/40 dark:border-green-900/30 font-bold',
  medium: 'bg-amber-50/70 text-amber-705 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/40 dark:border-amber-900/30 font-bold',
  high: 'bg-red-50/70 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200/40 dark:border-red-900/30 font-bold',
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
  const isAdmin = user?.role === 'admin';
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
              <th className="pl-6 pr-2 py-4">Task</th>
              <th className="pl-2 pr-6 py-4">Assigned To</th>
              <th className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span>Priority</span>
                  <select 
                    value={priorityFilter}
                    onChange={(e) => onPriorityFilterChange?.(e.target.value)}
                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wider outline-none cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <option value="all">All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10 transition-colors duration-300">
                <td className="pl-6 pr-2 py-4 max-w-xs">
                  <div className="font-extrabold text-zinc-950 dark:text-zinc-50 text-base break-words">{task.title}</div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed break-words">{truncateDescription(task.description)}</div>
                </td>
                <td className="pl-2 pr-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">{getEmployeeDisplayName(employees, task.assignedTo)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${priorityColors[task.priority]}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {isAdmin ? (
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange?.(task.id, e.target.value as Task['status'])}
                      className="text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-lg px-2.5 py-1.5 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold cursor-pointer"
                    >
                      <option value="todo">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>

                    </select>
                  ) : (
                    <StatusBadge status={task.status} />
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-zinc-700 dark:text-zinc-300">{formatDate(task.dueDate)}</td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
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
