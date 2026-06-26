'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { TaskTable } from '../../components/task/TaskTable';
import { TaskEditorModal } from '../../components/task/TaskEditorModal';
import { Task, TaskInput, TaskPriority } from '../../types';
import { getFilteredTasksByUrlStatus, TaskUrlStatus } from '../../utils/dashboardUtils';
import { useAuth } from '../../context/AuthContext';

const getTodayString = () => new Date().toISOString().split('T')[0];

interface TasksClientProps {
  initialStatus: TaskUrlStatus;
}

const statusOptions: Array<{ value: TaskUrlStatus; label: string }> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'overdue', label: 'Overdue' },
];

const defaultTaskForm: Omit<TaskInput, 'status'> & { status?: TaskInput['status'] } = {
  title: '',
  description: '',
  priority: 'medium',
  assignedTo: '',
  dueDate: getTodayString(),
};

export const TasksClient: React.FC<TasksClientProps> = ({ initialStatus }) => {
  const { tasks, employees, addTask, updateTask, updateTaskStatus, deleteTask } = useTasks();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskUrlStatus>(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [newTitle, setNewTitle] = useState(defaultTaskForm.title);
  const [newDescription, setNewDescription] = useState(defaultTaskForm.description);
  const [newPriority, setNewPriority] = useState<TaskPriority>(defaultTaskForm.priority);
  const [newAssignee, setNewAssignee] = useState(defaultTaskForm.assignedTo);
  const [newDueDate, setNewDueDate] = useState(defaultTaskForm.dueDate);

  const filteredTasks = useMemo(() => {
    const urlFiltered = getFilteredTasksByUrlStatus(tasks, statusFilter);
    return urlFiltered.filter((task) => {
      const query = searchTerm.trim().toLowerCase();
      const employee = employees.find((item) => item.id === task.assignedTo);
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        employee?.name.toLowerCase().includes(query);
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesDate = !dateFilter || task.dueDate === dateFilter;
      return matchesSearch && matchesPriority && matchesDate;
    });
  }, [employees, priorityFilter, searchTerm, statusFilter, tasks, dateFilter]);

  const resetCreateForm = () => {
    setNewTitle(defaultTaskForm.title);
    setNewDescription(defaultTaskForm.description);
    setNewPriority(defaultTaskForm.priority);
    setNewAssignee(defaultTaskForm.assignedTo);
    setNewDueDate(getTodayString());
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const today = getTodayString();
    if (!newTitle.trim() || !newAssignee || !newDueDate || new Date(newDueDate).getTime() < new Date(today).getTime()) return;

    addTask({
      title: newTitle.trim(),
      description: newDescription.trim(),
      status: 'todo',
      priority: newPriority,
      assignedTo: newAssignee,
      dueDate: newDueDate,
    });

    resetCreateForm();
    setShowAddForm(false);
  };

  const confirmDelete = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    setTaskToDelete(null);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">Tasks</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Review, create, and update task tracking logs assigned to employees.</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowAddForm((current) => !current)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            {!showAddForm && <Plus className="h-4 w-4" />}
            {showAddForm ? 'Cancel' : 'Add New Task'}
          </button>
        )}
      </div>

      {showAddForm && isAdmin && (
        <form onSubmit={handleAddTask} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="font-bold text-zinc-950 dark:text-zinc-50">Create Task</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Title</span>
              <input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50" />
            </label>
            <label className="md:col-span-2">
              <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Description</span>
              <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50" />
            </label>
            <label>
              <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Priority</span>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as TaskPriority)} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Assignee</span>
              <select required value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50">
                <option value="">Select Employee</option>
                {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} ({employee.designation || 'Employee'})</option>)}
              </select>
            </label>
            <label>
              <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">Due Date</span>
              <input required min={getTodayString()} type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50" />
            </label>
          </div>
          <button type="submit" className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 sm:w-auto">
            Create Task
          </button>
        </form>
      )}

      <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tasks..." className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-3 text-sm text-zinc-950 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            title="Filter by due date"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear Date
            </button>
          )}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskUrlStatus)} className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <TaskTable
          tasks={filteredTasks}
          employees={employees}
          onDeleteTask={setTaskToDelete}
          onEditTask={setTaskToEdit}
          onStatusChange={updateTaskStatus}
        />
      ) : (
        <EmptyState title="No tasks found" message="Try adjusting your filters or search terms." />
      )}

      <TaskEditorModal
        key={taskToEdit?.id ?? 'task-editor'}
        isOpen={taskToEdit !== null}
        task={taskToEdit}
        employees={employees}
        onClose={() => setTaskToEdit(null)}
        onSave={updateTask}
      />

      <ConfirmationModal
        isOpen={taskToDelete !== null}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
