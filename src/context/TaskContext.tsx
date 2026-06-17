'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, Task, TaskStatus, TaskPriority } from '../types';
import { mockEmployees, mockTasks } from '../data/mockData';

interface TaskContextType {
  tasks: Task[];
  employees: Employee[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTaskPriority: (taskId: string, priority: TaskPriority) => void;
  assignTask: (taskId: string, employeeId: string) => void;
  deleteTask: (taskId: string) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Load initial data
  useEffect(() => {
    const storedTasks = localStorage.getItem('employee_tasks');
    const storedEmployees = localStorage.getItem('employee_members');

    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      setTasks(mockTasks);
      localStorage.setItem('employee_tasks', JSON.stringify(mockTasks));
    }

    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      setEmployees(mockEmployees);
      localStorage.setItem('employee_members', JSON.stringify(mockEmployees));
    }
  }, []);

  // Helper to persist state
  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('employee_tasks', JSON.stringify(newTasks));
  };

  const saveEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    localStorage.setItem('employee_members', JSON.stringify(newEmployees));
  };

  const addTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    saveTasks([...tasks, newTask]);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
    saveTasks(updated);
  };

  const updateTaskPriority = (taskId: string, priority: TaskPriority) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, priority } : t));
    saveTasks(updated);
  };

  const assignTask = (taskId: string, employeeId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, assignedTo: employeeId } : t));
    saveTasks(updated);
  };

  const deleteTask = (taskId: string) => {
    const filtered = tasks.filter((t) => t.id !== taskId);
    saveTasks(filtered);
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
        addTask,
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
