import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  LayoutDashboard,
  MapPinned,
  CalendarDays,
  BookOpen,
  CreditCard,
  Users,
  MessageSquare,
  Briefcase,
  ShieldCheck,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/lapangan", label: "Lapangan", icon: MapPinned },
  { to: "/admin/jadwal", label: "Jadwal Lapangan", icon: CalendarDays },
  { to: "/admin/booking", label: "Booking", icon: BookOpen },
  { to: "/admin/pembayaran", label: "Pembayaran", icon: CreditCard },
  { to: "/admin/user", label: "Manajemen User", icon: Users },
  { to: "/admin/review", label: "Review & Feedback", icon: MessageSquare },
  { to: "/admin/layanan", label: "Layanan Tambahan", icon: Briefcase },
  { to: "/admin/approval-admin", label: "Approval Admin", icon: ShieldCheck },
  { to: "/admin/laporan", label: "Laporan", icon: FileText },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function AdminSidebar({
  collapsed,
  setCollapsed,
}) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout(true, "/login-admin");
  };
  return (
    <>
      {/* ── TOP BAR (logo area) ── */}
      <div
        className={`
          fixed top-0 left-0 z-30
          bg-[#F5F7FB]
          transition-all duration-300
          hidden lg:flex lg:items-center
          ${collapsed ? "w-[80px]" : "w-[260px]"}
          h-[68px]
        `}
      >
        {collapsed ? (
          <div className="w-full flex justify-center">
            <img src="/logo.png" alt="BookLap" className="w-9 h-9 object-contain" />
          </div>
        ) : (
          <div className="px-6 flex items-center gap-2">
            <img src="/logo.png" alt="BookLap" className="w-9 h-9 object-contain" />
            <span className="text-[22px] font-black tracking-tight text-slate-800">
              Book<span className="text-[#1a8a32]">Lap</span>
            </span>
          </div>
        )}
      </div>

      {/* ── SIDEBAR ── */}
      <aside
        style={{
          background: "linear-gradient(175deg, #0f4d1c 0%, #0d3a16 60%, #0b2e12 100%)",
        }}
        className={`
          fixed left-0 top-[68px] bottom-0
          z-20 hidden lg:flex flex-col
          transition-all duration-300 ease-in-out
          rounded-tr-[40px]
          overflow-hidden
          ${collapsed ? "w-[80px]" : "w-[260px]"}
        `}
      >
        {/* subtle top decorative line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-40"
          style={{ background: "linear-gradient(90deg, transparent, #4ade80, transparent)" }}
        />

        {/* ── TOGGLE BUTTON ── */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            absolute -right-3 top-7
            h-6 w-6 rounded-full
            bg-white shadow-md
            flex items-center justify-center
            text-[#0f4d1c]
            hover:scale-110 transition-transform
            z-50
          "
        >
          {collapsed ? <ChevronRight size={13} strokeWidth={2.5} /> : <ChevronLeft size={13} strokeWidth={2.5} />}
        </button>

        {/* ── NAV ITEMS ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-0.5
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-white/20"
        >
          {/* section label */}
          {!collapsed && (
            <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
              Menu Utama
            </p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl transition-all duration-200
                  ${collapsed ? "justify-center px-0 py-3 mx-1" : "px-3 py-2.5"}
                  ${
                    isActive
                      ? "bg-white/[0.12] text-white"
                      : "text-white/55 hover:text-white/90 hover:bg-white/[0.07]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* active left accent bar */}
                    {isActive && !collapsed && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                        style={{ background: "#4ade80" }}
                      />
                    )}

                    {/* icon container */}
                    <span
                      className={`
                        flex-shrink-0 flex items-center justify-center
                        rounded-lg transition-all duration-200
                        ${collapsed ? "w-9 h-9" : "w-8 h-8"}
                        ${isActive
                          ? "bg-[#4ade80]/20 text-[#4ade80]"
                          : "group-hover:bg-white/10 text-current"
                        }
                      `}
                    >
                      <Icon size={collapsed ? 18 : 16} strokeWidth={isActive ? 2.2 : 1.8} />
                    </span>

                    {/* label */}
                    {!collapsed && (
                      <span
                        className={`text-[13px] whitespace-nowrap tracking-wide
                          ${isActive ? "font-semibold text-white" : "font-medium"}`}
                      >
                        {item.label}
                      </span>
                    )}

                    {/* collapsed tooltip */}
                    {collapsed && (
                      <div className="
                        pointer-events-none absolute left-full ml-3 z-50
                        bg-[#0f2d18] text-white text-xs font-medium
                        px-2.5 py-1.5 rounded-lg shadow-xl
                        opacity-0 translate-x-1
                        group-hover:opacity-100 group-hover:translate-x-0
                        transition-all duration-150 whitespace-nowrap
                      ">
                        {item.label}
                        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0f2d18]" />
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── DIVIDER ── */}
        <div className="mx-4 h-px bg-white/10 mb-3" />

        {/* ── FOOTER / LOGOUT ── */}
        <div className={`pb-5 px-3 shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <button
              onClick={handleLogout}
              title="Logout"
              className="
                w-10 h-10 rounded-xl flex items-center justify-center
                text-white/50 hover:text-red-400 hover:bg-red-500/10
                transition-all duration-200
              "
            >
              <LogOut size={18} />
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-white/50 hover:text-red-400 hover:bg-red-500/10
                transition-all duration-200 group
              "
            >
              <span className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                <LogOut size={16} />
              </span>
              <span className="text-[13px] font-medium">Keluar</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
