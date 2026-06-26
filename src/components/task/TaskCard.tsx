'use client';

import React, { useState } from 'react';
import { CalendarDays, ChevronDown, Pencil, Trash2, UserRound } from 'lucide-react';
import { Task } from '../../types';
import { formatDate } from '../../utils/format';
import { useTasks } from '../../context/TaskContext';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../../context/AuthContext';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onDelete?: (task: Task) => void;
  onEdit?: (task: Task) => void;
}

const priorityColors = {
  low: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200/70 dark:border-green-800/60',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/70 dark:border-amber-800/60',
  high: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200/70 dark:border-red-800/60',
};

const statuses: Array<{ value: Task['status']; label: string }> = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onDelete, onEdit }) => {
  const { employees } = useTasks();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const employee = employees.find((emp) => emp.id === task.assignedTo);
  const employeeName = employee ? employee.name : 'Unassigned';

  const handleStatusChange = (status: Task['status']) => {
    onStatusChange?.(task.id, status);
    setIsStatusMenuOpen(false);
  };

  return (
    <article className="relative flex min-h-72 flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <h3 className="text-base font-bold leading-snug text-zinc-950 transition-colors duration-300 dark:text-zinc-50">{task.title}</h3>
        </div>
        <StatusBadge status={task.status} />
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500 transition-colors duration-300 dark:text-zinc-400">
        {task.description || 'No description provided.'}
      </p>

      <div className="mt-auto space-y-4 pt-5">
        <div className="grid gap-3 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-500 transition-colors duration-300 dark:bg-zinc-900/70 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {employeeName}{employee?.designation ? ` (${employee.designation})` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <span>Due {formatDate(task.dueDate)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onStatusChange && (
            <div className="relative min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setIsStatusMenuOpen((current) => !current)}
                aria-expanded={isStatusMenuOpen}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition-all duration-300 hover:border-blue-300 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-blue-700 dark:hover:text-blue-300"
              >
                Change Status
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatusMenuOpen && (
                <div className="absolute bottom-12 left-0 z-20 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white p-1 shadow-lg transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950">
                  {statuses.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => handleStatusChange(status.value)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors duration-200 ${
                        task.status === status.value
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isAdmin && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-semibold text-zinc-700 transition-colors duration-300 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          )}

          {isAdmin && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(task)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors duration-300 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 dark:text-zinc-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              aria-label={`Delete ${task.title}`}
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
