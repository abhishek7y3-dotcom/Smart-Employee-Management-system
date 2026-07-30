'use client';

import React, { useState, useEffect } from 'react';
import { useLeave, LeaveProvider } from '../../context/LeaveContext';
import { useAuth } from '../../context/AuthContext';
import { LeaveStatistics } from '../../components/leave/LeaveStatistics';
import { LeaveBalanceCard } from '../../components/leave/LeaveBalanceCard';
import { LeaveFilters } from '../../components/leave/LeaveFilters';
import { LeaveTable } from '../../components/leave/LeaveTable';
import { LeaveCalendar } from '../../components/leave/LeaveCalendar';
import { LeaveModal } from '../../components/leave/LeaveModal';
import { LeaveDetailsModal } from '../../components/leave/LeaveDetailsModal';
import { LeaveRequest } from '../../types/leave';
import { Plus, List, Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react';

const LeaveContent = () => {
  const { user } = useAuth();
  const isAdmin = (user?.role === 'admin' || user?.role === 'superadmin') || user?.role === 'Admin' || user?.role === 'HR';
  
  const { leaves, loading, fetchLeaves, fetchBalance, fetchStats, updateLeaveStatus, deleteLeave } = useLeave();
  
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [filters, setFilters] = useState({ search: '', status: '', leaveType: '', department: '' });
  
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchLeaves(filters);
  }, [filters, fetchLeaves]);

  useEffect(() => {
    fetchBalance();
    fetchStats();
  }, [fetchBalance, fetchStats]);

  const handleApprove = async (leave: LeaveRequest) => {
    if (confirm(`Are you sure you want to approve leave for ${leave.employeeName}?`)) {
      await updateLeaveStatus(leave._id, 'Approved');
    }
  };

  const handleReject = async (leave: LeaveRequest) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason !== null) {
      await updateLeaveStatus(leave._id, 'Rejected', reason);
    }
  };

  const handleCancel = async (leave: LeaveRequest) => {
    if (confirm(`Are you sure you want to withdraw this leave request?`)) {
      await updateLeaveStatus(leave._id, 'Withdrawn');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Leave Management</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Manage your leaves and view team requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'table' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <List size={16} /> Table
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'calendar' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <CalendarIcon size={16} /> Calendar
            </button>
          </div>
          <button 
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            <Plus size={18} /> Apply Leave
          </button>
        </div>
      </header>

      {isAdmin && (
        <LeaveStatistics 
          onCardClick={(status) => setFilters(prev => ({ ...prev, status }))} 
        />
      )}
      {!isAdmin && <LeaveBalanceCard />}

      {view === 'table' ? (
        <>
          <LeaveFilters filters={filters} setFilters={setFilters} isAdmin={isAdmin} />
          <LeaveTable 
            leaves={leaves} 
            loading={loading} 
            isAdmin={isAdmin}
            currentUserId={user?.id}
            onView={(leave) => { setSelectedLeave(leave); setIsDetailsModalOpen(true); }}
            onApprove={handleApprove}
            onReject={handleReject}
            onCancel={handleCancel}
          />
        </>
      ) : (
        <LeaveCalendar 
          leaves={leaves} 
          onView={(leave) => { setSelectedLeave(leave); setIsDetailsModalOpen(true); }} 
        />
      )}

      <LeaveModal 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
        onSuccess={() => setIsApplyModalOpen(false)} 
      />
      
      <LeaveDetailsModal 
        isOpen={isDetailsModalOpen} 
        leave={selectedLeave} 
        onClose={() => setIsDetailsModalOpen(false)} 
      />
    </div>
  );
};

export default function LeavePage() {
  return (
    <LeaveProvider>
      <LeaveContent />
    </LeaveProvider>
  );
}
