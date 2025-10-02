"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Doctor {
  _id: string;
  name: string;
  image: string;
  speciality: string;
  degree?: string;
  experience?: string;
  fees?: number;
  address: string;
}

interface Appointment {
  _id: string;
  docId: string;
  slotDate: string;
  slotTime: string;
  canceled: boolean;
  payment: boolean;
  isCompleted: boolean;
  createdAt: string;
  doctor: Doctor;
}

interface ApiResponse {
  success: boolean;
  data: Appointment[];
  message: string;
  statusCode: number;
}

function MyAppointments() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ;
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const getUserAppointments = async (): Promise<void> => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get<ApiResponse>(
        `${backendUrl}/api/user/my-appointments`,
        { headers: { token } }
      );

      console.log("Appointments response:", response.data);

      if (response.data.success) {
        setAppointments(response.data.data.reverse());
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string): Promise<void> => {
    if (!appointmentId) {
      toast.error("Invalid appointment ID");
      console.log("Appointment ID is undefined or invalid:", appointmentId);
      return;
    }

    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setCancelingId(appointmentId);
    try {
      console.log("Sending cancel request for appointment ID:", appointmentId);
      
      const response = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { token } }
      );
      
      console.log("Cancel response:", response.data);

      if (response.data.success) {
        toast.success(response.data.message || "Appointment cancelled successfully");
        
        // Update the UI immediately by marking the appointment as canceled
        setAppointments(prevAppointments =>
          prevAppointments.map(apt =>
            apt._id === appointmentId ? { ...apt, canceled: true } : apt
          )
        );
      } else {
        toast.error(response.data.message || "Failed to cancel appointment");
      }
    } catch (error: any) {
      console.error("Cancel error:", error);
      toast.error(error.response?.data?.message || "Failed to cancel appointment");
    } finally {
      setCancelingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      year: date.getFullYear(),
      full: `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
    };
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    getUserAppointments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6 w-full">
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-2">
            View and manage your upcoming appointments
          </p>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-10 w-10 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No appointments yet
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't booked any appointments yet. Start by finding a doctor.
            </p>
            <button
              onClick={() => router.push("/doctors")}
              className="px-8 py-3 text-base font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            {appointments.map((appointment) => {
              const formatted = formatDate(appointment.slotDate);
              
              console.log("Rendering appointment:", appointment._id);
              
              return (
                <div
                  key={appointment._id}
                  className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 w-full ${
                    appointment.canceled
                      ? "border-red-200 opacity-75"
                      : appointment.isCompleted
                      ? "border-green-200"
                      : "border-indigo-100 hover:border-indigo-300"
                  }`}
                >
                  {/* Header with Status Badge */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <svg
                            className="w-6 h-6 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Appointment Date</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatted.day}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 items-end">
                        {appointment.canceled && (
                          <span className="px-3 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full border border-red-200">
                            CANCELED
                          </span>
                        )}
                        {appointment.isCompleted && !appointment.canceled && (
                          <span className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full border border-green-200">
                            COMPLETED
                          </span>
                        )}
                        {!appointment.canceled && !appointment.isCompleted && (
                          <span className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded-full border border-blue-200">
                            UPCOMING
                          </span>
                        )}
                        {appointment.payment && (
                          <span className="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full border border-emerald-200">
                            PAID
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Doctor Info Section */}
                    <div className="flex gap-4 mb-6">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={appointment.doctor?.image || "/placeholder.png"}
                          alt={appointment.doctor?.name || "Doctor"}
                          fill
                          className="rounded-xl object-cover border-2 border-indigo-100"
                          sizes="96px"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {appointment.doctor?.name}
                        </h3>
                        <p className="text-indigo-600 font-semibold mb-2">
                          {appointment.doctor?.speciality}
                        </p>
                        {appointment.doctor?.degree && (
                          <p className="text-sm text-gray-600">
                            {appointment.doctor.degree}
                          </p>
                        )}
                        {appointment.doctor?.experience && (
                          <p className="text-sm text-gray-500">
                            {appointment.doctor.experience} experience
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Appointment Details Grid */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                      {/* Date & Time */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            APPOINTMENT SCHEDULE
                          </p>
                          <p className="text-base font-bold text-gray-900">
                            {formatted.month} {formatted.date}, {formatted.year}
                          </p>
                          <p className="text-lg font-bold text-indigo-600 mt-1">
                            {appointment.slotTime}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-purple-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            CLINIC ADDRESS
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {appointment.doctor?.address}
                          </p>
                        </div>
                      </div>

                      {/* Fee */}
                      {appointment.doctor?.fees && (
                        <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium mb-1">
                              CONSULTATION FEE
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              ${appointment.doctor.fees}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Booked Info */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        Booked on{" "}
                        {new Date(appointment.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {!appointment.canceled && !appointment.isCompleted && (
                        <>
                          <button
                            onClick={() => router.push(`/appointment/${appointment.docId}`)}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-indigo-600 bg-indigo-50 border-2 border-indigo-200 rounded-lg hover:bg-indigo-100 transition-all duration-200"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => {
                              console.log("Cancel button clicked for ID:", appointment._id);
                              cancelAppointment(appointment._id);
                            }}
                            disabled={cancelingId === appointment._id}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            {cancelingId === appointment._id
                              ? "Canceling..."
                              : "Cancel"}
                          </button>
                        </>
                      )}
                      {appointment.canceled && (
                        <div className="flex-1 px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-lg text-center">
                          Appointment Canceled
                        </div>
                      )}
                      {appointment.isCompleted && !appointment.canceled && (
                        <div className="flex-1 px-4 py-3 text-sm font-semibold text-green-600 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                          Appointment Completed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyAppointments;