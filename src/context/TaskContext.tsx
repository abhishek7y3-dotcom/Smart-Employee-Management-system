'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { formatDate } from '../utils/format';
import { ActivityAction, ActivityLog, Employee, Task, TaskInput, TaskPriority, TaskStatus } from '../types';
import { mockEmployees, mockTasks } from '../constants/mockData';
import { useAuth } from './AuthContext';
import {
  getTasks as apiGetTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask
} from '../api/tasks';
import { updateUserProfile, removeUser } from '../api/auth';

interface TaskContextType {
  tasks: Task[];
  employees: Employee[];
  activities: ActivityLog[];
  addTask: (task: TaskInput) => void;
  updateTask: (taskId: string, updates: TaskInput) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTaskPriority: (taskId: string, priority: TaskPriority) => void;
  assignTask: (taskId: string, employeeId: string) => void;
  deleteTask: (taskId: string) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployeeDesignation: (employeeId: string, designation: string) => Promise<void>;
  removeEmployee: (employeeId: string) => Promise<void>;
}

const ACTIVITIES_KEY = 'employee_activity_log';
const EMPLOYEES_KEY = 'employee_members';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const getEmployeeName = (employees: Employee[], employeeId: string) =>
  employees.find((employee) => employee.id === employeeId)?.name ?? 'Unassigned';

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  overdue: 'Overdue',
};

const buildChangeDetails = (task: Task, updates: TaskInput, employees: Employee[]) => {
  const changes: string[] = [];
  if (task.title !== updates.title) changes.push(`Changed title for "${task.title}" to "${updates.title}"`);
  if (task.description !== updates.description) changes.push(`Updated description for "${task.title}"`);
  if (task.status !== updates.status) changes.push(`Changed status for "${task.title}" to ${statusLabels[updates.status]}`);
  if (task.priority !== updates.priority) changes.push(`Changed priority for "${task.title}" to ${updates.priority}`);
  if (task.assignedTo !== updates.assignedTo) changes.push(`Assigned "${task.title}" to ${getEmployeeName(employees, updates.assignedTo)}`);
  if (task.dueDate !== updates.dueDate) changes.push(`Changed due date for "${task.title}" to ${formatDate(updates.dueDate)}`);
  return changes.length > 0 ? changes.join('. ') + '.' : `Updated task "${task.title}".`;
};

const buildActivity = (
  task: Task,
  employees: Employee[],
  action: ActivityAction,
  details?: string,
): ActivityLog => ({
  id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  taskTitle: task.title,
  employeeName: getEmployeeName(employees, task.assignedTo),
  action,
  details,
  createdAt: new Date().toISOString(),
});

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Load activities from localStorage on mount (safe for SSR/hydration)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedActivities = localStorage.getItem(ACTIVITIES_KEY);
    if (storedActivities) {
      try {
        const parsed = JSON.parse(storedActivities) as ActivityLog[];
        if (parsed && parsed.length > 0) setActivities(parsed);
      } catch (err) {
        // ignore parse errors
      }
    }
  }, []);

  const fetchTasks = async () => {
    const isMock = typeof window === 'undefined' ? false : localStorage.getItem('use_mock_auth') === 'true';
    if (isAuthenticated || isMock) {
      try {
        const { tasks: fetchedTasks, employees: fetchedEmployees } = await apiGetTasks();
        setTasks(fetchedTasks);
        setEmployees(fetchedEmployees);
      } catch (err: any) {
        console.error('[TaskContext] fetchTasks failed:', err?.message ?? err);
        toast.error(`Failed to load data: ${err?.message ?? 'Unknown error'}`);
      }
    } else {
      setTasks([]);
      setEmployees([]);
    }
  };

  useEffect(() => {
    if (!initializing) {
      fetchTasks();
    }
  }, [isAuthenticated, initializing]);

  const recordActivity = (activity: ActivityLog) => {
    setActivities((current) => {
      const next = [activity, ...current].slice(0, 25);
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addTask = async (newTaskData: TaskInput) => {
    try {
      const { task: created, employee } = await apiCreateTask(newTaskData);
      setTasks((prev) => [...prev, created]);
      const currentEmployees = employee && !employees.some((e) => e.id === employee.id)
        ? [...employees, employee]
        : employees;
      if (employee && !employees.some((e) => e.id === employee.id)) {
        setEmployees((prev) => [...prev, employee]);
      }
      recordActivity(
        buildActivity(
          created,
          currentEmployees,
          'created',
          `has been assigned the task '${created.title}' with status '${statusLabels[created.status] || created.status}' and due date '${formatDate(created.dueDate)}'.`,
        ),
      );
      toast.success('Task created successfully');
    } catch (err) {
      toast.error('Failed to create task in database');
    }
  };

  const updateTask = async (taskId: string, updates: TaskInput) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    try {
      const { task: updated, employee } = await apiUpdateTask(taskId, updates);
      setTasks((prev) => prev.map((item) => (item.id === taskId ? updated : item)));
      if (employee && !employees.some((e) => e.id === employee.id)) {
        setEmployees((prev) => [...prev, employee]);
      }
      recordActivity(buildActivity(updated, employees, 'updated', buildChangeDetails(task, updates, employees)));
      toast.success('Task updated successfully');
    } catch (err) {
      toast.error('Failed to update task in database');
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;

    try {
      const updates = {
        title: task.title,
        description: task.description,
        status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        dueDate: task.dueDate,
      };
      const { task: updated } = await apiUpdateTask(taskId, updates);
      setTasks((prev) => prev.map((item) => (item.id === taskId ? updated : item)));
      recordActivity(buildActivity(updated, employees, 'status_changed', `Changed status for "${task.title}" to ${statusLabels[status]}.`));
      toast.success('Status updated successfully');
    } catch (err) {
      toast.error('Failed to update task status in database');
    }
  };

  const updateTaskPriority = async (taskId: string, priority: TaskPriority) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.priority === priority) return;

    try {
      const updates = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority,
        assignedTo: task.assignedTo,
        dueDate: task.dueDate,
      };
      const { task: updated } = await apiUpdateTask(taskId, updates);
      setTasks((prev) => prev.map((item) => (item.id === taskId ? updated : item)));
      recordActivity(buildActivity(updated, employees, 'updated', `Changed priority for "${task.title}" to ${priority}.`));
      toast.success('Task updated successfully');
    } catch (err) {
      toast.error('Failed to update task priority in database');
    }
  };

  const assignTask = async (taskId: string, employeeId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.assignedTo === employeeId) return;

    try {
      const updates = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: employeeId,
        dueDate: task.dueDate,
      };
      const { task: updated } = await apiUpdateTask(taskId, updates);
      setTasks((prev) => prev.map((item) => (item.id === taskId ? updated : item)));
      recordActivity(buildActivity(updated, employees, 'updated', `Assigned "${task.title}" to ${getEmployeeName(employees, employeeId)}.`));
      toast.success('Task updated successfully');
    } catch (err) {
      toast.error('Failed to assign task in database');
    }
  };

  const deleteTask = async (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    try {
      await apiDeleteTask(taskId);
      setTasks((prev) => prev.filter((item) => item.id !== taskId));
      recordActivity(buildActivity(task, employees, 'deleted', 'Task removed from the list.'));
      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error('Failed to delete task from database');
    }
  };

  const addEmployee = (newEmployeeData: Omit<Employee, 'id'>) => {
    const isMock = typeof window === 'undefined' ? false : localStorage.getItem('use_mock_auth') === 'true';
    if (isMock) {
      const newEmployee: Employee = {
        ...newEmployeeData,
        id: `emp-${Date.now()}`,
      };
      setEmployees((prev) => {
        const next = [...prev, newEmployee];
        localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(next));
        return next;
      });
      toast.success('Mock team member added');
    } else {
      toast.info('Team members are managed via database user registrations in production mode');
    }
  };

  const updateEmployeeDesignation = async (employeeId: string, designation: string) => {
    try {
      await updateUserProfile(employeeId, { designation });
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === employeeId ? { ...emp, designation } : emp))
      );
      toast.success('Designation updated successfully');
    } catch (err) {
      toast.error('Failed to update designation');
    }
  };

  const removeEmployee = async (employeeId: string) => {
    try {
      await removeUser(employeeId);
      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
      toast.success('Team member removed successfully');
    } catch (err) {
      toast.error('Failed to remove team member');
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        employees,
        activities,
        addTask,
        updateTask,
        updateTaskStatus,
        updateTaskPriority,
        assignTask,
        deleteTask,
        addEmployee,
        updateEmployeeDesignation,
        removeEmployee,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
