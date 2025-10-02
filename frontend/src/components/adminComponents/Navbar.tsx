"use client"
import React from 'react';
import { assets } from "../../assets/assets_admin/assets";
import { useRouter } from 'next/navigation';

// Type definitions for Redux state
interface AdminState {
  aToken: string;
}

interface RootState {
  admin: AdminState;
}

const Navbar: React.FC = () => {
  const router = useRouter();

  const aToken = localStorage.getItem("aToken")

  const logout = (): void => {
    console.log("i am here");
    
    try {
      localStorage.removeItem("aToken");
    } catch (err) {
      console.error("localStorage remove error:", err);
    }


    router.push("/");
  };

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white shadow-md'>
      <div className='flex items-center gap-2 text-sm'>
        <img 
          className='w-36 sm:w-40 cursor:pointer' 
          src={assets.people_icon} 
          alt="Admin Logo" 
        />
        <p className='text-gray-600 border px-2.5 py-1 rounded-full border-gray-600'>
          {aToken ? "Admin" : "Doctor"}
        </p>
        <button 
          onClick={logout} 
          className='bg-primary text-sm px-10 py-2 rounded-full hover:text-gray-800 text-white'
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;