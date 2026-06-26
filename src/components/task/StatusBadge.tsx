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
      classes: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 border-zinc-200/50 dark:border-zinc-700/50',
    },
    in_progress: {
      label: 'In Progress',
      classes: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50',
    },
    'in-progress': {
      label: 'In Progress',
      classes: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50',
    },
    completed: {
      label: 'Completed',
      classes: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200/50 dark:border-green-800/50',
    },
    cancelled: {
      label: 'Cancelled',
      classes: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200/50 dark:border-red-800/50',
    },
    overdue: {
      label: 'Overdue',
      classes: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50',
    },
  };

  const config = statusConfig[status] || statusConfig.todo;

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors duration-300 ${config.classes} ${className}`}>
      {config.label}
    </span>
  );
};

