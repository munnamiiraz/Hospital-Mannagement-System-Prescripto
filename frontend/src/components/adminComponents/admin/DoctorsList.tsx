"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Doctor {
  _id: string;
  name: string;
  image?: string;
  speciality?: string;
  available: boolean;
  fees?: number | string | null;
  experience?: string | null;
  email?: string;
  degree?: string;
  address?: string;
  about?: string;
}

const DoctorsList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const getToken = (): string | null => {
    return localStorage.getItem("aToken");
  };

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/admin/all-doctors", {
        headers: { token },
      });
      const data = res.data?.data ?? res.data ?? [];
      setDoctors(data);
      console.log(data);
    } catch (err: any) {
      console.error("Failed to fetch doctors:", err);
      setError(err?.response?.data?.message ?? "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAvailabilityChange = async (docId: string) => {
    const doc = doctors.find((d) => d._id === docId);
    if (!doc) return;

    const newAvailable = !doc.available;
    const token = getToken();

    // Mark as updating
    setUpdatingIds((prev) => new Set(prev).add(docId));

    // Optimistic update
    setDoctors((prev) =>
      prev.map((d) => (d._id === docId ? { ...d, available: newAvailable } : d))
    );

    try {
      const res = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + `/api/admin/change-availablity`,
        { docId, available: newAvailable },
        { headers: { token } }
      );

      console.log("Availability updated:", res.data);
    } catch (err: any) {
      console.error("Failed to update availability:", err);
      alert(err?.response?.data?.message ?? "Failed to update availability");
      
      // Revert on error
      setDoctors((prev) =>
        prev.map((d) => (d._id === docId ? { ...d, available: !newAvailable } : d))
      );
    } finally {
      setUpdatingIds((prev) => {
        const s = new Set(prev);
        s.delete(docId);
        return s;
      });
    }
  };

  if (loading) return <p className="p-4">Loading doctors...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="m-5 max-h-[90vh] overflow-y-auto">
      <h2 className="text-lg font-medium mb-4">All Doctors</h2>

      <div className="w-full flex flex-wrap gap-4">
        {doctors.length > 0 ? (
          doctors.map((doctor) => {
            const isProfileIncomplete =
              !doctor.fees ||
              doctor.fees === null ||
              doctor.fees === "" ||
              !doctor.experience ||
              doctor.experience === null ||
              doctor.experience === "";

            const updating = updatingIds.has(doctor._id);

            return (
              <div
                className="border border-indigo-200 rounded-xl overflow-hidden w-56"
                key={doctor._id}
              >
                <img
                  className="bg-indigo-50 transition-all duration-500 w-full h-32 object-cover"
                  src={doctor.image || "/default-doctor.jpg"}
                  alt={doctor.name}
                />
                <div className="p-4">
                  <p className="text-neutral-800 text-lg font-medium">{doctor.name}</p>
                  <p className="text-zinc-600 text-sm">{doctor.speciality}</p>

                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      id={`available-${doctor._id}`}
                      checked={!!doctor.available}
                      onChange={() => handleAvailabilityChange(doctor._id)}
                      disabled={isProfileIncomplete || updating}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor={`available-${doctor._id}`} className="text-gray-900">
                      {updating ? "Updating..." : doctor.available ? "Available" : "Unavailable"}
                    </label>
                  </div>

                  {isProfileIncomplete && (
                    <p className="text-xs text-red-500 mt-1">
                      * Profile incomplete: Fees & Experience required.
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="p-4">No doctors found.</p>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;