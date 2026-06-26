'use client';

import React from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Task } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { getStatusChartData } from '../../utils/dashboardUtils';

interface PieChartCardProps {
  tasks: Task[];
  className?: string;
}

export const PieChartCard: React.FC<PieChartCardProps> = ({ tasks, className = '' }) => {
  const { theme } = useTheme();
  const data = getStatusChartData(tasks);
  const isDark = theme === 'dark';
  const colors = isDark
    ? { todo: '#a1a1aa', in_progress: '#60a5fa', completed: '#4ade80', cancelled: '#f87171', overdue: '#fbbf24' }
    : { todo: '#71717a', in_progress: '#2563eb', completed: '#16a34a', cancelled: '#dc2626', overdue: '#d97706' };

  return (
    <div className={`rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950 ${className}`}>
      <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">Task Distribution</h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Breakdown of tasks by active status.</p>
      <div className="mt-6 h-64 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={58} outerRadius={82} paddingAngle={4} dataKey="value">
                {data.map((entry) => <Cell key={entry.key} fill={colors[entry.key as keyof typeof colors]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#09090b' : '#ffffff', borderColor: isDark ? '#27272a' : '#e4e4e7', color: isDark ? '#fafafa' : '#09090b', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-zinc-400 dark:text-zinc-500">No analytics available</div>
        )}
      </div>
    </div>
  );
};

