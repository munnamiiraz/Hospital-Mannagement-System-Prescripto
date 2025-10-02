"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";

import { assets as rawAssets } from "../../assets/assets_frontend/assets";
import { useAppDispatch, useAppSelector } from "../../store/userStore/hooks";

interface User {
  name: string;
  email: string;
  avatar?: {
    url: string;
    publicId: string;
  };
}


const assets = rawAssets as any;

const Navbar: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [showMenu, setShowMenu] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logOut = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/user/get-profile", {
          headers: { token },
        });

        if (response.data.success) {
          setUserData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, router]);

  console.log(userData);
  
  // Load profile when token available
  useEffect(() => {
    if (token && !userData && !loading) {
    }
  }, [token, userData, loading, dispatch]);


  const userImgSrc: string | StaticImageData | undefined =
    (userData?.avatar?.url as string | StaticImageData | undefined) ?? assets?.default_user_icon;


  // console.log(userData);
  
  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400 px-7 sm:px-[5vw] md:px-[7vw] lg:px-[10vw]">
      {/* Logo*/}
      <div
        onClick={() => {
          router.push("/");
          if (typeof window !== "undefined") window.scrollTo(0, 0);
        }}
        className="cursor-pointer"
      >
        <Image
          src={assets.logo as string | StaticImageData}
          alt="logo"
          width={144}
          height={40}
          className="w-44 cursor-pointer"
          priority
        />
      </div>

      {/* Desktop Menu */}
      <ul className="hidden justify-center md:flex items-start gap-5 font-medium">
        <Link href="/" className="flex flex-col items-center">
          <li className="py-1">HOME</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </Link>
        <Link href="/doctors" className="flex flex-col items-center">
          <li className="py-1">ALL DOCTORS</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </Link>
        <Link href="/make-complain" className="flex flex-col items-center">
          <li className="py-1">Make Complain</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </Link>
        <Link href="/about" className="flex flex-col items-center">
          <li className="py-1">ABOUT</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </Link>
        <Link href="/contact" className="flex flex-col items-center">
          <li className="py-1">CONTACT</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </Link>
        <Link href="/admin/" className="flex flex-col items-center">
          <li className="py-1 text-red-400">Admin Dashboard</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </Link>
        <Link href="/doctor/" className="flex flex-col items-center">
          <li className="py-1 text-red-400">Doctor Dashboard</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </Link>
      </ul>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {token && userData ? (
          <div className="flex items-center gap-2 group relative">
            <Image
              src={userImgSrc as string | StaticImageData}
              alt={userData?.name ?? "user"}
              width={32}
              height={32}
              className="w-8 rounded-full object-cover"
            />
            {/* Dropdown icon */}
            <Image
              src={assets.dropdown_icon as string | StaticImageData}
              alt="dropdown"
              width={10}
              height={10}
              className="w-2.5 cursor-pointer"
            />

            {/* Dropdown (hover) */}
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-stone-100 flex flex-col gap-4 p-4">
                <p 
                  onClick={() => router.push("/my-profile")} 
                  className="hover:text-black cursor-pointer"
                >
                  My Profile
                </p>
                <p 
                  onClick={() => router.push("/my-appointments")} 
                  className="hover:text-black cursor-pointer"
                >
                  My Appointments
                </p>
                <p 
                  onClick={logOut} 
                  className="hover:text-black cursor-pointer"
                >
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="button bg-primary text-white px-8 py-3 rounded-full hover:cursor-pointer font-bolder hidden md:block"
          >
            Create Account
          </button>
        )}

        {/* Mobile menu icon */}
        <Image
          onClick={() => setShowMenu(true)} 
          className="w-6 md:hidden cursor-pointer"
          src={assets.menu_icon as string | StaticImageData} 
          alt="menu" 
          width={24} 
          height={24} 
        />

        {/* Mobile sliding menu */}
        <div className={`${showMenu ? "fixed w-[50%]" : "h-0 w-0"} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
          <div className="flex items-center justify-between px-5 py-6">
            <Image 
              src={assets.logo as string | StaticImageData} 
              alt="logo" 
              width={144} 
              height={40}
              className="w-36"
            />
            <Image
              onClick={() => setShowMenu(false)} 
              className="w-7 cursor-pointer"
              src={assets.cross_icon as string | StaticImageData} 
              alt="close" 
              width={28} 
              height={28} 
            />
          </div>

          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <Link 
              href="/" 
              onClick={() => setShowMenu(false)}
            >
              <p className="px-4 rounded-full inline-block">Home</p>
            </Link>
            <Link 
              href="/doctors" 
              onClick={() => setShowMenu(false)}
            >
              <p className="px-4 rounded-full inline-block">All Doctors</p>
            </Link>
            <Link 
              href="/about" 
              onClick={() => setShowMenu(false)}
            >
              <p className="px-4 rounded-full inline-block">About</p>
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setShowMenu(false)}
            >
              <p className="px-4 rounded-full inline-block">Contact</p>
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;