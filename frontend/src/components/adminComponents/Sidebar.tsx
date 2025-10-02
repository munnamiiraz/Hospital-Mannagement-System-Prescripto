"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { assets } from "@/assets/assets_admin/assets.js";

const Sidebar: React.FC = () => {
  const [aToken, setAToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("aToken");
    setAToken(token);
    setChecking(false);

    if (!token) {
      router.push("/admin/login");
    }
  }, [router, aToken]);

  // sidebar skeleton
  if (checking) {
    return (
      <div className="min-h-screen bg-white border-r p-4">
        <div className="h-10 w-32 bg-gray-100 rounded mb-6" />
        <ul className="space-y-2">
          <li className="h-8 w-full bg-gray-100 rounded" />
          <li className="h-8 w-full bg-gray-100 rounded" />
          <li className="h-8 w-full bg-gray-100 rounded" />
          <li className="h-8 w-full bg-gray-100 rounded" />
        </ul>
      </div>
    );
  }

  //no token redirect
  if (!aToken) return null;

  const getNavLinkClass = (href: string): string => {
    const baseClasses =
      "flex items-center gap-3 py-4 px-3 md:px-9 md:min-w-72 cursor-pointer transition-all";
    const activeClasses =
      "bg-[#F2F2FF] border-r-4 border-[#4F46E5] font-semibold text-[#4F46E5]";
    return `${baseClasses} ${pathname?.startsWith(href) ? activeClasses : "text-gray-700"}`;
  };


  return (
    <div className="min-h-screen bg-white border-r p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
          <Image src={assets.appointment_icon} width={40} height={40} alt="admin" />
        </div>
        <div>
          <p className="text-sm font-medium">Admin</p>
          <p className="text-xs text-gray-500">admin@example.com</p>
        </div>
      </div>

      <ul className="text-[#515151] mt-2">
        <li>
          <Link href="/admin/all-appointments" className={getNavLinkClass("/admin/all-appointments")}>
            <Image src={assets.appointment_icon} width={24} height={24} alt="Appointments icon" />
            <p>Appointments</p>
          </Link>
        </li>
        <li>
          <Link href="/admin/add-doctors" className={getNavLinkClass("/admin/add-doctors")}>
            <Image src={assets.add_icon} width={24} height={24} alt="Add doctor icon" />
            <p>Add Doctor</p>
          </Link>
        </li>
        <li>
          <Link href="/admin/doctor-list" className={getNavLinkClass("/admin/doctor-list")}>
            <Image src={assets.people_icon} width={24} height={24} alt="Doctors list icon" />
            <p>Doctors List</p>
          </Link>
        </li>
        <li>
          <Link href="/admin/all-complains" className={getNavLinkClass("/admin/all-complains")}>
            <Image src={assets.people_icon} width={24} height={24} alt="complain list icon" />
            <p>Complain List</p>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
