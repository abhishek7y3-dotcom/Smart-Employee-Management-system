'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/services/axios';
import { Calendar as CalendarIcon, Plus, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';

import { Holiday, HolidayStats } from '@/types/holiday';
import { HolidayStatistics } from '@/components/calendar/HolidayStatistics';
import { HolidayToolbar } from '@/components/calendar/HolidayToolbar';
import { HolidayTable } from '@/components/calendar/HolidayTable';
import { HolidayCard } from '@/components/calendar/HolidayCard';
import { HolidayModal } from '@/components/calendar/HolidayModal';
import { HolidayForm } from '@/components/calendar/HolidayForm';
import { HolidayDetails } from '@/components/calendar/HolidayDetails';
import { HolidayCalendarEvent } from '@/components/calendar/HolidayCalendarEvent';
import { useAuth } from '@/context/AuthContext';

export default function CalendarPage() {
  const { user } = useAuth();
  const isAdmin = (user?.role === 'admin' || user?.role === 'superadmin') || user?.role === 'Admin' || user?.role === 'HR';
  
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [stats, setStats] = useState<HolidayStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ year: '', month: '', holidayType: '', status: '' });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.year) params.append('year', filters.year);
      if (filters.month) params.append('month', filters.month);
      if (filters.holidayType) params.append('holidayType', filters.holidayType);
      if (filters.status) params.append('status', filters.status);

      const [holidaysRes, statsRes] = await Promise.all([
        axiosInstance.get(`/holidays?${params.toString()}`).catch(() => ({ data: { data: [] } })),
        axiosInstance.get('/holidays/stats').catch(() => ({ data: { data: null } }))
      ]);

      setHolidays(holidaysRes.data.data || []);
      if (statsRes.data.data) setStats(statsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch holidays', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // Form Handlers
  const handleCreateSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await axiosInstance.post('/holidays', data);
      setIsModalOpen(false);
      fetchHolidays();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create holiday');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (!selectedHoliday) return;
    try {
      setIsSubmitting(true);
      await axiosInstance.put(`/holidays/${selectedHoliday._id}`, data);
      setIsModalOpen(false);
      fetchHolidays();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update holiday');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (holiday: Holiday) => {
    if (!window.confirm(`Are you sure you want to delete ${holiday.holidayName}?`)) return;
    try {
      await axiosInstance.delete(`/holidays/${holiday._id}`);
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to delete holiday');
    }
  };

  // Actions
  const openCreateModal = () => {
    setSelectedHoliday(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openViewModal = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setModalMode('view');
    setIsModalOpen(true);
  };

  // Calendar Helpers
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="mx-auto max-w-[1600px] p-6 md:p-8">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Company Calendar
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Manage and view company holidays and events.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'calendar' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 hover:text-zinc-700 dark:text-zinc-400'}`}
            >
              <LayoutGrid size={16} /> Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${view === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 hover:text-zinc-700 dark:text-zinc-400'}`}
            >
              <List size={16} /> List
            </button>
          </div>
          {isAdmin && (
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={18} /> Add Holiday
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Calendar or Table */}
        <div className="flex-1 min-w-0">
          <HolidayToolbar 
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            filters={filters} setFilters={setFilters}
            years={years}
          />

          {view === 'list' ? (
            <HolidayTable 
              holidays={holidays} 
              loading={loading}
              onView={openViewModal}
              onEdit={openEditModal}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ) : (
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm dark:bg-zinc-900/50 dark:border-zinc-800 overflow-hidden">
              <div className="p-4 flex justify-between items-center bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                <button onClick={prevMonth} className="px-4 py-2 text-sm font-medium bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 transition-colors">Previous</button>
                <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{monthName}</h2>
                <button onClick={nextMonth} className="px-4 py-2 text-sm font-medium bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 transition-colors">Next</button>
              </div>
              
              <div className="grid grid-cols-7 text-center font-semibold text-xs text-zinc-600 uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 border-r border-zinc-200 dark:border-zinc-800 last:border-r-0">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 gap-[1px]">
                {/* Empty cells */}
                {[...Array(firstDay)].map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 border border-zinc-200/50 bg-zinc-50/50 dark:border-zinc-800/50 dark:bg-zinc-900/20" />
                ))}
                
                {/* Day cells */}
                {[...Array(daysInMonth)].map((_, i) => {
                  const d = i + 1;
                  const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                  const dateStr = dateObj.toISOString().split('T')[0];
                  const dayHolidays = holidays.filter(h => h.holidayDate.split('T')[0] === dateStr);
                  const isToday = new Date().toISOString().split('T')[0] === dateStr;
                  const isSunday = dateObj.getDay() === 0;
                  
                  const isClickable = dayHolidays.length > 0;

                  return (
                    <div 
                      key={d} 
                      onClick={() => {
                        if (dayHolidays.length > 0) openViewModal(dayHolidays[0]);
                      }}
                      className={`h-24 p-2 overflow-y-auto transition-colors border border-zinc-200 dark:border-zinc-800 ${isClickable ? 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800' : ''} ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10 ring-1 ring-inset ring-blue-500/50' : isSunday ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80'}`}
                    >
                      <div className={`font-bold text-sm mb-2 ${isToday ? 'text-blue-600 dark:text-blue-400' : isSunday ? 'text-red-500 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-400'}`}>{d}</div>

                      {dayHolidays.map(h => (
                        <HolidayCalendarEvent key={h._id} holiday={h} onClick={openViewModal} />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Widgets */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <HolidayCard holidays={holidays} loading={loading} />
        </div>
      </div>

      {/* Modals */}
      <HolidayModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Add New Holiday' : modalMode === 'edit' ? 'Edit Holiday' : 'Holiday Details'}
      >
        {modalMode === 'view' && selectedHoliday && (
          <HolidayDetails holiday={selectedHoliday} />
        )}
        {(modalMode === 'create' || modalMode === 'edit') && (
          <HolidayForm 
            initialData={selectedHoliday}
            onSubmit={modalMode === 'create' ? handleCreateSubmit : handleEditSubmit}
            onCancel={() => setIsModalOpen(false)}
            loading={isSubmitting}
          />
        )}
      </HolidayModal>
    </div>
  );
}
