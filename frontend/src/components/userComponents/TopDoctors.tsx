"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image, { StaticImageData } from "next/image";
import axios from "axios";

type Doctor = {
  _id?: string;
  id?: string;
  name?: string;
  specialization?: string;
  image?: string | StaticImageData;
};

const TopDoctors: React.FC = () => {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_BACKEND_URL : undefined;

  const fetchDoctors = async () => {
    if (!backendUrl) {
      setError("Missing backend URL (NEXT_PUBLIC_BACKEND_URL)");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If your API requires auth, add Authorization header here
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await axios.get(`${backendUrl}/api/doctors`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      // Support different response shapes: { doctors: [...] } or [...]
      const payload = res.data;
      const list: Doctor[] = Array.isArray(payload)
        ? payload
        : payload?.doctors || payload?.data || [];

      setDoctors(list);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      setError("Failed to load doctors. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDoctorClick = (doctorId: string | undefined) => {
    if (doctorId) {
      router.push(`/appointment/${doctorId}`);
      window.scrollTo(0, 0);
    }
  };

  const handleViewMore = () => {
    router.push("/doctors");
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <h1 className="text-3xl font-medium">Top Doctors to Book</h1>
      <p className="sm:w-1/3 text-center text-sm text-gray-600">
        Simply browse through our extensive list of trusted doctors.
      </p>

      <div className="w-full grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {loading
          ? // skeleton loaders
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border border-blue-200 rounded-xl overflow-hidden animate-pulse bg-white h-64"
              >
                <div className="h-40 bg-blue-50 w-full" />
                <div className="p-4">
                  <div className="h-3 bg-gray-200 rounded mb-2 w-24" />
                  <div className="h-4 bg-gray-200 rounded mb-2 w-32" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              </div>
            ))
          : doctors.length === 0
          ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              No doctors found.
            </div>
          )
          : doctors.slice(0, 10).map((doctor: Doctor, index: number) => (
            <div
              onClick={() => handleDoctorClick(doctor._id || doctor.id)}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-6px] transition-all duration-300 shadow-sm hover:shadow-md"
              key={doctor._id || doctor.id || index}
            >
              {doctor.image ? (
                <Image
                  className="bg-blue-50 w-full h-48 object-cover"
                  src={doctor.image as string | StaticImageData}
                  alt={doctor.name || "Doctor"}
                  width={400}
                  height={240}
                />
              ) : (
                <div className="bg-blue-50 w-full h-48 flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}

              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-green-500 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <p>Available</p>
                </div>
                <p className="text-gray-900 text-lg font-medium mb-1">
                  {doctor.name || "Doctor Name"}
                </p>
                <p className="text-gray-600 text-sm">
                  {doctor.specialization || "Specialization"}
                </p>
              </div>
            </div>
          ))}
      </div>

      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

      <button
        onClick={handleViewMore}
        className="bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10 hover:scale-105 transition-all duration-300 hover:bg-blue-100"
      >
        View More Doctors
      </button>
    </div>
  );
};

export default TopDoctors;
