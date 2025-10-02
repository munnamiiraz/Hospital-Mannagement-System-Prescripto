"use client";

import { RootState } from "../../store/adminStore/store";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { aToken } = useSelector((state: RootState) => state.admin);
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("aToken");

    if (!aToken && !token) {
      router.push("/admin/login");
    } else {
      setIsChecking(false);
    }
  }, [aToken, router]);

  return (
    <div className="h-full flex items-center justify-center">
      {isChecking ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : (
        <h1 className="text-2xl font-semibold">Welcome to Dashboard</h1>
      )}
    </div>
  );
}
