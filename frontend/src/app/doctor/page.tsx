'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { Calendar, Clock, Plus, Trash2, Save, Loader, CheckCircle, X } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";


interface AvailableSlot {
  date: string;
  time: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  slots_available?: AvailableSlot[];
  doctor?: any;
}

const DoctorAvailabilityPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const router = useRouter()
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  // Get token on mount
  useEffect(() => {
    const token = localStorage.getItem('dToken');
    setToken(token);
    if(!token) {
      router.push("/doctor/login")
    }
  }, []);

  // Fetch existing slots
  const fetchAvailableSlots = async (): Promise<void> => {
    if (!token) return;

    try {
      setLoading(true);
      const response: AxiosResponse<ApiResponse> = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND_URL + '/api/doctor/get-availability',
        { headers: { token,}}
      );

      console.log("response from fetching slots: ", response);
      

      if (response.data.success) {
        setAvailableSlots(response.data.slots_available || []);
      }
    } catch (error: any) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAvailableSlots();
    }
  }, [token]);

  // Calendar functions
  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // Add empty days for padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(new Date(0));
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

    const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const hasSlots = (date: Date): boolean => {
    const dateStr = formatDate(date);
    return availableSlots.some(slot => slot.date === dateStr);
  };

  const getSlotsForDate = (date: string): string[] => {
    return availableSlots
      .filter(slot => slot.date === date)
      .map(slot => slot.time);
  };

  // Handle date selection
  const handleDateClick = (date: Date): void => {
    if (isPastDate(date) || date.getTime() === 0) return;
    
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
    setSelectedTimes(getSlotsForDate(dateStr));
  };

  // Handle time slot toggle
  const toggleTimeSlot = (time: string): void => {
    setSelectedTimes(prev => {
      if (prev.includes(time)) {
        return prev.filter(t => t !== time);
      } else {
        return [...prev, time].sort();
      }
    });
  };

  // Save availability
  const handleSaveAvailability = async (): Promise<void> => {
    if (!token || !selectedDate) {
      toast.error('Please select a date');
      return;
    }

    if (selectedTimes.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }

    try {
      setSaveLoading(true);

      // Remove existing slots for this date
      const updatedSlots = availableSlots.filter(slot => slot.date !== selectedDate);

      // Add new slots
      selectedTimes.forEach(time => {
        updatedSlots.push({ date: selectedDate, time });
      });
      console.log("from the appointment: ", token);
      
      const response: AxiosResponse<ApiResponse> = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + '/api/doctor/update-availability',
        { slots_available: updatedSlots },
        {headers: {token}}
      );

      if (response.data.success) {
        setAvailableSlots(updatedSlots);
        toast.success('Availability updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating availability:', error);
      toast.error(error.response?.data?.message || 'Failed to update availability');
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete all slots for a date
  const handleDeleteDate = async (date: string): Promise<void> => {
    if (!token) return;

    try {
      const updatedSlots = availableSlots.filter(slot => slot.date !== date);

      const response: AxiosResponse<ApiResponse> = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL +'/api/doctor/update-availability',
        { slots_available: updatedSlots },
        {headers: {token}}
      );
      console.log("res is: ", response);
      

      if (response.data.success) {
        setAvailableSlots(updatedSlots);
        if (selectedDate === date) {
          setSelectedDate('');
          setSelectedTimes([]);
        }
        toast.success('Slots deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting slots:', error);
      toast.error('Failed to delete slots');
    }
  };

  // Navigation
  const goToPreviousMonth = (): void => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = (): void => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
          },
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Manage Availability</h1>
              <p className="text-sm text-gray-600 mt-1">Set your available time slots for patient appointments</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              >
                Doctor
              </button>
              <button 
                type="button"
                onClick={() => {
                  localStorage.removeItem('dToken');
                  toast.success('Logged out successfully');
                  window.location.href = '/doctor/login';
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar size={20} className="text-blue-600" />
                    Select Date
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-lg font-medium text-gray-900 min-w-[160px] text-center">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Day names */}
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                      {day}
                    </div>
                  ))}

                  {/* Calendar days */}
                  {getDaysInMonth(currentMonth).map((date, index) => {
                    const dateStr = formatDate(date);
                    const isEmpty = date.getTime() === 0;
                    const isPast = isPastDate(date);
                    const isTodayDate = isToday(date);
                    const hasAvailableSlots = hasSlots(date);
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateClick(date)}
                        disabled={isEmpty || isPast}
                        className={`
                          relative aspect-square p-2 rounded-lg text-sm font-medium transition-all
                          ${isEmpty ? 'invisible' : ''}
                          ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                          ${!isEmpty && !isPast ? 'hover:bg-gray-100 cursor-pointer' : ''}
                          ${isTodayDate ? 'border-2 border-blue-500' : 'border border-gray-200'}
                          ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-900'}
                          ${hasAvailableSlots && !isSelected ? 'bg-green-50 border-green-300' : ''}
                        `}
                      >
                        {!isEmpty && date.getDate()}
                        {hasAvailableSlots && !isSelected && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
                    <span>Has slots</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span>Selected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Slots Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Clock size={20} className="text-blue-600" />
                  Time Slots
                </h2>

                {selectedDate ? (
                  <>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm font-medium text-blue-900">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4">
                      {timeSlots.map(time => (
                        <button
                          key={time}
                          onClick={() => toggleTimeSlot(time)}
                          className={`
                            w-full p-3 rounded-md text-sm font-medium transition-all border
                            ${selectedTimes.includes(time)
                              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span>{time}</span>
                            {selectedTimes.includes(time) && <CheckCircle size={16} />}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={handleSaveAvailability}
                        disabled={saveLoading || selectedTimes.length === 0}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saveLoading ? (
                          <>
                            <Loader className="animate-spin" size={16} />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save Availability
                          </>
                        )}
                      </button>

                      {getSlotsForDate(selectedDate).length > 0 && (
                        <button
                          onClick={() => handleDeleteDate(selectedDate)}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-all"
                        >
                          <Trash2 size={16} />
                          Delete All Slots
                        </button>
                      )}
                    </div>

                    {selectedTimes.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-xs text-gray-600 font-medium mb-1">Selected:</p>
                        <p className="text-sm text-gray-900">{selectedTimes.length} time slot(s)</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-sm text-gray-600">Select a date from the calendar to manage time slots</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Availability Summary</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader className="animate-spin text-blue-600" size={24} />
                <span className="ml-3 text-gray-600">Loading...</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <Plus className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600">No availability set yet. Start by selecting a date above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(
                  availableSlots.reduce((acc, slot) => {
                    if (!acc[slot.date]) acc[slot.date] = [];
                    acc[slot.date].push(slot.time);
                    return acc;
                  }, {} as Record<string, string[]>)
                )
                  .filter(([date]) => new Date(date + 'T00:00:00') >= new Date(new Date().setHours(0, 0, 0, 0)))
                  .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                  .slice(0, 12)
                  .map(([date, times]) => (
                    <div key={date} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </h3>
                        <button
                          onClick={() => handleDeleteDate(date)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {times.sort().map(time => (
                          <span
                            key={time}
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                          >
                            {time}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{times.length} slot(s) available</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorAvailabilityPage;