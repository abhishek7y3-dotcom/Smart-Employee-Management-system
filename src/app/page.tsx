'use client';

import React from 'react';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from '../components/task/TaskCard';
import { EmployeeCard } from '../components/employee/EmployeeCard';

export default function DashboardPage() {
  const { tasks, employees, updateTaskStatus } = useTasks();

  // Compute metrics
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Greeting Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 md:p-8 text-white shadow-lg shadow-blue-500/10">
        <h2 className="text-2xl font-bold md:text-3xl">Welcome Back, Diana!</h2>
        <p className="mt-2 text-blue-100 max-w-md text-sm md:text-base">
          Here is your employee tasks overview. You have {inProgressTasks} tasks currently in progress across your team.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Tasks</span>
            <div className="rounded-md bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{totalTasks}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">To Do</span>
            <div className="rounded-md bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{todoTasks}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">In Progress</span>
            <div className="rounded-md bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3.375" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{inProgressTasks}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Completed</span>
            <div className="rounded-md bg-green-50 p-2 text-green-600 dark:bg-green-950/40 dark:text-green-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{completedTasks}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left column (Recent Tasks), Right column (Employees) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Recent Tasks</h3>
            <span className="text-xs text-zinc-400">Interactive Preview</span>
          </div>
          
          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.slice(0, 4).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={updateTaskStatus}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
              No tasks available. Add some in the task list.
            </div>
          )}
        </div>

        {/* Team Members */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Team Members</h3>
          <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            {employees.length > 0 ? (
              employees.map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))
            ) : (
              <p className="text-sm text-zinc-550">No employees registered.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
