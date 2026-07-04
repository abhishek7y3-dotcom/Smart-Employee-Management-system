'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, BarChart3, CheckCircle2, CircleDashed, Clock3, ClipboardList, ListTodo, TimerReset, Users, MessageSquare, Megaphone, Inbox } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { TaskSummaryCard } from '../components/task/TaskSummaryCard';
import { EmployeeCard } from '../components/employee/EmployeeCard';
import { PieChartCard } from '../components/analytics/PieChartCard';
import { KPICard } from '../components/analytics/KPICard';
import { BarChartCard } from '../components/analytics/BarChartCard';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/task/StatusBadge';
import { formatDate } from '../utils/format';
import { getDashboardMetrics, getRecentActivities, getRecentTasks } from '../utils/dashboardUtils';
import { useCommunication } from '../context/CommunicationContext';
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
  const { conversations, announcements, unreadMessageCount, unreadNotificationCount } = useCommunication();

  const metrics = getDashboardMetrics(tasks);
  const recentTasks = getRecentTasks(tasks, 5);
  const recentActivities = getRecentActivities(activities, 10);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl space-y-8 pb-12 transition-colors duration-300 relative">
        {/* Decorative background glows */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

        <section className="relative rounded-3xl border border-zinc-200/20 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 p-6 text-white shadow-xl dark:border-zinc-800/40 dark:from-zinc-900/90 dark:via-zinc-950/80 dark:to-indigo-950/40 md:p-8 overflow-hidden backdrop-blur-sm group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-all duration-700"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-all duration-700"></div>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between relative z-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100/90">Team operations overview</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl font-outfit">Welcome Back, {user?.name || 'User'}</h2>
              <p className="mt-3 max-w-2xl text-xs leading-relaxed text-blue-100/80 md:text-sm">
                {metrics.inProgressTasks} tasks are moving, {metrics.cancelledTasks} are cancelled, and the latest team activity is ready for review.
              </p>
            </div>
            <Link
              href="/tasks"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-blue-700 shadow-md transition-all duration-300 hover:bg-blue-50 hover:shadow-lg active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 shrink-0"
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

        <section className="enterprise-card rounded-2xl p-6 relative z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
              <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Analytics Overview</h3>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PieChartCard tasks={tasks} />
            <KPICard tasks={tasks} />
            <BarChartCard tasks={tasks} employees={employees} />
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-8">

            <section className="enterprise-card rounded-2xl p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Recent Tasks</h3>
                </div>
                <Link href="/tasks" className="text-xs font-bold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">View All</Link>
              </div>
              <div className="mt-5">
                {recentTasks.length > 0 ? (
                  <div className="overflow-hidden rounded-2xl border border-zinc-200/60 bg-zinc-50/20 dark:border-zinc-850 dark:bg-zinc-900/5 backdrop-blur-sm shadow-sm">
                    <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                      {recentTasks.map((task) => (
                        <div key={task.id} className="grid gap-3 p-4.5 transition-all duration-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 md:grid-cols-[1fr_auto] md:items-center">
                          <div>
                            <h4 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">{task.title}</h4>
                            <p className="mt-1 line-clamp-1 text-xs text-zinc-400 dark:text-zinc-500">{task.description || 'No description provided.'}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                            <TimerReset className="h-3.5 w-3.5" />
                            <span>Due {formatDate(task.dueDate)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState title="No tasks found" message="Create tasks to see them tracked in real time." />
                )}
              </div>
            </section>

            <section className="enterprise-card rounded-2xl p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Recent Activity</h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Latest team actions across tasks.</p>
                </div>
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100/50 dark:border-blue-900/50 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">Latest 10</span>
              </div>
              {recentActivities.length > 0 ? (
                <div className="mt-6 max-h-80 overflow-y-auto pr-2 relative">
                  <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-zinc-200 dark:bg-zinc-800"></div>
                  <div className="space-y-5">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="relative pl-8 text-sm transition-colors duration-300">
                        <div className="absolute left-3 top-2 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-zinc-950"></div>
                        <div>
                          <span className="font-extrabold text-zinc-950 dark:text-zinc-50">{activity.employeeName}</span>{' '}
                          <span className="text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed">
                            {activity.details ?? `${activityMessages[activity.action]} ${activity.taskTitle}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState title="No activity yet" message="Task updates will appear here as your team works." />
              )}
            </section>
          </div>

          <div className="space-y-8">
            {/* Communication Quick Access */}
            <section className="enterprise-card rounded-2xl p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Communication</h3>
                </div>
                <Link href="/communication" className="text-xs font-bold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Open Hub</Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link href="/communication" className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/40 p-3 transition-all duration-300 hover:shadow-sm hover:scale-[1.01] dark:border-zinc-900 dark:bg-zinc-900/25">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
                    <Inbox className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Inbox</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{unreadMessageCount} unread</p>
                  </div>
                </Link>
                <Link href="/communication" className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/40 p-3 transition-all duration-300 hover:shadow-sm hover:scale-[1.01] dark:border-zinc-900 dark:bg-zinc-900/25">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30">
                    <Megaphone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Announcements</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{announcements.length} active</p>
                  </div>
                </Link>
              </div>
              {conversations.length > 0 && (
                <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
                  {conversations.slice(0, 3).map((conv) => (
                    <Link key={conv.id} href="/communication" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${conv.unreadCount > 0 ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{conv.subject}</span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-auto shrink-0">{conv.participantNames[0]}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="enterprise-card rounded-2xl p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Team Members</h3>
                </div>
                <Link href="/employees" className="text-xs font-bold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">View All</Link>
              </div>
              <div className="mt-5 max-h-[595px] space-y-3 overflow-y-auto pr-1">
                {employees.length > 0 ? (
                  employees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-zinc-50/20 p-3.5 transition-all duration-300 hover:scale-[1.01] hover:shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/10">
                      <div className="flex items-center gap-3">
                        <img src={employee.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'} alt={employee.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-800" />
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{employee.name}</h4>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">{employee.designation || 'Specialist'}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">Active</span>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No members found" message="Add members to get started." />
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

