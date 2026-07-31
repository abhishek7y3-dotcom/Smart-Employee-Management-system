import React, { useState } from 'react';
import { Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { Trash2, Ban, CheckCircle2, Edit, Eye, X } from 'lucide-react';

interface EmployeeCardProps {
  employee: Employee;
}

const DESIGNATIONS = [
  'CEO',
  'Admin',
  'Employee',
  'Software Developer',
  'Senior Developer',
  'Product Designer',
  'QA Analyst',
  'Project Manager',
  'HR Specialist',
  'Intern'
];

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  const { user } = useAuth();
  const { updateEmployeeDesignation, updateEmployeeRole, removeEmployee, blockEmployee, unblockEmployee } = useTasks();

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = (user?.role === 'admin' || user?.role === 'superadmin') || isSuperAdmin;
  const canEditDesignation = isAdmin && (employee.role !== 'superadmin' || employee.id === user?.id);
  const canEditRole = isSuperAdmin && employee.id !== user?.id && employee.role !== 'superadmin';
  
  const targetIsAdminOrSuper = employee.role === 'admin' || employee.role === 'superadmin';
  const canRemoveUser = employee.id !== user?.id && (isSuperAdmin || (isAdmin && !targetIsAdminOrSuper));
  const canBlockUser = canRemoveUser;

  const handleDesignationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateEmployeeDesignation(employee.id, e.target.value);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [confirmState, setConfirmState] = React.useState<{
    isOpen: boolean;
    action: 'remove' | 'block' | 'unblock' | null;
    message: string;
  }>({ isOpen: false, action: null, message: '' });

  const handleConfirmAction = () => {
    if (confirmState.action === 'remove') {
      removeEmployee(employee.id);
    } else if (confirmState.action === 'block') {
      blockEmployee(employee.id);
    } else if (confirmState.action === 'unblock') {
      unblockEmployee(employee.id);
    }
    setConfirmState({ isOpen: false, action: null, message: '' });
  };

  const handleRemoveUser = () => {
    setConfirmState({
      isOpen: true,
      action: 'remove',
      message: `Are you sure you want to remove ${employee.name}?`
    });
  };

  const handleBlockUser = () => {
    setConfirmState({
      isOpen: true,
      action: 'block',
      message: `Are you sure you want to block ${employee.name}? They will lose access.`
    });
  };

  const handleUnblockUser = () => {
    setConfirmState({
      isOpen: true,
      action: 'unblock',
      message: `Are you sure you want to unblock ${employee.name}? They will regain access.`
    });
  };

  return (
    <div className="enterprise-card flex flex-col gap-3 p-3.5 rounded-xl transition-all duration-300 sm:flex-row sm:items-center sm:justify-between hover:-translate-y-0.5 hover:shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex items-center space-x-3">
        {employee.avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={employee.avatarUrl}
            alt={employee.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-200/60 dark:ring-zinc-800/60 hover:scale-105 transition-all duration-300"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/10 hover:scale-105 transition-all duration-300 shrink-0">
            {employee.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-200 text-sm truncate">{employee.name}</h4>
            {(employee.role === 'admin' || employee.role === 'superadmin') && (
              <span className="flex items-center gap-1 text-[9px] bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-200/40 dark:border-amber-900/40 shadow-sm shrink-0">
                👑 {employee.role === 'superadmin' ? 'Super Admin' : 'Admin'}
              </span>
            )}
          </div>
          <p className="text-zinc-600 dark:text-zinc-500 text-[10px] truncate">{employee.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {isEditing && canEditDesignation ? (
          <div className="relative">
            <select
              value={employee.designation || ''}
              onChange={handleDesignationChange}
              className="text-xs bg-white dark:bg-zinc-950 border border-zinc-500 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg px-2.5 py-1.5 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer"
            >
              {DESIGNATIONS.filter(des => des !== 'CEO' || employee.role === 'superadmin').map((des) => (
                <option key={des} value={des}>
                  {des}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="text-zinc-600 dark:text-zinc-400 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200/40 dark:border-zinc-800/40">
            {employee.designation || (employee.role === 'superadmin' ? 'CEO' : (employee.role === 'admin' ? 'Admin' : 'Employee'))}
          </span>
        )}

        {isEditing && canEditRole ? (
          <div className="relative">
            <select
              value={employee.role === 'user' || employee.role === 'employee' ? 'member' : employee.role}
              onChange={(e) => updateEmployeeRole(employee.id, e.target.value)}
              className="text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg px-2.5 py-1.5 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer"
            >
              <option value="member">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ) : (
          !isEditing && canEditRole && (
             <span className="text-zinc-600 dark:text-zinc-400 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200/40 dark:border-zinc-800/40 capitalize">
               {employee.role === 'user' || employee.role === 'member' ? 'Employee' : employee.role}
             </span>
          )
        )}

        <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-700 pl-2 ml-1">
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="p-1.5 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors cursor-pointer shrink-0"
            title={`View ${employee.name}`}
          >
            <Eye size={16} strokeWidth={2.5} />
          </button>

          {(canEditDesignation || canEditRole) && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${isEditing ? 'text-zinc-50 bg-zinc-800 hover:bg-zinc-700 dark:text-zinc-900 dark:bg-zinc-200 dark:hover:bg-zinc-300' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              title={isEditing ? 'Done' : 'Edit'}
            >
              <Edit size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>


        {canBlockUser && (
          employee.isBlocked ? (
            <button
              type="button"
              onClick={handleUnblockUser}
              className="p-1.5 rounded-lg text-amber-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors cursor-pointer shrink-0"
              title={`Unblock ${employee.name}`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBlockUser}
              className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer shrink-0"
              title={`Block ${employee.name}`}
            >
              <Ban className="w-4 h-4" />
            </button>
          )
        )}

        {canRemoveUser && (
          <button
            type="button"
            onClick={handleRemoveUser}
            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer shrink-0"
            title={`Remove ${employee.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl dark:border-zinc-800/80 dark:bg-zinc-950 relative z-10">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-2">Confirm Action</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{confirmState.message}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmState({ isOpen: false, action: null, message: '' })}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Profile Details Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl dark:border-zinc-800/80 dark:bg-zinc-950 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Employee Profile</h3>
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-center mb-2">
                {employee.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={employee.avatarUrl} alt={employee.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-zinc-100 dark:ring-zinc-800" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-md">
                    {employee.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Employee ID</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 col-span-2 truncate" title={employee.id}>{employee.id}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Name</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 col-span-2">{employee.name}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Email</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 col-span-2 truncate" title={employee.email}>{employee.email}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Contact Number</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 col-span-2">Not Available</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 pb-1">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Employee Type</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 col-span-2 capitalize">
                  {employee.designation || (employee.role === 'superadmin' ? 'CEO' : (employee.role === 'admin' ? 'Admin' : 'Employee'))} 
                  <span className="text-xs text-zinc-500 ml-1">({employee.role === 'user' || employee.role === 'member' ? 'Employee' : employee.role})</span>
                </span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
