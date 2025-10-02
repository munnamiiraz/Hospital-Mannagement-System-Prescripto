"use client";
import React from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import { specialityData } from '../../assets/assets_frontend/assets';

interface SpecialityItem {
  speciality: string;
  image: string | StaticImageData;
}

const SpecialityMenu: React.FC = () => {
  const handleSpecialityClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className='flex flex-col items-center justify-center gap-4 py-16 text-gray-800 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]' id="speciality">
      <h1 className='text-3xl font-medium'>Find by Speciality</h1>
      <p className='sm:w-1/3 text-center text-sm text-gray-600'>
        Browse through our extensive list of trusted doctors, schedule your appointment hassle-free
      </p>
      <div className='flex sm:justify-center gap-4 pt-5 w-full overflow-scroll px-4 sm:px-0'>
        {specialityData.map((item: SpecialityItem, index: number) => (
          <Link 
            onClick={handleSpecialityClick}
            className='flex flex-col items-center text-lg cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500' 
            key={index} 
            href={`/doctors/${item.speciality}`}
          >
            <Image
              className='w-16 sm:w-24 mb-2' 
              src={item.image as string | StaticImageData} 
              alt={item.speciality}
              width={96}
              height={96}
            />
            <p className='text-center text-sm font-medium'>{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;