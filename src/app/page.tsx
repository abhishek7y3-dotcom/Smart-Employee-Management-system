'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, BarChart3, CheckCircle2, CircleDashed, Clock3, ClipboardList, ListTodo, TimerReset, Users } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { TaskSummaryCard } from '../components/task/TaskSummaryCard';
import { EmployeeCard } from '../components/employee/EmployeeCard';
import { PieChartCard } from '../components/analytics/PieChartCard';
import { LineChartCard } from '../components/analytics/LineChartCard';
import { BarChartCard } from '../components/analytics/BarChartCard';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/task/StatusBadge';
import { formatDate } from '../utils/format';
import { getDashboardMetrics, getRecentActivities, getRecentTasks } from '../utils/dashboardUtils';
import { ActivityLog } from '../types';

const activityMessages: Record<ActivityLog['action'], string> = {
  created: 'created',
  updated: 'updated',
  status_changed: 'changed status for',
  deleted: 'deleted',
};

import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { tasks, employees, activities } = useTasks();
  const { user } = useAuth();

  const metrics = getDashboardMetrics(tasks);
  const recentTasks = getRecentTasks(tasks, 5);
  const recentActivities = getRecentActivities(activities, 10);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl space-y-8 pb-12 transition-colors duration-300">
      <section className="rounded-lg border border-blue-200/70 bg-blue-600 p-6 text-white shadow-sm transition-colors duration-300 dark:border-blue-900/60 dark:bg-blue-950 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-100">Team operations overview</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Welcome Back, {user?.name || 'User'}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
              {metrics.inProgressTasks} tasks are moving, {metrics.cancelledTasks} are cancelled, and the latest team activity is ready for review.
            </p>
          </div>
          <Link
            href="/tasks"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition-all duration-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <ClipboardList className="h-4 w-4" />
            View All Tasks
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <TaskSummaryCard title="Total Tasks" value={metrics.totalTasks} href="/tasks" color="blue" icon={<ListTodo className="h-5 w-5" />} />
        <TaskSummaryCard title="Pending Tasks" value={metrics.pendingTasks} href="/tasks?status=pending" color="zinc" icon={<CircleDashed className="h-5 w-5" />} />
        <TaskSummaryCard title="In Progress" value={metrics.inProgressTasks} href="/tasks?status=in-progress" color="indigo" icon={<Clock3 className="h-5 w-5" />} />
        <TaskSummaryCard title="Completed" value={metrics.completedTasks} href="/tasks?status=completed" color="green" icon={<CheckCircle2 className="h-5 w-5" />} />
        <TaskSummaryCard title="Cancelled Tasks" value={metrics.cancelledTasks} href="/tasks?status=cancelled" color="red" icon={<AlertTriangle className="h-5 w-5" />} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">Analytics Overview</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <PieChartCard tasks={tasks} />
          <LineChartCard tasks={tasks} />
          <BarChartCard tasks={tasks} employees={employees} className="md:col-span-2 xl:col-span-1" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
              <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">Recent Tasks</h3>
            </div>
            <Link href="/tasks" className="text-sm font-bold text-blue-600 transition-colors duration-300 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              View All Tasks
            </Link>
          </div>

          {recentTasks.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {recentTasks.map((task) => (
                  <div key={task.id} className="grid gap-3 p-4 transition-colors duration-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-zinc-950 dark:text-zinc-50">{task.title}</h4>
                        <StatusBadge status={task.status} />
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">{task.description || 'No description provided.'}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                      <TimerReset className="h-4 w-4" />
                      {formatDate(task.dueDate)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="No tasks found" message="Create a task to begin tracking team work." />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">Team Members</h3>
          </div>
          <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950">
            {employees.length > 0 ? employees.map((employee) => <EmployeeCard key={employee.id} employee={employee} />) : <p className="text-sm text-zinc-500 dark:text-zinc-400">No employees registered.</p>}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">Recent Activity</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Latest team actions across tasks.</p>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">Latest 10</span>
        </div>
        {recentActivities.length > 0 ? (
          <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-2">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900/60">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{activity.employeeName}</span>{' '}
                <span className="text-zinc-500 dark:text-zinc-400">
                  {activity.details ?? `${activityMessages[activity.action]} ${activity.taskTitle}`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No activity yet" message="Task updates will appear here as your team works." />
        )}
      </section>
      </div>
    </ProtectedRoute>
  );
}

