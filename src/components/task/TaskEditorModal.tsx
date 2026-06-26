'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Employee, Task, TaskInput, TaskPriority, TaskStatus } from '../../types';

interface TaskEditorModalProps {
  isOpen: boolean;
  employees: Employee[];
  task: Task | null;
  onClose: () => void;
  onSave: (taskId: string, updates: TaskInput) => void;
}

export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({
  isOpen,
  employees,
  task,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(() => task?.title ?? '');
  const [description, setDescription] = useState(() => task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(() => task?.status ?? 'todo');
  const [priority, setPriority] = useState<TaskPriority>(() => task?.priority ?? 'medium');
  const [assignedTo, setAssignedTo] = useState(() => task?.assignedTo ?? '');
  const [dueDate, setDueDate] = useState(() => (task?.dueDate ? task.dueDate.split('T')[0] : ''));
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !assignedTo || !dueDate || new Date(dueDate).getTime() < new Date(today).getTime()) return;

    onSave(task.id, {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignedTo,
      dueDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close edit task modal"
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 shadow-2xl transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">Edit Task</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Update task details without changing the card layout.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors duration-300 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Title</span>
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>
            <label className="md:col-span-2">
              <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>
            <label>
              <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <label>
              <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Priority</span>
              <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Assignee</span>
              <select required value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50">
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.designation || 'Employee'})
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Due Date</span>
              <input
                required
                type="date"
                min={today}
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 transition-colors duration-300 hover:bg-zinc-50 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors duration-300 hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
