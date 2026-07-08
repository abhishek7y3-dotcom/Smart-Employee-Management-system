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

  // Field validation errors
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [assigneeError, setAssigneeError] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title ?? '');
      setDescription(task.description ?? '');
      setStatus(task.status ?? 'todo');
      setPriority(task.priority ?? 'medium');
      setAssignedTo(task.assignedTo ?? '');
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setTitleError(null);
      setDescriptionError(null);
      setAssigneeError(null);
      setDueDateError(null);
    }
  }, [isOpen, task]);

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
    let hasError = false;

    if (!title.trim()) {
      setTitleError('Please enter a task title.');
      hasError = true;
    } else if (title.length > 150) {
      setTitleError('Please keep the task title under 150 characters.');
      hasError = true;
    } else {
      setTitleError(null);
    }

    if (!description.trim()) {
      setDescriptionError('Please enter a task description.');
      hasError = true;
    } else if (description.length > 500) {
      setDescriptionError('Please keep the task description under 500 characters.');
      hasError = true;
    } else {
      setDescriptionError(null);
    }

    if (!assignedTo) {
      setAssigneeError('Please assign this task to an employee.');
      hasError = true;
    } else {
      setAssigneeError(null);
    }

    if (!dueDate) {
      setDueDateError('Please select a due date.');
      hasError = true;
    } else {
      setDueDateError(null);
    }

    if (hasError) return;

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
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-zinc-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/95 transition-all duration-300 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Edit Task</h3>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Update task details without changing the card layout.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Title</span>
              <input
                maxLength={150}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:ring-2 focus:ring-blue-500/10 dark:bg-zinc-950 dark:text-zinc-50 ${
                  titleError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-zinc-300 focus:border-blue-500 dark:border-zinc-700'
                }`}
              />
              {titleError && <p className="mt-1 text-xs font-semibold text-red-500">{titleError}</p>}
            </label>
            <label className="md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Description</span>
              <textarea
                value={description}
                maxLength={500}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:ring-2 focus:ring-blue-500/10 dark:bg-zinc-950 dark:text-zinc-50 ${
                  descriptionError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-zinc-300 focus:border-blue-500 dark:border-zinc-700'
                }`}
              />
              {descriptionError && <p className="mt-1 text-xs font-semibold text-red-500">{descriptionError}</p>}
            </label>
            <label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)} className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 font-semibold cursor-pointer">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="overdue">Overdue</option>
              </select>
            </label>
            <label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Priority</span>
              <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 font-semibold cursor-pointer">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Assignee</span>
              <select
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
                className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:ring-2 focus:ring-blue-500/10 dark:bg-zinc-950 dark:text-zinc-50 font-semibold cursor-pointer ${
                  assigneeError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-zinc-300 focus:border-blue-500 dark:border-zinc-700'
                }`}
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.designation || 'Employee'})
                  </option>
                ))}
              </select>
              {assigneeError && <p className="mt-1 text-xs font-semibold text-red-500">{assigneeError}</p>}
            </label>
            <label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Due Date</span>
              <input
                type="date"
                min={today}
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:ring-2 focus:ring-blue-500/10 dark:bg-zinc-950 dark:text-zinc-50 ${
                  dueDateError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-zinc-300 focus:border-blue-500 dark:border-zinc-700'
                }`}
              />
              {dueDateError && <p className="mt-1 text-xs font-semibold text-red-500">{dueDateError}</p>}
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200/80 bg-white px-5 py-3 text-xs font-bold text-zinc-700 shadow-sm transition-all duration-350 hover:bg-zinc-50 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-500/20 active:scale-[0.98]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
