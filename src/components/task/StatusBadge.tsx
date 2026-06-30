import React from 'react';
import { TaskStatus } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const statusConfig = {
    todo: {
      label: 'To Do',
      classes: 'bg-zinc-100/70 text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300 border-zinc-200/60 dark:border-zinc-800/60 font-bold',
    },
    in_progress: {
      label: 'In Progress',
      classes: 'bg-blue-50/70 text-blue-750 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/40 dark:border-blue-900/30 font-bold',
    },
    'in-progress': {
      label: 'In Progress',
      classes: 'bg-blue-50/70 text-blue-750 dark:bg-blue-950/30 dark:text-blue-450 border-blue-200/40 dark:border-blue-900/30 font-bold',
    },
    completed: {
      label: 'Completed',
      classes: 'bg-green-50/70 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200/40 dark:border-green-900/30 font-bold',
    },
    cancelled: {
      label: 'Cancelled',
      classes: 'bg-red-50/70 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200/40 dark:border-red-900/30 font-bold',
    },
    overdue: {
      label: 'Overdue',
      classes: 'bg-amber-50/70 text-amber-705 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/40 dark:border-amber-900/30 font-bold',
    },
  };

  const config = statusConfig[status] || statusConfig.todo;

  return (
    <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] transition-colors duration-300 ${config.classes} ${className}`}>
      {config.label}
    </span>
  );
};

