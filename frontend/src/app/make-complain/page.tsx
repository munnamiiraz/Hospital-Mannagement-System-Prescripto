'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios, { AxiosResponse } from 'axios';
import { Send, MessageSquare, User, Clock, Loader, X } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Types
interface Avatar {
  url: string;
  publicId: string;
}

interface Complaint {
  _id: string;
  name: string;
  avatar?: Avatar;
  content: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  content: string;
  avatar: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

const ComplaintPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'complain' | 'feedback'>('complain');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    content: '',
    avatar: ''
  });

  // Get token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    console.log('token from make complain page', storedToken);
  }, []);

  // Fetch complaints with feedback
  const fetchComplaints = async (): Promise<void> => {
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    try {
      setLoading(true);
      const response: AxiosResponse<ApiResponse> = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND_URL + '/api/user/get-complains',
        { headers: {token} }
      );
      console.log(response);
      
      if (response.data.success) {
        setComplaints([...response.data.data].reverse() || []);
      }


    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      toast.error(error.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchComplaints();
    }
  }, [token]);

  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  // Remove avatar
  const removeAvatar = (): void => {
    setAvatarFile(null);
    setAvatarPreview('');
    setFormData(prev => ({ ...prev, avatar: '' }));
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Submit complaint
  const handleSubmitComplaint = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Name and content are required');
      return;
    }

    try {
      setSubmitLoading(true);
      
      // Prepare JSON data
      const submitData = {
        name: formData.name.trim(),
        content: formData.content.trim(),
        avatar: formData.avatar || undefined
      };

      console.log('Submitting complaint:', { ...submitData, avatar: submitData.avatar ? 'base64_string' : 'none' });

      const response: AxiosResponse<ApiResponse> = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + '/api/user/make-complain',
        submitData,
        {
          headers: {
            'token': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Complaint submitted successfully!');
        setFormData({ name: '', content: '', avatar: '' });
        setAvatarFile(null);
        setAvatarPreview('');
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Refresh complaints list
        await fetchComplaints();
        
        // Switch to feedback tab
        setTimeout(() => {
          setActiveTab('feedback');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error submitting complaint:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="min-h-screen bg-gray-50">

        {/* Tab Navigation */}
        <div className="px-6 py-4">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  type="button"
                  onClick={() => setActiveTab('complain')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === 'complain'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Send className="inline-block mr-2" size={16} />
                  Submit Complaint
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('feedback')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === 'feedback'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <MessageSquare className="inline-block mr-2" size={16} />
                  View Complaints ({complaints.length})
                </button>
              </nav>
            </div>

            {/* Complaint Form Tab */}
            {activeTab === 'complain' && (
              <div className="p-6">
                <form onSubmit={handleSubmitComplaint} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div>
                      {avatarPreview && (
                        <div className="mt-2 relative inline-block">
                          <img 
                            src={avatarPreview} 
                            alt="Preview" 
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={removeAvatar}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complaint Details *
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder="Please describe your complaint in detail..."
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitLoading ? (
                        <>
                          <Loader className="animate-spin" size={16} />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Submit Complaint
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Your Complaints</h3>
                  <p className="text-sm text-gray-600">Track the status and responses to your submitted complaints</p>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader className="animate-spin text-blue-600" size={24} />
                    <span className="ml-3 text-gray-600">Loading complaints...</span>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
                    <p className="text-gray-500">Submit your first complaint to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.reverse().map((complaint) => (
                      <div key={complaint._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              {complaint.avatar?.url ? (
                                <img
                                  src={complaint.avatar.url}
                                  alt={complaint.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-sm font-medium text-gray-900">{complaint.name}</h4>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock size={12} />
                                {formatDate(complaint.createdAt)}
                              </div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                ID: {complaint._id.slice(-8)}
                              </span>
                            </div>
                            
                            <div className="bg-gray-50 rounded-md p-3 mb-3">
                              <p className="text-sm text-gray-700 leading-relaxed">{complaint.content}</p>
                            </div>

                            {complaint.feedback ? (
                              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <User size={14} className="text-blue-600" />
                                  <span className="text-sm font-medium text-blue-900">Admin Response:</span>
                                </div>
                                <p className="text-sm text-blue-800">{complaint.feedback}</p>
                              </div>
                            ) : (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <div className="flex items-center gap-2 text-yellow-700">
                                  <Clock size={14} />
                                  <span className="text-sm font-medium">Pending Response</span>
                                </div>
                                <p className="text-xs text-yellow-600 mt-1">Your complaint is being reviewed by our admin team</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ComplaintPage;