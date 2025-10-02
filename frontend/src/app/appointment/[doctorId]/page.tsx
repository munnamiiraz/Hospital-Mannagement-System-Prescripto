"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";

type AvailableSlot = {
  date: string;
  time: string;
};

type BookedSlot = {
  date: string;
  time: string;
  patientId: string;
  patientName: string;
};

type Doctor = {
  _id: string;
  name: string;
  email: string;
  speciality?: string;
  image?: string;
  degree?: string;
  experience?: string;
  about?: string;
  fees?: number;
  available?: boolean;
  address?: string,
  slots_available: AvailableSlot[];
  slots_booked: BookedSlot[];
};

type GroupedSlots = {
  [date: string]: {
    available: string[];
    booked: string[];
  };
};

export default function AppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params?.doctorId as string;

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000";

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [groupedSlots, setGroupedSlots] = useState<GroupedSlots>({});
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // Fetch doctor details
  useEffect(() => {
    if (!doctorId) return;

    const controller = new AbortController();

    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API_BASE}/api/user/doctor/${doctorId}`, {
          signal: controller.signal,
        });

        const doctorData = res.data?.data ?? res.data;
        setDoctor(doctorData);

        // Process slots
        processSlots(doctorData);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED")
          return;
        console.error("Failed to fetch doctor:", err);
        setError(
          err?.response?.data?.message ??
            err?.message ??
            "Failed to fetch doctor details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();

    return () => {
      controller.abort();
    };
  }, [doctorId, API_BASE]);

  const processSlots = (doctorData: Doctor) => {
    const grouped: GroupedSlots = {};

    // Group available slots by date
    doctorData.slots_available?.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = { available: [], booked: [] };
      }
      grouped[slot.date].available.push(slot.time);
    });

    // Group booked slots by date
    doctorData.slots_booked?.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = { available: [], booked: [] };
      }
      grouped[slot.date].booked.push(slot.time);
    });

    // Remove booked times from available
    Object.keys(grouped).forEach((date) => {
      grouped[date].available = grouped[date].available.filter(
        (time) => !grouped[date].booked.includes(time)
      );
    });

    setGroupedSlots(grouped);
    setAvailableDates(Object.keys(grouped).sort());
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select both date and time");
      return;
    }

    try {
      setBookingLoading(true);

      console.log(doctorId, selectedDate, selectedTime);
      
      const res = await axios.post(`${API_BASE}/api/user/book-appointment`, {
        doctorId: doctorId,
        slotDate: selectedDate,
        slotTime: selectedTime,
      }, {headers: {token: localStorage.getItem("token")}});

      console.log("Booking response:", res.data);
      setBookingSuccess(true);

      // Refresh doctor data
      const updatedRes = await axios.get(
        `${API_BASE}/api/user/doctor/${doctorId}`
      );
      const updatedDoctor = updatedRes.data?.data ?? updatedRes.data;
      setDoctor(updatedDoctor);
      processSlots(updatedDoctor);

      // Reset selection
      setSelectedTime("");

      setTimeout(() => {
        setBookingSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Failed to book appointment:", err);
      alert(
        err?.response?.data?.message ?? "Failed to book appointment. Try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      full: `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading doctor details...</div>
      </div>
    );
  }

  if (doctor?.available === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Cant take an appointment, doctor has been disabled by authority</div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-lg text-red-500">
          Error: {error || "Doctor not found"}
        </div>
        <button
          onClick={() => router.push("/doctors")}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Back to Doctors
        </button>
      </div>
    );
  }

  const currentDateSlots = selectedDate ? groupedSlots[selectedDate] : null;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Success Message */}
      {bookingSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ✓ Appointment booked successfully!
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-4 text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
      >
        ← Back to Doctors
      </button>

      {/* Doctor Details Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Doctor Image */}
          <div className="relative w-full md:w-48 h-48 bg-indigo-50 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={doctor.image ?? "/placeholder.png"}
              alt={doctor.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 192px"
            />
          </div>

          {/* Doctor Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {doctor.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  {doctor.degree} - {doctor.speciality}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    {doctor.experience} experience
                  </span>
                  {doctor.available && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      Available
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {doctor.about ??
                  "Experienced medical professional dedicated to providing quality healthcare."}
              </p>
            </div>

            {/* Appointment Fee */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-gray-600">Appointment fee:</span>
              <span className="text-xl font-bold text-gray-900">
                ${doctor.fees ?? 50}
              </span>
            </div>

            {/* Address */}
            {doctor.address && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                <p className="text-gray-600 text-sm">
                  {doctor.address}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Slots Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Booking Slots
        </h2>

        {availableDates.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg mb-2">No slots available</p>
            <p className="text-sm">
              This doctor hasn't set up any available time slots yet.
            </p>
          </div>
        ) : (
          <>
            {/* Date Selection */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Select Date
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {availableDates.map((dateStr) => {
                  const formatted = formatDate(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const availableCount = groupedSlots[dateStr]?.available.length || 0;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setSelectedTime("");
                      }}
                      disabled={availableCount === 0}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-lg border-2 transition-all ${
                        availableCount === 0
                          ? "opacity-50 cursor-not-allowed border-gray-200"
                          : isSelected
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xs text-gray-500">
                        {formatted.day}
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatted.date}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatted.month}
                      </span>
                      {availableCount > 0 ? (
                        <span className="text-xs text-green-600 mt-1">
                          {availableCount} slots
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 mt-1">Full</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && currentDateSlots && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Available Time Slots for {formatDate(selectedDate).full}
                </h3>

                {currentDateSlots.available.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    All slots are booked for this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {currentDateSlots.available.map((time) => {
                      const isSelected = selectedTime === time;

                      return (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-300"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={handleBookAppointment}
              disabled={!selectedDate || !selectedTime || bookingLoading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                !selectedDate || !selectedTime || bookingLoading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {bookingLoading ? "Booking..." : "Book Appointment"}
            </button>
          </>
        )}
      </div>

      {/* Related Doctors Section */}
      {doctor.speciality && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Related Doctors
          </h2>
          <button
            onClick={() => router.push(`/doctors/${doctor.speciality}`)}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all {doctor.speciality} →
          </button>
        </div>
      )}
    </div>
  );
}