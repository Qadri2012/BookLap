import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
export default function AdminLayout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`
          min-h-screen
          px-6
          py-6
          transition-all duration-300

          ${
            collapsed
              ? "lg:ml-[90px]"
              : "lg:ml-[270px]"
          }
        `}
      >
      
        <Outlet />
      </main>
    </div>
  );
}