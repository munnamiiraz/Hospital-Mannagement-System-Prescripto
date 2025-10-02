"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
}

interface Complaint {
  _id: string;
  userId: string;
  userData?: UserData;
  name?: string;
  content: string;
  status: "pending" | "resolved" | "in-progress";
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  statusCode: number;
  data: Complaint[];
  message: string;
  success: boolean;
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("aToken");
      
      const response = await axios.get<ApiResponse>(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/admin/get-complains",
        { headers: { token } }
      );
      console.log("data is: ", response.data);
      
      if (response.data.success) {
        setComplaints([...response.data.data].reverse());

      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        alert("Session expired. Please login again.");
        window.location.href = "/admin/login";
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!selectedComplaint || !feedback.trim()) {
      alert("Please enter a feedback message");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("aToken");
      
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/admin/complaint-feedback",
        {
          complaintId: selectedComplaint._id,
          adminResponse: feedback,
          status: "resolved"
        },
        { headers: { token } }
      );

      if (response.data.success) {
        await fetchComplaints();
        setFeedback("");
        setShowModal(false);
        setSelectedComplaint(null);
        alert("Feedback sent successfully!");
      } else {
        alert(response.data.message || "Failed to send feedback");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Error sending feedback");
      } else {
        alert("Error sending feedback");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openFeedbackModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setFeedback(complaint.adminResponse || "");
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  // get user name
  const getUserName = (complaint: Complaint): string => {
    return complaint.userData?.name || complaint.name || "Anonymous User";
  };

  // get user email
  const getUserEmail = (complaint: Complaint): string => {
    return complaint.userData?.email || "No email provided";
  };

  // get user phone
  const getUserPhone = (complaint: Complaint): string | null => {
    return complaint.userData?.phone || null;
  };

  // get initials
  const getInitials = (name: string): string => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name?.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Complaints</h1>
          <p className="text-gray-600 mt-2">
            Review and respond to user complaints
          </p>
        </div>

        {complaints.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No complaints found
            </h3>
            <p className="mt-1 text-gray-500">
              There are no user complaints at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => {
              const userName = getUserName(complaint);
              const userEmail = getUserEmail(complaint);
              const userPhone = getUserPhone(complaint);

              return (
                <div
                  key={complaint._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">
                          ID:
                        </span>
                        <span className="text-sm font-mono text-gray-900">
                          {complaint._id.slice(-8)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            complaint.status
                          )}`}
                        >
                          {complaint?.status?.charAt(0).toUpperCase() +
                            complaint?.status?.slice(1)}
                        </span>
                      </div>

                      {complaint.status !== "resolved" && (
                        <button
                          onClick={() => openFeedbackModal(complaint)}
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                        >
                          Send Feedback
                        </button>
                      )}
                    </div>

                    <div className="mt-6 flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {complaint.userData?.image ? (
                          <img
                            src={complaint.userData.image}
                            alt={userName}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-xl font-semibold text-indigo-600">
                              {getInitials(userName)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {userName}
                          </h3>
                          <span className="text-sm text-gray-500">
                            • {userEmail}
                          </span>
                        </div>
                        {userPhone && (
                          <p className="text-sm text-gray-600 mb-3">
                            Phone: {userPhone}
                          </p>
                        )}

                        <div className="bg-gray-50 rounded-lg p-4 mt-3">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {complaint.content}
                          </p>
                        </div>

                        {complaint.adminResponse && (
                          <div className="bg-indigo-50 rounded-lg p-4 mt-3 border-l-4 border-indigo-500">
                            <h4 className="text-sm font-semibold text-indigo-900 mb-2">
                              Admin Response:
                            </h4>
                            <p className="text-sm text-indigo-800 leading-relaxed">
                              {complaint.adminResponse}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                          <span>
                            Submitted:{" "}
                            {new Date(complaint.createdAt).toLocaleDateString(
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
                          {complaint.updatedAt !== complaint.createdAt && (
                            <span>
                              Updated:{" "}
                              {new Date(complaint.updatedAt).toLocaleDateString(
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
                          )}
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

      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Send Feedback
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedComplaint(null);
                    setFeedback("");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  User:
                </h3>
                <p className="text-gray-900">{getUserName(selectedComplaint)}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Complaint:
                </h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedComplaint.content}
                </p>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="feedback"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Response:
                </label>
                <textarea
                  id="feedback"
                  rows={6}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSendFeedback}
                  disabled={submitting || !feedback.trim()}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Sending..." : "Send Feedback"}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedComplaint(null);
                    setFeedback("");
                  }}
                  className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}