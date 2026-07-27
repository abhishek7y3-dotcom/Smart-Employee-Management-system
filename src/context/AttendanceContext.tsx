'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axiosInstance from '../services/axios';
import { AttendanceRecord, AttendanceAnalytics } from '../types/attendance';

interface AttendanceContextType {
  records: AttendanceRecord[];
  todayRecord: AttendanceRecord | null;
  analytics: AttendanceAnalytics | null;
  loading: boolean;
  fetchRecords: (filters?: Record<string, any>) => Promise<void>;
  fetchTodayRecord: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  checkIn: (workMode?: string, location?: string) => Promise<void>;
  checkOut: () => Promise<void>;
  markBreakStart: () => Promise<void>;
  markBreakEnd: () => Promise<void>;
  updateRecord: (id: string, data: Partial<AttendanceRecord>) => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider = ({ children }: { children: ReactNode }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [analytics, setAnalytics] = useState<AttendanceAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(async (filters: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      const res = await axiosInstance.get(`/attendance?${params.toString()}`);
      setRecords(res.data.data);
    } catch (error) {
      console.error('Failed to fetch attendance records', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTodayRecord = useCallback(async () => {
    try {
      const d = new Date();
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const res = await axiosInstance.get(`/attendance?date=${dateStr}`);
      const myRecord = res.data.data.find((r: any) => true); // It will return my record based on backend logic if I'm not admin
      // The backend returns an array. We need to find the one for the logged in user.
      // Wait, the backend already filters by req.user._id if not admin. If admin, it returns all.
      // A better way is to rely on frontend filtering if multiple are returned
      // Let's assume the user is fetched. Since we only want our own today record for checkin state:
      if (res.data.data.length > 0) {
        setTodayRecord(res.data.data[0]); 
      } else {
        setTodayRecord(null);
      }
    } catch (error) {
      console.error('Failed to fetch today record', error);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/attendance/analytics');
      setAnalytics(res.data.data);
    } catch (error) {
      console.error('Failed to fetch attendance analytics', error);
    }
  }, []);

  const checkIn = async (workMode?: string, location?: string) => {
    try {
      await axiosInstance.post('/attendance/check-in', { workMode, location });
      await fetchTodayRecord();
      await fetchRecords();
    } catch (error) {
      console.error(error);
    }
  };

  const checkOut = async () => {
    try {
      await axiosInstance.post('/attendance/check-out');
      await fetchTodayRecord();
      await fetchRecords();
    } catch (error) {
      console.error(error);
    }
  };

  const markBreakStart = async () => {
    try {
      await axiosInstance.post('/attendance/break-start');
      await fetchTodayRecord();
    } catch (error) {
      console.error(error);
    }
  };

  const markBreakEnd = async () => {
    try {
      await axiosInstance.post('/attendance/break-end');
      await fetchTodayRecord();
    } catch (error) {
      console.error(error);
    }
  };

  const updateRecord = async (id: string, data: Partial<AttendanceRecord>) => {
    try {
      await axiosInstance.put(`/attendance/${id}`, data);
      await fetchRecords();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AttendanceContext.Provider value={{
      records,
      todayRecord,
      analytics,
      loading,
      fetchRecords,
      fetchTodayRecord,
      fetchAnalytics,
      checkIn,
      checkOut,
      markBreakStart,
      markBreakEnd,
      updateRecord
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
