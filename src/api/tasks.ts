'use client';

import axiosInstance from '../services/axios';
import { Employee, Task, TaskPriority, TaskStatus } from '../types';
import { mockEmployees, mockTasks } from '../constants/mockData';

interface ApiUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface ApiTask {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  assignedTo: ApiUser | string;
}

interface ApiTaskResponse {
  success: boolean;
  message: string;
  data: {
    task: ApiTask;
  };
}

interface ApiTasksResponse {
  success: boolean;
  message: string;
  data: {
    tasks: ApiTask[];
  };
}

export type TaskCreatePayload = Omit<Task, 'id' | 'createdAt'>;
export type TaskUpdatePayload = Partial<TaskCreatePayload>;

const useMockAuth =
  typeof window !== 'undefined' && window.localStorage.getItem('use_mock_auth') === 'true';

const STORAGE_KEYS = {
  tasks: 'mock_tasks_data',
  employees: 'mock_employees_data',
};

function getMockTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEYS.tasks);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(mockTasks));
    return mockTasks;
  }
  try {
    return JSON.parse(raw) as Task[];
  } catch {
    return mockTasks;
  }
}

function saveMockTasks(tasks: Task[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
}

function getMockEmployees(): Employee[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEYS.employees);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(mockEmployees));
    return mockEmployees;
  }
  try {
    return JSON.parse(raw) as Employee[];
  } catch {
    return mockEmployees;
  }
}

function saveMockEmployees(employees: Employee[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(employees));
}

function normalizeTask(apiTask: ApiTask): Task {
  return {
    id: apiTask._id,
    title: apiTask.title,
    description: apiTask.description,
    status: apiTask.status,
    priority: apiTask.priority,
    assignedTo: typeof apiTask.assignedTo === 'string' ? apiTask.assignedTo : apiTask.assignedTo._id,
    dueDate: new Date(apiTask.dueDate).toISOString().split('T')[0],
    createdAt: new Date(apiTask.createdAt).toISOString().split('T')[0],
  };
}

function extractEmployee(apiTask: ApiTask): Employee | undefined {
  if (typeof apiTask.assignedTo === 'string') {
    return undefined;
  }

  return {
    id: apiTask.assignedTo._id,
    name: apiTask.assignedTo.name,
    email: apiTask.assignedTo.email,
    role: apiTask.assignedTo.role ?? 'member',
  };
}

function buildEmployees(apiTasks: ApiTask[]): Employee[] {
  const employeesMap = new Map<string, Employee>();

  apiTasks.forEach((task) => {
    const employee = extractEmployee(task);
    if (employee && !employeesMap.has(employee.id)) {
      employeesMap.set(employee.id, employee);
    }
  });

  return Array.from(employeesMap.values());
}

export async function getTasks(): Promise<{ tasks: Task[]; employees: Employee[] }> {
  if (useMockAuth) {
    return {
      tasks: getMockTasks(),
      employees: getMockEmployees(),
    };
  }

  const response = await axiosInstance.get<ApiTasksResponse>('/tasks');
  const apiTasks = response.data.data.tasks;
  return {
    tasks: apiTasks.map(normalizeTask),
    employees: buildEmployees(apiTasks),
  };
}

export async function createTask(payload: TaskCreatePayload): Promise<{ task: Task; employee?: Employee }> {
  if (useMockAuth) {
    const tasks = getMockTasks();
    const employees = getMockEmployees();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      status: payload.status,
      priority: payload.priority,
      assignedTo: payload.assignedTo,
      dueDate: payload.dueDate,
      createdAt: new Date().toISOString().split('T')[0],
    };
    saveMockTasks([...tasks, newTask]);
    const employee = employees.find(e => e.id === payload.assignedTo);
    return { task: newTask, employee };
  }

  const response = await axiosInstance.post<ApiTaskResponse>('/tasks', payload);
  const apiTask = response.data.data.task;

  return {
    task: normalizeTask(apiTask),
    employee: extractEmployee(apiTask),
  };
}

export async function updateTask(
  taskId: string,
  payload: TaskUpdatePayload
): Promise<{ task: Task; employee?: Employee }> {
  if (useMockAuth) {
    const tasks = getMockTasks();
    const employees = getMockEmployees();
    let updatedTask: Task | null = null;
    const nextTasks = tasks.map(task => {
      if (task.id === taskId) {
        updatedTask = {
          ...task,
          ...payload,
        };
        return updatedTask;
      }
      return task;
    });
    if (!updatedTask) {
      throw new Error('Task not found');
    }
    saveMockTasks(nextTasks);
    const assignedTo = payload.assignedTo ?? (updatedTask as Task).assignedTo;
    const employee = employees.find(e => e.id === assignedTo);
    return { task: updatedTask, employee };
  }

  const response = await axiosInstance.put<ApiTaskResponse>(`/tasks/${taskId}`, payload);
  const apiTask = response.data.data.task;

  return {
    task: normalizeTask(apiTask),
    employee: extractEmployee(apiTask),
  };
}

export async function deleteTask(taskId: string): Promise<void> {
  if (useMockAuth) {
    const tasks = getMockTasks();
    saveMockTasks(tasks.filter(task => task.id !== taskId));
    return;
  }

  await axiosInstance.delete(`/tasks/${taskId}`);
}
