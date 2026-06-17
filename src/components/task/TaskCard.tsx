import React from 'react';
import { Task } from '../../types';
import { formatDate } from '../../utils/format';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    completed: 'Completed',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
          {task.priority.toUpperCase()}
        </span>
        <span className="text-xs text-gray-500">{formatDate(task.dueDate)}</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
      
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500">Assigned To ID: {task.assignedTo}</span>
        {onStatusChange ? (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
            className="border border-gray-300 rounded px-1 py-0.5 bg-white text-gray-700 focus:outline-none"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        ) : (
          <span className="font-medium text-gray-700">{statusLabels[task.status]}</span>
        )}
      </div>
    </div>
  );
};
