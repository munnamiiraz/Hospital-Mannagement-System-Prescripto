"use client";
import React from 'react';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import { assets as rawAssets } from '../../assets/assets_frontend/assets';

const assets = rawAssets as any;

const Banner: React.FC = () => {
  const router = useRouter();

  const handleCreateAccount = () => {
    router.push("/login");
    window.scrollTo(0, 0);
  };

  return (
    <div className='flex bg-primary rounded-lg px-8 sm:px-10 md:px-14 lg:px-20 my-20 mx-5 sm:mx-[5vw] md:mx-[7vw] lg:mx-[11vw]'>
      {/* Left side */}
      <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5'>
        <div className='text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-white'>
          <p>Book Appointment</p>
          <p className='mt-4'>With 100+ Trusted Doctors</p>
        </div>
        <button 
          onClick={handleCreateAccount}
          className='bg-white text-md font-bolder sm:text-base text-gray-600 px-8 py-3 rounded-full mt-6 hover:scale-105 transition-all duration-300'
        >
          Create Account
        </button>
      </div>

      {/* Right side */}
      <div className='hidden md:block md:w-1/2 lg:w-[370px] relative'>
        <Image
          className='w-full absolute bottom-0 right-0 max-w-md object-contain' 
          src={assets.appointment_img as string | StaticImageData} 
          alt="Doctor appointment illustration"
          width={370}
          height={400}
          priority
        />
      </div>
    </div>
  );
};

export default Banner;