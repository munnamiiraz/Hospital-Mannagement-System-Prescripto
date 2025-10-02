"use client"

import React, { useState, ChangeEvent, FormEvent } from 'react';
import toast from "react-hot-toast";

import axios from "axios";

interface DoctorFormData {
  name: string;
  email: string;
  password: string;
  experience: string;
  fees: string;
  about: string;
  speciality: string;
  degree: string;
  address: string;
}

const PlaceholderIcon = () => (
  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const AddDoctor: React.FC = () => {
  const [token, setToken] = useState<string>("");
  const [docImgFile, setDocImgFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<DoctorFormData>({
    name: "",
    email: "",
    password: "",
    experience: "1 Year",
    fees: "",
    about: "",
    speciality: "General Physician",
    degree: "",
    address: ""
  });

  React.useEffect(() => {
    const storedToken = localStorage.getItem("aToken") || "";
    setToken(storedToken);
  }, []);

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      if (!formData.name || !formData.email || !formData.password || !formData.fees || 
          !formData.about || !formData.degree || !formData.address) {
        toast.error("All fields are required");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }

      if (!docImgFile) {
        toast.error("Doctor image is required");
        return;
      }

      //form data
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      
      submitData.append("image", docImgFile);
      
      console.log("Submitting doctor data...");
      console.log("Image file:", docImgFile.name, docImgFile.size, "bytes");

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000'}/api/admin/add-doctors`,
        submitData,
        { 
          headers: { 
            token,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      console.log("Response:", response.data);
      
      if (response.data?.success) {
        toast.success("Doctor added successfully");
        
        // Reset form
        setDocImgFile(null);
        setFormData({
          name: "",
          email: "",
          password: "",
          experience: "1 Year",
          fees: "",
          about: "",
          speciality: "General Physician",
          degree: "",
          address: ""
        });
      } else {
        toast.error(response.data?.message ?? "Failed to add doctor");
      }
    } catch (error) {
      console.error("Add doctor error:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to add doctor");
      } else {
        toast.error("Failed to add doctor");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      setDocImgFile(file);
    }
  };

  const handleInputChange = (field: keyof DoctorFormData) => 
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    };

  return (
    <form onSubmit={onSubmitHandler} className='m-5 w-full'>
      
      <p className='mb-3 text-2xl font-semibold text-gray-800'>Add Doctor</p>
      <div className='bg-white px-8 py-8 border border-gray-200 rounded-lg shadow-sm w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
        
        {/* Image Upload Section */}
        <div className='flex items-center gap-6 mb-8'>
          <label htmlFor="doc-img" className="cursor-pointer group">
            <div className="relative">
              {docImgFile ? (
                <img 
                  className='w-24 h-24 bg-gray-100 rounded-full object-cover ring-4 ring-indigo-100 group-hover:ring-indigo-200 transition-all' 
                  src={URL.createObjectURL(docImgFile)} 
                  alt="Doctor preview"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center ring-4 ring-gray-100 group-hover:ring-gray-200 transition-all">
                  <PlaceholderIcon />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </label>
          <input 
            onChange={handleImageChange}
            type="file" 
            id="doc-img" 
            accept="image/*"
            hidden
          />
          <div>
            <p className="font-medium text-gray-700">Upload doctor picture</p>
            <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF (max 5MB)</p>
            {docImgFile && (
              <p className="text-sm text-green-600 mt-1">✓ {docImgFile.name}</p>
            )}
          </div>
        </div>
        
        <div className='flex flex-col lg:flex-row text-gray-700 items-start gap-10'>
          {/* Left Column */}
          <div className='w-full lg:flex-1 flex flex-col gap-5'>
            <div className='flex flex-col gap-2'>
              <label className="font-medium">Doctor name <span className="text-red-500">*</span></label>
              <input 
                onChange={handleInputChange('name')} 
                value={formData.name} 
                className='border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all' 
                type="text" 
                placeholder='Dr. John Doe' 
                required
              />
            </div>
            
            <div className='flex flex-col gap-2'>
              <label className="font-medium">Doctor email <span className="text-red-500">*</span></label>
              <input 
                onChange={handleInputChange('email')} 
                value={formData.email} 
                className='border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all' 
                type="email" 
                placeholder='doctor@example.com' 
                required
              />
            </div>
            
            <div className='flex flex-col gap-2'>
              <label className="font-medium">Password <span className="text-red-500">*</span></label>
              <input 
                onChange={handleInputChange('password')} 
                value={formData.password} 
                className='border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all' 
                type="password" 
                placeholder='Min 8 characters' 
                required
              />
            </div>
            
            <div className='flex flex-col gap-2'>
              <label className="font-medium">Experience</label>
              <select 
                onChange={handleInputChange('experience')} 
                value={formData.experience} 
                className='border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white'
              >
                <option value="1 Year">1 Year</option>
                <option value="2 Years">2 Years</option>
                <option value="3 Years">3 Years</option>
                <option value="4 Years">4 Years</option>
                <option value="5 Years">5 Years</option>
                <option value="6 Years">6 Years</option>
                <option value="7 Years">7 Years</option>
                <option value="8 Years">8 Years</option>
                <option value="9 Years">9 Years</option>
                <option value="10+ Years">10+ Years</option>
              </select>
            </div>
            
            <div className='flex flex-col gap-2'>
              <label className="font-medium">Consultation Fees <span className="text-red-500">*</span></label>
              <input 
                onChange={handleInputChange('fees')} 
                value={formData.fees} 
                className='border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all' 
                type="number" 
                placeholder='500' 
                min="0"
                required
              />
            </div>
          </div>
          
          {/* Right Column */}
          <div className='w-full lg:flex-1 flex flex-col gap-5'>
            <div className='flex flex-col gap-2'>
              <label className="font-medium">Speciality</label>
              <select 
                onChange={handleInputChange('speciality')} 
                value={formData.speciality} 
                className='border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white'
              >
                <option value="General Physician">General Physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Orthopedic">Orthopedic</option>
              </select>
            </div>

            <div className='flex flex-col gap-2'>
              <label className="font-medium">Education <span className="text-red-500">*</span></label>
              <input 
                onChange={handleInputChange('degree')} 
                value={formData.degree} 
                className='border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all' 
                type="text" 
                placeholder='MBBS, MD' 
                required
              />
            </div>
            
            <div className='flex flex-col gap-2'>
              <label className="font-medium">Address <span className="text-red-500">*</span></label>
              <input 
                onChange={handleInputChange('address')} 
                value={formData.address} 
                className='border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all' 
                type="text" 
                placeholder='123 Medical Center, City' 
                required
              />
            </div>
          </div>
        </div>
        
        {/* About Section */}
        <div className="mt-6">
          <label className="block font-medium text-gray-700 mb-2">
            About Doctor <span className="text-red-500">*</span>
          </label>
          <textarea 
            onChange={handleInputChange('about')} 
            value={formData.about} 
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none' 
            placeholder='Brief description about the doctor, specializations, and experience...' 
            rows={5} 
            required
          />
        </div>
        
        {/* Submit Button */}
        <button 
          type='submit' 
          disabled={submitting}
          className='bg-indigo-600 hover:bg-indigo-700 px-8 py-3 mt-6 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center gap-2'
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding Doctor...
            </>
          ) : (
            "Add Doctor"
          )}
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;