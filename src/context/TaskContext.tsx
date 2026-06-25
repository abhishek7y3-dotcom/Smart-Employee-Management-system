'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { formatDate } from '../utils/format';
import { ActivityAction, ActivityLog, Employee, Task, TaskInput, TaskPriority, TaskStatus } from '../types';
import { mockEmployees, mockTasks } from '../constants/mockData';

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
}

const TASKS_KEY = 'employee_tasks';
const EMPLOYEES_KEY = 'employee_members';
const ACTIVITIES_KEY = 'employee_activity_log';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const getEmployeeName = (employees: Employee[], employeeId: string) =>
  employees.find((employee) => employee.id === employeeId)?.name ?? 'Unassigned';

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
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
  // Initialize tasks and employees from mock data on both server and initial
  // client render so server/client HTML matches. Load persisted values from
  // localStorage after mount and update state if present.
  const initialTasks: Task[] = mockTasks;
  const initialEmployees: Employee[] = mockEmployees;

  // Start activities as empty on both server and initial client render to avoid
  // hydration mismatches. Load persisted activities from localStorage after mount.
  const initialActivities: ActivityLog[] = [];

  const [tasks, setTasks] = useState<Task[]>(() => initialTasks);
  const [employees, setEmployees] = useState<Employee[]>(() => initialEmployees);
  const [activities, setActivities] = useState<ActivityLog[]>(() => initialActivities);
  const initialDataRef = useRef({ tasks: initialTasks, employees: initialEmployees, activities: initialActivities });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Ensure defaults exist
    if (!localStorage.getItem(TASKS_KEY)) localStorage.setItem(TASKS_KEY, JSON.stringify(initialDataRef.current.tasks));
    if (!localStorage.getItem(EMPLOYEES_KEY)) localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(initialDataRef.current.employees));

    // If persisted tasks exist, load them into state after mount
    const storedTasks = localStorage.getItem(TASKS_KEY);
    if (storedTasks) {
      try {
        const parsed = JSON.parse(storedTasks) as Task[];
        if (parsed && parsed.length > 0) {
          setTasks(parsed);
        } else {
          setTasks(initialDataRef.current.tasks);
          localStorage.setItem(TASKS_KEY, JSON.stringify(initialDataRef.current.tasks));
        }
      } catch (err) {
        setTasks(initialDataRef.current.tasks);
        localStorage.setItem(TASKS_KEY, JSON.stringify(initialDataRef.current.tasks));
      }
    } else {
      setTasks(initialDataRef.current.tasks);
      localStorage.setItem(TASKS_KEY, JSON.stringify(initialDataRef.current.tasks));
    }

    const storedEmployees = localStorage.getItem(EMPLOYEES_KEY);
    if (storedEmployees) {
      try {
        const parsed = JSON.parse(storedEmployees) as Employee[];
        if (parsed && parsed.length > 0) {
          setEmployees(parsed);
        } else {
          setEmployees(initialDataRef.current.employees);
          localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(initialDataRef.current.employees));
        }
      } catch (err) {
        setEmployees(initialDataRef.current.employees);
        localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(initialDataRef.current.employees));
      }
    } else {
      setEmployees(initialDataRef.current.employees);
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(initialDataRef.current.employees));
    }

    // Load persisted activities (if any) and update state after mount to keep
    const storedActivities = localStorage.getItem(ACTIVITIES_KEY);
    if (storedActivities) {
      try {
        const parsed = JSON.parse(storedActivities) as ActivityLog[];
        if (parsed && parsed.length > 0) setActivities(parsed);
      } catch (err) {
        // ignore parse errors and keep activities empty
      }
    } else {
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(initialDataRef.current.activities));
    }
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem(TASKS_KEY, JSON.stringify(newTasks));
  };

  const saveEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(newEmployees));
  };

  const recordActivity = (activity: ActivityLog) => {
    setActivities((current) => {
      const next = [activity, ...current].slice(0, 25);
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addTask = (newTaskData: TaskInput) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    saveTasks([...tasks, newTask]);
    recordActivity(
      buildActivity(
        newTask,
        employees,
        'created',
        `Created task with status ${statusLabels[newTask.status]} and due date ${formatDate(newTask.dueDate)}.`,
      ),
    );
    toast.success('Task created successfully');
  };

  const updateTask = (taskId: string, updates: TaskInput) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    const updatedTask: Task = { ...task, ...updates };
    saveTasks(tasks.map((item) => (item.id === taskId ? updatedTask : item)));
    recordActivity(buildActivity(updatedTask, employees, 'updated', buildChangeDetails(task, updates, employees)));
    toast.success('Task updated successfully');
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;

    const updatedTask = { ...task, status };
    saveTasks(tasks.map((item) => (item.id === taskId ? updatedTask : item)));
    recordActivity(buildActivity(updatedTask, employees, 'status_changed', `Changed status for "${task.title}" to ${statusLabels[status]}.`));
    toast.success('Status updated successfully');
  };

  const updateTaskPriority = (taskId: string, priority: TaskPriority) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.priority === priority) return;

    const updatedTask = { ...task, priority };
    saveTasks(tasks.map((item) => (item.id === taskId ? updatedTask : item)));
    recordActivity(buildActivity(updatedTask, employees, 'updated', `Changed priority for "${task.title}" to ${priority}.`));
    toast.success('Task updated successfully');
  };

  const assignTask = (taskId: string, employeeId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.assignedTo === employeeId) return;

    const updatedTask = { ...task, assignedTo: employeeId };
    saveTasks(tasks.map((item) => (item.id === taskId ? updatedTask : item)));
    recordActivity(buildActivity(updatedTask, employees, 'updated', `Assigned "${task.title}" to ${getEmployeeName(employees, employeeId)}.`));
    toast.success('Task updated successfully');
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    saveTasks(tasks.filter((item) => item.id !== taskId));
    recordActivity(buildActivity(task, employees, 'deleted', 'Task removed from the list.'));
    toast.success('Task deleted successfully');
  };

  const addEmployee = (newEmployeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...newEmployeeData,
      id: `emp-${Date.now()}`,
    };
    saveEmployees([...employees, newEmployee]);
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
