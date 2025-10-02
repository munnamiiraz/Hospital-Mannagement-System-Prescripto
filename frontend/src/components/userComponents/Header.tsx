"use client";

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import { assets as rawAssets } from '../../assets/assets_frontend/assets';


const assets = rawAssets as any;

const Header: React.FC = () => {
  const handleBookAppointment = () => {
    const specialitySection = document.getElementById('speciality');
    if (specialitySection) {
      specialitySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className='flex md:flex-row flex-wrap bg-primary rounded-lg px-6 md:px-10 lg:px-40'>
      {/* Left side */}
      <div className='md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]'>
        <p className='text-3xl md:text-4xl lg:text-4xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight'>
          Book Appointment <br /> with Trusted Doctors
        </p>
        <div className='flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light'>
          <Image 
            className='w-28' 
            src={assets.group_profiles as string | StaticImageData} 
            alt="Group of doctor profiles"
            width={112}
            height={40}
          />
          <p>
            Simply browse through our extensive list of trusted doctors, <br className='hidden sm:block' /> schedule your appointment hassle-free
          </p>
        </div>
        <button 
          className='flex w-[205px] items-center gap-2 bg-white px-8 py-3 rounded-full text-gray-600 text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300 cursor-pointer' 
          onClick={handleBookAppointment}
        >
          Book Appointment 
          <Image 
            className='w-3' 
            src={assets.arrow_icon as string | StaticImageData}
            alt="Arrow icon"
            width={12}
            height={12}
          />
        </button>
      </div>

      {/* Right side */}
      <div className='md:w-1/2 relative'>
        <Image 
          className='w-full md:absolute bottom-0 h-auto rounded-lg object-contain' 
          src={assets.header_img as string | StaticImageData} 
          alt="Medical professionals header illustration"
          width={600}
          height={400}
          priority
        />
      </div>
    </div>
  );
};

export default Header;