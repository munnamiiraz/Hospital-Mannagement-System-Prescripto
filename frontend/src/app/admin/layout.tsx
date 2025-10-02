"use client";
import Navbar from "../../components/adminComponents/Navbar";
import Sidebar from "../../components/adminComponents/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-1">
          <aside className="w-64 min-h-[calc(100vh-64px)] border-r bg-white">
            <Sidebar />
          </aside>
          <div className="flex-1 p-4 bg-gray-50">{children}</div>
        </div>
      </div>
  );
}
