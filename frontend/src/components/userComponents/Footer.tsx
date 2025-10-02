import React from 'react';
import Image, { StaticImageData } from 'next/image';
import { assets as rawAssets } from '../../assets/assets_frontend/assets';

const assets = rawAssets as any;

const Footer: React.FC = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[10vw]'>
      <div className='flex sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        {/* Left section */}
        <div>
          <Image 
            className='mb-5 w-40' 
            src={assets.logo as string | StaticImageData} 
            alt="Prescripto Logo" 
            width={160}
            height={40}
          />
          <p className='w-full md:w-6/7 text-gray-600 leading-6'>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatem fuga voluptates minima sed a perferendis at atque distinctio ipsa, et esse ducimus quaerat voluptas, perspiciatis error voluptatum totam voluptatibus in, quos autem dolor facere laboriosam quis. Placeat dolores laudantium, aliquid officiis maxime reprehenderit, error possimus mollitia, debitis cum quos atque!
          </p>
        </div>

        {/* Middle section */}
        <div>
          <p className='text-xl font-medium mb-5'>Company</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li className='hover:text-gray-800 cursor-pointer transition-colors'>Home</li>
            <li className='hover:text-gray-800 cursor-pointer transition-colors'>About us</li>
            <li className='hover:text-gray-800 cursor-pointer transition-colors'>Contact</li>
            <li className='hover:text-gray-800 cursor-pointer transition-colors'>Privacy Policy</li>
          </ul>
        </div>

        {/* Right section */}
        <div>
          <p className='text-xl font-medium mb-5'>Get in Touch</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li className='hover:text-gray-800 cursor-pointer transition-colors'>+8801787113454</li>
            <li className='hover:text-gray-800 cursor-pointer transition-colors'>munnamiiraz@gmail.com</li>
          </ul>
        </div>
      </div>

      <div>
        {/* Copyright */}
        <hr className='border-gray-300' />
        <p className='p-5 text-sm text-center text-gray-600'>
          © Copyright 2025 Prescripto - All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;