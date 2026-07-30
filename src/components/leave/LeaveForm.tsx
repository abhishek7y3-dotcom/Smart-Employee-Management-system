import React, { useState, useEffect } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { LeaveType } from '../../types/leave';

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const LeaveForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const { applyLeave } = useLeave();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    leaveType: 'Sick Leave' as LeaveType,
    startDate: '',
    endDate: '',
    halfDay: false,
    halfDaySession: 'Morning',
    reason: ''
  });

  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      if (formData.halfDay) {
        setTotalDays(0.5);
      } else {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(diffDays > 0 ? diffDays : 0);
      }
    } else {
      setTotalDays(0);
    }
  }, [formData.startDate, formData.endDate, formData.halfDay]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date cannot be before start date.');
      return;
    }

    if (formData.reason.length < 10) {
      setError('Reason must be at least 10 characters long.');
      return;
    }

    try {
      setLoading(true);
      await applyLeave({ ...formData, totalDays });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const leaveTypes = [
    'Sick Leave', 'Casual Leave', 'Earned Leave', 'Annual Leave', 
    'Half-Day Leave', 'Work From Home', 'Maternity Leave', 
    'Paternity Leave', 'Marriage Leave', 'Bereavement Leave', 
    'Compensatory Leave', 'Unpaid Leave'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Leave Type *</label>
        <select 
          name="leaveType" 
          value={formData.leaveType} 
          onChange={handleChange}
          className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
          required
        >
          {leaveTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Start Date *</label>
          <input 
            type="date" 
            name="startDate" 
            value={formData.startDate} 
            onChange={handleChange}
            className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
            required
            min={new Date().toISOString().split('T')[0]} // Cannot apply past leave simply
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">End Date *</label>
          <input 
            type="date" 
            name="endDate" 
            value={formData.endDate} 
            onChange={handleChange}
            disabled={formData.halfDay}
            className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 disabled:opacity-50"
            required
            min={formData.startDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            name="halfDay" 
            checked={formData.halfDay} 
            onChange={(e) => {
              handleChange(e);
              if (e.target.checked && formData.startDate) {
                setFormData(prev => ({ ...prev, endDate: prev.startDate }));
              }
            }}
            className="w-4 h-4 text-blue-600 rounded border-zinc-300 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Half Day</span>
        </label>
        
        {formData.halfDay && (
          <select 
            name="halfDaySession" 
            value={formData.halfDaySession} 
            onChange={handleChange}
            className="p-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
          >
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
          </select>
        )}
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm font-medium">
        Total Days: {totalDays}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Reason *</label>
        <textarea 
          name="reason" 
          value={formData.reason} 
          onChange={handleChange}
          rows={3}
          maxLength={500}
          className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 resize-none"
          placeholder="Please provide a valid reason..."
          required
        />
        <div className="text-right text-xs text-zinc-600 mt-1">{formData.reason.length}/500</div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 font-medium rounded-lg text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          disabled={loading || totalDays === 0}
          className="px-6 py-2 font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>}
          Submit Request
        </button>
      </div>
    </form>
  );
};
