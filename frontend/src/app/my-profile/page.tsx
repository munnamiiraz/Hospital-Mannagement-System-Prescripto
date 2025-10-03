"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

interface UserData {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  avatar?: {
    url: string;
    publicId: string;
  };
}

export default function MyProfile() {
  const router = useRouter();
  const [token, setToken] = useState<string | null | undefined>(undefined); // undefined = not loaded yet
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "Male",
    dob: "",
  });

  // Get token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // Fetch user profile data
  const getUserProfile = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/user/get-profile",
        { headers: { token } }
      );

      

      if (response.data.success) {
        const data = response.data.data;
        setUserData(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          gender: data.gender || "Male",
          dob: data.dob || "",
          avatar: data.avatar
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        router.push("/login");
      } else {
        toast.error("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load profile when token is available
  useEffect(() => {
    if (token === undefined) {
      return;
    }
    
    if (token) {
      getUserProfile();
    } else {
      router.push("/login");
    }
  }, [token]);

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };


  const updateUserProfileData = async () => {
  try {
    setUploading(true);

    // FormData 
    const data = new FormData();

    if (formData.name) data.append("name", formData.name);
    if (formData.phone) data.append("phone", formData.phone);
    if (formData.address) data.append("address", formData.address);
    if (formData.gender) data.append("gender", formData.gender);
    if (formData.dob) data.append("dob", formData.dob);

    if (image) {
      data.append("avatar", image);
    }

    if ([...data.keys()].length === 0) {
      toast.error("Please provide at least one field to update");
      return;
    }

    const response = await axios.put(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/api/user/update-profile",
      data,
      {
        headers: {
          token,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.success) {
      toast.success("Profile updated successfully");
      setIsEdit(false);
      setImage(null);
      await getUserProfile();
    } else {
      toast.error(response.data.message);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    if (axios.isAxiosError(error)) {
      toast.error(error.response?.data?.message || "Error updating profile");
    } else {
      toast.error("Error updating profile");
    }
  } finally {
    setUploading(false);
  }
};



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No profile data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster
        position="top-right"
        reverseOrder={false}
      />


      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center md:items-start">
              {isEdit ? (
                <label htmlFor="image" className="cursor-pointer group">
                  <div className="relative">
                    <img
                      className="w-40 h-40 rounded-full object-cover ring-4 ring-indigo-100 group-hover:ring-indigo-200 transition-all"
                      src={
                        image
                          ? URL.createObjectURL(image)
                          : formData.avatar?.url || "/placeholder-avatar.png"
                      }
                      alt="Profile"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Click to change photo
                  </p>
                  <input
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    type="file"
                    id="image"
                    accept="image/*"
                    hidden
                  />
                </label>
              ) : (
                <div>
                  <img
                    className="w-40 h-40 rounded-full object-cover ring-4 ring-gray-100"
                    src={formData.avatar?.url || "/placeholder-avatar.png"}
                    alt="Profile"
                  />
                </div>
              )}
            </div>

            {/* Profile Information Section */}
            <div className="flex-1">
              {/* Name Section */}
              <div className="mb-6">
                {isEdit ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg font-medium"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter your name"
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {formData.name}
                    </h2>
                    <p className="text-indigo-600 mt-1">{formData.email}</p>
                  </div>
                )}
              </div>

              <hr className="my-6 border-gray-200" />

              {/* Contact Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        Phone Number
                      </label>
                      {isEdit ? (
                        <input
                          className="col-span-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                          type="text"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <p className="col-span-2 text-gray-900 py-2">
                          {formData.phone || "Not provided"}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        Address
                      </label>
                      {isEdit ? (
                        <textarea
                          className="col-span-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                          rows={2}
                          value={formData.address}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          placeholder="Enter your address"
                        />
                      ) : (
                        <p className="col-span-2 text-gray-900 py-2">
                          {formData.address || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        Gender
                      </label>
                      {isEdit ? (
                        <select
                          className="col-span-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              gender: e.target.value as "Male" | "Female" | "Other",
                            }))
                          }
                          value={formData.gender}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <p className="col-span-2 text-gray-900 py-2">
                          {formData.gender}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        Date of Birth
                      </label>
                      {isEdit ? (
                        <input
                          className="col-span-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                          type="date"
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, dob: e.target.value }))
                          }
                          value={formData.dob}
                        />
                      ) : (
                        <p className="col-span-2 text-gray-900 py-2">
                          {formData.dob || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3">
                {isEdit ? (
                  <>
                    <button
                      className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={updateUserProfileData}
                      disabled={uploading}
                    >
                      {uploading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50"
                      onClick={() => {
                        setIsEdit(false);
                        setImage(null);
                        setFormData({
                          name: userData.name || "",
                          email: userData.email || "",
                          phone: userData.phone || "",
                          address: userData.address || "",
                          gender: userData.gender || "Male",
                          dob: userData.dob || "",
                          avatar: userData.avatar
                        });
                      }}
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                    onClick={() => setIsEdit(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}