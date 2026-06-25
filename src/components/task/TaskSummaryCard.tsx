import React from 'react';
import Link from 'next/link';

export interface TaskSummaryCardProps {
  title: string;
  value: string | number;
  href?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'amber' | 'green' | 'indigo' | 'zinc' | 'red';
  className?: string;
  isActive?: boolean;
}

export const TaskSummaryCard: React.FC<TaskSummaryCardProps> = ({
  title,
  value,
  href,
  icon,
  color = 'zinc',
  className = '',
  isActive = false,
}) => {
  const colorStyles = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/20',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20',
    },
    green: {
      iconBg: 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400',
      activeBorder: 'border-green-500 ring-2 ring-green-500/20',
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/20',
    },
    red: {
      iconBg: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
      activeBorder: 'border-red-500 ring-2 ring-red-500/20',
    },
    zinc: {
      iconBg: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400',
      activeBorder: 'border-zinc-500 ring-2 ring-zinc-500/20',
    },
  };

  const selectedColor = colorStyles[color];
  const content = (
    <>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-zinc-500 transition-colors duration-300 dark:text-zinc-400">{title}</span>
        {icon && <div className={`rounded-lg p-2 transition-colors duration-300 ${selectedColor.iconBg}`}>{icon}</div>}
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <span className="text-3xl font-bold tracking-tight text-zinc-950 transition-colors duration-300 dark:text-zinc-50">{value}</span>
        {href && <span className="text-xs font-semibold text-zinc-400 transition-colors duration-300 group-hover:text-blue-600 dark:text-zinc-500 dark:group-hover:text-blue-400">Open</span>}
      </div>
    </>
  );

  const classes = `group rounded-lg border p-5 shadow-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
    isActive
      ? `${selectedColor.activeBorder} bg-zinc-50 dark:bg-zinc-900/80`
      : 'border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700'
  } ${className}`;

  if (href) {
    return (
      <Link href={href} aria-current={isActive ? 'page' : undefined} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
};

