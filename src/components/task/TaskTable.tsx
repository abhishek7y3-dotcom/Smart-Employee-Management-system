'use client';

import React from 'react';
import { Task, Employee } from '../../types';
import { formatDate } from '../../utils/format';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { LoadingState } from '../ui/LoadingState';
import { Trash2 } from 'lucide-react';

interface TaskTableProps {
  tasks: Task[];
  employees: Employee[];
  onDeleteTask: (task: Task) => void;
  isLoading?: boolean;
}

const priorityColors = {
  low: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200/50 dark:border-green-800/50',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50',
  high: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200/50 dark:border-red-800/50',
};

const getEmployeeName = (employees: Employee[], assignedTo: string) =>
  employees.find((employee) => employee.id === assignedTo)?.name ?? 'Unassigned';

export const TaskTable: React.FC<TaskTableProps> = ({ tasks, employees, onDeleteTask, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 transition-colors duration-300">
        <LoadingState />
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState title="No tasks available" message="There are no matching tasks right now." />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4">Task</th>
              <th className="px-6 py-4">Assigned To</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">{task.title}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{task.description}</div>
                </td>
                <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{getEmployeeName(employees, task.assignedTo)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityColors[task.priority]}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{formatDate(task.dueDate)}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onDeleteTask(task)}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors dark:text-zinc-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    title="Delete Task"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
