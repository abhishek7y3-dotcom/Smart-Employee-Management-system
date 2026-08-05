'use client';

import React, { useEffect } from 'react';
import { X, CalendarDays, UserRound, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import { Employee, Task } from '../../types';
import { formatDate } from '../../utils/format';
import { StatusBadge } from './StatusBadge';

interface TaskDetailsModalProps {
  isOpen: boolean;
  task: Task | null;
  employees: Employee[];
  onClose: () => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-300 border-green-300 dark:border-green-700 font-bold shadow-sm',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-bold shadow-sm',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold shadow-sm',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-300 border-red-300 dark:border-red-700 font-bold shadow-sm',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-300 border-red-300 dark:border-red-700 font-bold shadow-sm',
};

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ isOpen, task, employees, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const assignee = employees.find((emp) => emp.id === task.assignedTo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/95 transition-all duration-300 animate-in fade-in zoom-in-95 font-sans">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-150 dark:border-zinc-800/60 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Task Details</h3>
              <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Reference ID: {task.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-snug">{task.title}</h4>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/40 dark:bg-zinc-950/20">
            <p className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-2">Description</p>
            <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
              {task.description || 'No description provided for this task.'}
            </p>
          </div>

          {/* Grid Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3.5 dark:border-zinc-800/40 dark:bg-zinc-950/10">
              <UserRound className="h-5 w-5 text-zinc-500 dark:text-zinc-500" />
              <div>
                <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Assigned To</p>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate mt-0.5">
                  {assignee ? assignee.name : 'Unassigned'}
                </p>
                {assignee?.designation && (
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-semibold">{assignee.designation}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3.5 dark:border-zinc-800/40 dark:bg-zinc-950/10">
              <CalendarDays className="h-5 w-5 text-zinc-500 dark:text-zinc-500" />
              <div>
                <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Due Date</p>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {formatDate(task.dueDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3.5 dark:border-zinc-800/40 dark:bg-zinc-950/10">
              <AlertTriangle className="h-5 w-5 text-zinc-500 dark:text-zinc-500" />
              <div>
                <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Priority</p>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold mt-1 ${priorityColors[task.priority]}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3.5 dark:border-zinc-800/40 dark:bg-zinc-950/10">
              <ShieldCheck className="h-5 w-5 text-zinc-500 dark:text-zinc-500" />
              <div>
                <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Status</p>
                <div className="mt-1">
                  <StatusBadge status={task.status} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-150 dark:border-zinc-800/60 pt-4 mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-xs font-semibold text-white dark:text-zinc-900 transition hover:bg-zinc-700 dark:hover:bg-zinc-100 cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
