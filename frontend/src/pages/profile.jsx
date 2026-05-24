// src/pages/profile.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  CreditCard,
  LogOut,
  MapPin,
  ShieldCheck,
  UserCircle2,
  ArrowLeft,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  const displayName = user?.nama || "Akun Saya";
  const email = user?.email || "-";
  const phone = user?.no_whatsapp || user?.noWa || "-";
  const role = user?.role || "Pengguna";

  const menuItems = [
    {
      title: "Pesanan Saya",
      desc: "Lihat status dan riwayat pemesanan",
      icon: CalendarDays,
      to: "/pesanan",
    },
    {
      title: "Riwayat Pembayaran",
      desc: "Cek pembayaran yang pernah dilakukan",
      icon: CreditCard,
      to: "/riwayat",
    },
    {
      title: "Lapangan Favorit",
      desc: "Akses lapangan yang sering digunakan",
      icon: MapPin,
      to: "/lapangan",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#111]">
      {/* ✅ NEW: navbar khusus profile */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-[#0a2e14] via-[#143d1e] to-[#0a2e14] text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label="Kembali"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-2xl font-extrabold">Profil Saya</h1>
              <p className="text-sm text-white/70">
                Kelola informasi akun dan akses pesanan Anda
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            Keluar
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_10px_30px_rgba(16,24,40,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[340px_1fr]">
            <div className="border-b border-gray-100 bg-[#eef4ec] p-6 lg:border-b-0 lg:border-r">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#2a7f30] text-white shadow-lg">
                  <UserCircle2 className="h-14 w-14" />
                </div>

                <h2 className="mt-4 text-2xl font-extrabold text-[#111]">
                  {displayName}
                </h2>
                <p className="mt-1 text-sm font-medium text-[#2a7f30]">{role}</p>

                <div className="mt-6 w-full rounded-2xl bg-white p-4 text-left shadow-sm">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-[#2a7f30]" />
                    <div>
                      <p className="text-sm font-semibold text-[#111]">Akun Aktif</p>
                      <p className="text-sm text-gray-500">
                        Data akun tersimpan dan dapat digunakan untuk pemesanan.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex w-full gap-3">
                  <Link
                    to="/pesanan"
                    className="flex-1 rounded-full bg-[#2a7f30] px-4 py-3 text-center text-sm font-semibold text-white transition hover:brightness-95"
                  >
                    Lihat Pesanan
                  </Link>
                  <Link
                    to="/riwayat"
                    className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-3 text-center text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                  >
                    Riwayat
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-bold text-[#111]">Informasi Akun</h3>
              <p className="mt-1 text-sm text-gray-500">
                Detail data yang digunakan pada akun Anda
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard label="Nama Lengkap" value={displayName} />
                <InfoCard label="Email" value={email} />
                <InfoCard label="No WhatsApp" value={phone} />
                <InfoCard label="Role" value={role} />
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-bold text-[#111]">Menu Cepat</h4>

                <div className="mt-4 space-y-3">
                  {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.title}
                        to={item.to}
                        className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ec] text-[#2a7f30]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#111]">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                        </div>

                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-gray-200 bg-[#f8f8f5] p-5">
                <div className="flex items-start gap-3">
                  <Bell className="mt-0.5 h-5 w-5 text-[#2a7f30]" />
                  <div>
                    <p className="font-semibold text-[#111]">Notifikasi</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Semua informasi pemesanan dan pembayaran akan muncul di halaman pesanan Anda.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 sm:hidden"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-1 break-words text-base font-bold text-gray-800">
        {value || "-"}
      </p>
    </div>
  );
}