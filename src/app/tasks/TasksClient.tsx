'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { TaskTable } from '../../components/task/TaskTable';
import { TaskEditorModal } from '../../components/task/TaskEditorModal';
import { TaskDetailsModal } from '../../components/task/TaskDetailsModal';
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
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
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
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Tasks</h2>
          <p className="text-xs text-zinc-450 dark:text-zinc-500">Review, create, and update task tracking logs assigned to employees.</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowAddForm((current) => !current)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4.5 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-98 cursor-pointer"
          >
            {!showAddForm && <Plus className="h-4 w-4" />}
            {showAddForm ? 'Cancel' : 'Add New Task'}
          </button>
        )}
      </div>

      {showAddForm && isAdmin && (
        <form onSubmit={handleAddTask} className="enterprise-card space-y-5 rounded-2xl p-6 transition-all duration-300">
          <h3 className="font-bold text-zinc-950 dark:text-zinc-50 font-outfit text-sm">Create Task</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Title</span>
              <input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />
            </label>
            <label className="md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Description</span>
              <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />
            </label>
            <label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Priority</span>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as TaskPriority)} className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-955 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-955 dark:text-zinc-50 font-semibold cursor-pointer">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Assignee</span>
              <select required value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-955 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-955 dark:text-zinc-50 font-semibold cursor-pointer">
                <option value="">Select Employee</option>
                {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} ({employee.designation || 'Employee'})</option>)}
              </select>
            </label>
            <label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Due Date</span>
              <input required min={getTodayString()} type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-950 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />
            </label>
          </div>
          <button type="submit" className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition-all duration-300 hover:bg-blue-700 active:scale-[0.98] sm:w-auto cursor-pointer">
            Create Task
          </button>
        </form>
      )}

      <div className="enterprise-card flex flex-col gap-4 rounded-2xl p-4.5 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tasks..." className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-900 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-bold text-zinc-700 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
            title="Filter by due date"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
            >
              Clear Date
            </button>
          )}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskUrlStatus)} className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-bold text-zinc-700 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 cursor-pointer">
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-bold text-zinc-700 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 cursor-pointer">
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
          onViewTask={setViewingTask}
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

      <TaskDetailsModal
        isOpen={viewingTask !== null}
        task={viewingTask}
        employees={employees}
        onClose={() => setViewingTask(null)}
      />
    </div>
  );
};
