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
      iconBg: 'bg-blue-50/80 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
      activeBorder: 'border-blue-500/65 ring-2 ring-blue-500/10',
      hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-800/80',
      bgGradient: 'hover:bg-blue-50/5 dark:hover:bg-blue-950/5'
    },
    amber: {
      iconBg: 'bg-amber-50/80 text-amber-600 dark:bg-amber-950/50 dark:text-amber-450',
      activeBorder: 'border-amber-500/65 ring-2 ring-amber-500/10',
      hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-800/80',
      bgGradient: 'hover:bg-amber-50/5 dark:hover:bg-amber-950/5'
    },
    green: {
      iconBg: 'bg-green-50/80 text-green-605 dark:bg-green-950/50 dark:text-green-400',
      activeBorder: 'border-green-500/65 ring-2 ring-green-500/10',
      hoverBorder: 'hover:border-green-400 dark:hover:border-green-800/80',
      bgGradient: 'hover:bg-green-50/5 dark:hover:bg-green-950/5'
    },
    indigo: {
      iconBg: 'bg-indigo-50/80 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400',
      activeBorder: 'border-indigo-500/65 ring-2 ring-indigo-500/10',
      hoverBorder: 'hover:border-indigo-400 dark:hover:border-indigo-800/80',
      bgGradient: 'hover:bg-indigo-50/5 dark:hover:bg-indigo-950/5'
    },
    red: {
      iconBg: 'bg-red-50/80 text-red-600 dark:bg-red-950/50 dark:text-red-400',
      activeBorder: 'border-red-500/65 ring-2 ring-red-500/10',
      hoverBorder: 'hover:border-red-400 dark:hover:border-red-800/80',
      bgGradient: 'hover:bg-red-50/5 dark:hover:bg-red-950/5'
    },
    zinc: {
      iconBg: 'bg-zinc-100/80 text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400',
      activeBorder: 'border-zinc-550 ring-2 ring-zinc-500/10',
      hoverBorder: 'hover:border-zinc-350 dark:hover:border-zinc-800/85',
      bgGradient: 'hover:bg-zinc-50/5 dark:hover:bg-zinc-900/5'
    },
  };

  const selectedColor = colorStyles[color];
  const content = (
    <>
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-black transition-colors duration-300 dark:text-white">{title}</span>
        {icon && <div className={`rounded-xl p-2 transition-all duration-300 ${selectedColor.iconBg}`}>{icon}</div>}
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <span className="text-3xl font-extrabold tracking-tight text-zinc-950 transition-colors duration-300 dark:text-zinc-50 font-outfit">{value}</span>
        {href && <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 transition-colors duration-300 group-hover:text-blue-600 dark:text-zinc-500 dark:group-hover:text-blue-400">Open</span>}
      </div>
    </>
  );

  const classes = `group rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
    isActive
      ? `${selectedColor.activeBorder} bg-zinc-50/80 dark:bg-zinc-900/80`
      : `border-zinc-200/70 bg-white/90 dark:border-zinc-800/80 dark:bg-zinc-950/30 backdrop-blur-sm hover:-translate-y-0.5 hover:shadow-md ${selectedColor.hoverBorder} ${selectedColor.bgGradient}`
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

