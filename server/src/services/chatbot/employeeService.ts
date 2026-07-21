import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
import User, { IUser } from '../../models/User';
import Task from '../../models/Task';

export const getEmployeeWorkloadDeclaration: FunctionDeclaration = {
  name: 'getEmployeeWorkload',
  description: 'Evaluates the workload of an employee. Returns the count of pending and completed tasks. ADMIN ONLY.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      employeeName: { type: SchemaType.STRING, description: 'First or full name of the employee to evaluate' }
    },
    required: ['employeeName']
  },
};

export async function handleGetEmployeeWorkload(user: IUser, args: { employeeName: string }) {
  if (user.role !== 'admin') {
    return { error: 'UNAUTHORIZED: Only administrators can view employee workloads.' };
  }

  const employee = await User.findOne({ name: { $regex: new RegExp(args.employeeName, 'i') } });
  if (!employee) {
    return { error: `Employee '${args.employeeName}' not found.` };
  }

  const pendingTasks = await Task.countDocuments({ assignedTo: employee._id, status: { $nin: ['completed', 'cancelled'] } });
  const completedTasks = await Task.countDocuments({ assignedTo: employee._id, status: 'completed' });
  const highPriority = await Task.countDocuments({ assignedTo: employee._id, priority: 'high', status: { $nin: ['completed', 'cancelled'] } });

  return {
    success: true,
    data: {
      employee: employee.name,
      designation: employee.designation,
      pendingTasks,
      completedTasks,
      highPriorityPending: highPriority,
      workloadStatus: pendingTasks > 5 ? 'overloaded' : (pendingTasks > 2 ? 'busy' : 'available')
    }
  };
}
