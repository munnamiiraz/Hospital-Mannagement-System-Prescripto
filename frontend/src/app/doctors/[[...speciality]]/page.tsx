"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";

const specialities = [
  "General Physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist",
] as const;

type Speciality = (typeof specialities)[number];

type Doctor = {
  _id: string;
  name: string;
  speciality?: string;
  image?: string;
};

export default function DoctorsPage() {
  const router = useRouter();
  const params = useParams();
  
  const specialityParam = params?.speciality as string[] | undefined;
  const speciality = specialityParam?.[0] || null;
  
  console.log("Speciality from URL:", speciality);

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000";

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API_BASE}/api/user/all-doctors`, {
          signal: controller.signal,
        });

        const payload: Doctor[] = res.data?.data ?? res.data ?? [];
        setDoctors(Array.isArray(payload) ? payload : []);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
        console.error("Failed to fetch doctors:", err);
        setError(
          err?.response?.data?.message ??
            err?.message ??
            "Failed to fetch doctors"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();

    return () => {
      controller.abort();
    };
  }, [API_BASE]);

  useEffect(() => {
    if (!doctors || !Array.isArray(doctors)) {
      setFilteredDoctors([]);
      return;
    }

    const filtered = speciality
      ? doctors.filter((doc) => doc.speciality === speciality)
      : doctors;

    setFilteredDoctors(filtered);
  }, [doctors, speciality]);

  const handleSpecialityClick = (spec: string) => {
    if (speciality === spec) {
      router.push("/doctors");
    } else {
      router.push(`/doctors/${encodeURIComponent(spec)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading doctors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <p className="text-gray-600">Browse through the doctors specialist.</p>

      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        <button
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${
            showFilter ? "bg-primary text-white" : ""
          }`}
          onClick={() => setShowFilter((p) => !p)}
        >
          Filters
        </button>

        {/* SIDEBAR WITH VISUAL INDICATOR */}
        <div
          className={`flex-col gap-3 text-sm text-gray-600 ${
            showFilter ? "flex" : "hidden sm:flex"
          }`}
        >
          {specialities.map((spec) => {
            const isActive = speciality === spec;
            
            return (
              <div
                key={spec}
                onClick={() => handleSpecialityClick(spec)}
                className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer relative ${
                  isActive ? "bg-indigo-100 border-indigo-500 text-black font-medium" : "hover:bg-gray-50"
                }`}
              >
                {/* VISUAL INDICATOR: Checkmark or dot */}
                {isActive && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 font-bold">
                    ✓
                  </span>
                )}
                {spec}
              </div>
            );
          })}
        </div>

        {/* DOCTORS GRID */}
        <div className="w-full">
          {/* Show current filter status */}
          {speciality && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Showing:</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                {speciality}
              </span>
              <button
                onClick={() => router.push("/doctors")}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear filter
              </button>
            </div>
          )}

          {!filteredDoctors || filteredDoctors.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No doctors found {speciality ? `for ${speciality}` : ""}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  onClick={() => router.push(`/appointment/${doctor._id}`)}
                  className="border border-blue-300 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="relative w-full h-48 bg-blue-50">
                    <Image
                      src={doctor.image ?? "/placeholder.png"}
                      alt={doctor.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                      <p>Available</p>
                    </div>
                    <p className="text-gray-900 text-lg font-medium">
                      {doctor.name}
                    </p>
                    <p className="text-gray-600 text-sm">{doctor.speciality}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}