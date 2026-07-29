import React from 'react';
import { useLeave } from '../../context/LeaveContext';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  onCardClick?: (status: string) => void;
}

export const LeaveStatistics: React.FC<Props> = ({ onCardClick }) => {
  const { stats, loading } = useLeave();

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        ))}
      </div>
    );
  }

  const cardStyle = (clickable: boolean) => 
    `bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 ${clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div 
        className={cardStyle(false)}
        // We could map this to a specific filter if supported, but currently no "today" filter exists.
      >
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">On Leave Today</p>
          <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.onLeaveToday}</p>
        </div>
      </div>

      <div 
        className={cardStyle(!!onCardClick)} 
        onClick={() => onCardClick?.('Pending')}
      >
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
          <Clock size={24} />
        </div>
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Pending Requests</p>
          <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.pendingRequests}</p>
        </div>
      </div>

      <div 
        className={cardStyle(!!onCardClick)} 
        onClick={() => onCardClick?.('Approved')}
      >
        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
          <CheckCircle size={24} />
        </div>
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Approved Leaves</p>
          <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.approvedLeaves}</p>
        </div>
      </div>

      <div 
        className={cardStyle(!!onCardClick)} 
        onClick={() => onCardClick?.('Rejected')}
      >
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
          <XCircle size={24} />
        </div>
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Rejected Leaves</p>
          <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{stats.rejectedLeaves}</p>
        </div>
      </div>
    </div>
  );
};
