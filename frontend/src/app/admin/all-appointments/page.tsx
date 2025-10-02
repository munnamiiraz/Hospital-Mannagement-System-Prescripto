"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
}

interface DoctorData {
  _id: string;
  name: string;
  image: string;
  degree: string;
  speciality: string;
  experience: string;
  fees: number;
}

interface Appointment {
  _id: string;
  userId: string;
  docId: string;
  slotDate: string;
  slotTime: string;
  userData: UserData;
  docData: DoctorData;
  amount: number;
  date: number;
  canceled: boolean;
  payment: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  statusCode: number;
  data: Appointment[];
  message: string;
  success: boolean;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("aToken");
      
      const response = await axios.get<ApiResponse>(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/admin/all-appointments",
        { headers: { token } }
      );
      console.log("responce: ", response);
      
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        alert("Session expired. Please login again.");
        window.location.href = "/admin/login";
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setCancelingId(appointmentId);
    console.log("canceling appointment: ", appointmentId);
    
    try {
      const token = localStorage.getItem("aToken");
      
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/admin/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );

      if (response.data.success) {
        await fetchAppointments();
        alert("Appointment canceled successfully!");
      } else {
        alert(response.data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Error canceling appointment");
      } else {
        alert("Error canceling appointment");
      }
    } finally {
      setCancelingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return dateString;
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Appointments</h1>
          <p className="text-gray-600 mt-2">
            Manage and view all patient appointments
          </p>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No appointments found
            </h3>
            <p className="mt-1 text-gray-500">
              There are no appointments scheduled at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const isCanceled = appointment.canceled;
              
              return (
                <div
                  key={appointment._id}
                  className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${
                    isCanceled ? "opacity-60" : ""
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">
                          ID:
                        </span>
                        <span className="text-sm font-mono text-gray-900">
                          {appointment._id.slice(-8)}
                        </span>
                        {isCanceled && (
                          <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                            Canceled
                          </span>
                        )}
                        {appointment.isCompleted && (
                          <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                            Completed
                          </span>
                        )}
                        {appointment.payment && (
                          <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                            Paid
                          </span>
                        )}
                      </div>

                      {!isCanceled && !appointment.isCompleted && (
                        <button
                          onClick={() => handleCancel(appointment._id)}
                          disabled={cancelingId === appointment._id}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {cancelingId === appointment._id
                            ? "Canceling..."
                            : "Cancel Appointment"}
                        </button>
                      )}
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {appointment.userData.image ? (
                            <Image
                              src={appointment.userData.image}
                              alt={appointment.userData.name}
                              width={64}
                              height={64}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-xl font-semibold text-indigo-600">
                                {appointment.userData.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )} 
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-500 mb-1">
                            Patient
                          </h3>
                          <p className="text-lg font-semibold text-gray-900">
                            {appointment.userData.name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            ID: {appointment.userId.slice(-8)}
                          </p>
                          {appointment.userData.email && (
                            <p className="text-sm text-gray-600">
                              {appointment.userData.email}
                            </p>
                          )}
                          {appointment.userData.phone && (
                            <p className="text-sm text-gray-600">
                              {appointment.userData.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <Image
                            src={appointment.docData.image}
                            alt={appointment.docData.name}
                            width={64}
                            height={64}
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-500 mb-1">
                            Doctor
                          </h3>
                          <p className="text-lg font-semibold text-gray-900">
                            {appointment.docData.name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            ID: {appointment.docId.slice(-8)}
                          </p>
                          <p className="text-sm text-indigo-600 font-medium">
                            {appointment.docData.speciality}
                          </p>
                          <p className="text-sm text-gray-600">
                            {appointment.docData.degree}
                          </p>
                          <p className="text-sm text-gray-600">
                            Experience: {appointment.docData.experience}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Date
                          </p>
                          <p className="text-sm text-gray-900 mt-1 font-medium">
                            {formatDate(appointment.slotTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Time
                          </p>
                          <p className="text-sm text-gray-900 mt-1 font-medium">
                            {formatTime(appointment.slotDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Consultation Fees
                          </p>
                          <p className="text-sm text-gray-900 mt-1 font-medium">
                            ${appointment.amount}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Booked On
                          </p>
                          <p className="text-sm text-gray-900 mt-1">
                            {new Date(appointment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
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