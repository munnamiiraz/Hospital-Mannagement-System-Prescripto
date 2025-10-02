"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Image, { StaticImageData } from 'next/image';
import { useAppSelector } from '../../store/userStore/hooks';
import type { Doctor } from '../../store/userStore/slices/doctorSlice';

const TopDoctors: React.FC = () => {
  const router = useRouter();
  const { doctors } = useAppSelector((state) => state.doctors);

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
    <div className='flex flex-col items-center gap-4 my-16 text-gray-900 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>
      <p className='sm:w-1/3 text-center text-sm text-gray-600'>
        Simply browse through our extensive list of trusted doctors.
      </p>
      <div className='w-full grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
        {doctors.slice(0, 10).map((doctor: Doctor, index: number) => (
          <div 
            onClick={() => handleDoctorClick(doctor.id)} 
            className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500 shadow-sm hover:shadow-md' 
            key={doctor.id || index}
          >
            {doctor.image && (
              <Image
                className='bg-blue-50 w-full h-48 object-cover' 
                src={doctor.image as string | StaticImageData} 
                alt={doctor.name || 'Doctor'} 
                width={300}
                height={200}
              />
            )}
            <div className='p-4'>
              <div className='flex items-center gap-2 text-sm text-green-500 mb-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <p>Available</p>
              </div>
              <p className='text-gray-900 text-lg font-medium mb-1'>
                {doctor.name || 'Doctor Name'}
              </p>
              <p className='text-gray-600 text-sm'>
                {doctor.specialization || 'Specialization'}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button 
        onClick={handleViewMore} 
        className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10 hover:scale-105 transition-all duration-300 hover:bg-blue-100'
      >
        View More Doctors
      </button>
    </div>
  );
};

export default TopDoctors;