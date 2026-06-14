// src/pages/admin/Dashboard.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAdminDashboard } from "../../services/api";
import api from "../../services/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Users,
  MapPinned,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  TrendingUp,
  ShieldCheck,
  Star,
  ArrowUpRight,
  Wallet,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

const statusColor = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("konfirm") || s.includes("selesai") || s.includes("paid"))
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  if (s.includes("pending") || s.includes("menunggu"))
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  if (s.includes("batal") || s.includes("cancel"))
    return "bg-red-50 text-red-600 ring-1 ring-red-200";
  return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
};



const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

const avatarColor = (name = "") => {
  const colors = [
    "bg-violet-500",
    "bg-sky-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[hash % colors.length];
};

// ─── custom chart tooltip ───────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white px-3 py-2 shadow-lg ring-1 ring-slate-100 text-sm">
      <p className="text-slate-400 text-xs mb-0.5">{label}</p>
      <p className="font-semibold text-slate-800">
        {prefix}
        {typeof payload[0].value === "number"
          ? payload[0].value.toLocaleString("id-ID")
          : payload[0].value}
      </p>
    </div>
  );
};

// ─── stat card ──────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, accent, sub }) => (
  <div className="relative bg-white rounded-2xl p-5 shadow-sm ring-1 ring-slate-100 overflow-hidden group hover:shadow-md transition-shadow">
    {/* accent blob */}
    <div
      className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.08] ${accent}`}
    />
    <div className="flex items-start justify-between">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent} bg-opacity-10`}
      >
        <Icon size={18} className={`${accent.replace("bg-", "text-")}`} />
      </div>
      <ArrowUpRight
        size={14}
        className="text-slate-300 group-hover:text-slate-400 transition-colors mt-1"
      />
    </div>
    <p className="mt-4 text-[26px] font-bold text-slate-900 leading-none tracking-tight">
      {value}
    </p>
    <p className="mt-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
      {label}
    </p>
    {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
  </div>
);

// ─── main component ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState([]);
  const loadProfile = async () => {
    try {
      const res = await api.get(
        "/admin/profile"
      );

      setProfile(res.data);
    } catch (err) {
      console.error(
        "PROFILE ERROR:",
        err
      );
    }
  };

  useEffect(() => {
    loadDashboard();
    loadProfile();
  }, []);
  const loadUsers = async () => {
  try {
    const res = await api.get("/admin/users");

    console.log("===== USERS FROM API =====");
    console.log(res.data.data);

    setUsers(
      res.data?.data || []
    );

      setUsers(
        res.data?.data || []
      );
    } catch (err) {
      console.error(
        "LOAD USERS ERROR",
        err
      );
    }
  };
  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboard();
      setDashboard(res);
    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#16a34a] border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400">Memuat dashboard…</p>
        </div>
      </div>
    );
  }

  const summary = dashboard?.summary || {};

  const topStats = [
    {
      label: "Total User",
      value: summary.totalUser || 0,
      icon: Users,
      accent: "bg-violet-500",
    },
    {
      label: "Total Lapangan",
      value: summary.totalLapangan || 0,
      icon: MapPinned,
      accent: "bg-sky-500",
    },
    {
      label: "Total Booking",
      value: summary.totalBooking || 0,
      icon: BookOpen,
      accent: "bg-teal-500",
    },
    {
      label: "Booking Hari Ini",
      value: summary.bookingHariIni || 0,
      icon: CalendarCheck,
      accent: "bg-orange-500",
    },
    {
      label: "Booking Bulan Ini",
      value: summary.bookingBulanIni || 0,
      icon: CalendarDays,
      accent: "bg-pink-500",
    },
    {
      label: "Admin Aktif",
      value: summary.adminAktif || 0,
      icon: ShieldCheck,
      accent: "bg-indigo-500",
    },
  ];

  const hour = new Date().getHours();
    let greeting = "Selamat datang";

    if (hour >= 4 && hour < 11) {
      greeting = "Selamat pagi";
    } else if (hour >= 11 && hour < 15) {
      greeting = "Selamat siang";
    } else if (hour >= 15 && hour < 18) {
      greeting = "Selamat sore";
    } else {
      greeting = "Selamat malam";
    }

  return (
    <div className="space-y-7 pb-10">

      {/* ── HERO HEADER ── */}
      <div
        className="relative rounded-2xl overflow-hidden p-7 text-white shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, #0f4d1c 0%, #16a34a 60%, #22c55e 100%)",
        }}
      >
        {/* decorative circles */}
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute right-20 -bottom-12 w-32 h-32 rounded-full bg-white/5" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

  {/* FOTO + INFO ADMIN */}
  <div className="flex items-center gap-5">

    {/* FOTO PROFIL */}
    <div className="
      w-24 h-24
      rounded-2xl
      bg-white/10
      backdrop-blur-sm
      border border-white/20
      overflow-hidden
      shrink-0
      flex items-center justify-center
    ">
      <img
        src={
          profile?.photo_url
            ? profile.photo_url
            : "/admin-profile.png"
        }
        alt="Admin"
        className="w-full h-full object-cover"
      />
    </div>

    {/* TEKS */}
    <div>
      <p className="text-white/80 text-lg font-semibold">
        {greeting} 👋
      </p>

      <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-white">
        SUPER ADMIN BOOKLAP
      </h1>

      <p className="mt-2 text-white/80 text-base">
        {user?.email || "adminbooklap@gmail.com"}
      </p>
    </div>

  </div>

          {/* revenue highlight */}
          <div className="sm:text-right bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 shrink-0">
            <div className="flex items-center gap-2 sm:justify-end mb-1">
              <Wallet size={14} className="text-white/60" />
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Pendapatan Bulan Ini
              </p>
            </div>
            <p className="text-3xl font-black tracking-tight">
              Rp{" "}
              {(summary.pendapatanBulanIni || 0).toLocaleString("id-ID")}
            </p>
            <div className="mt-1 flex items-center gap-1 sm:justify-end text-white/70 text-xs">
              <TrendingUp size={12} />
              <span>Tahun berjalan</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {topStats.map((s) => (
          <div
            key={s.label}
            className={
              s.label === "Total User"
                ? "cursor-pointer"
                : ""
            }
            onClick={async () => {
              if (
                s.label === "Total User"
              ) {
                await loadUsers();

                setShowUserModal(
                  true
                );
              }
            }}
          >
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* ── CHARTS ── */}
      <div className="grid gap-6 xl:grid-cols-2">

        {/* Line chart – Booking */}
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Booking 30 Hari Terakhir
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Jumlah booking harian</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-100">
              Live
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dashboard?.bookingChart || []}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="tanggal"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#16a34a", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart – Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Pendapatan Bulanan
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Pendapatan tahun berjalan</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-100">
              {new Date().getFullYear()}
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboard?.revenueChart || []}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                barSize={24}
              >
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="bulan"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip prefix="Rp " />} />
                <Bar
                  dataKey="total"
                  fill="url(#revGrad)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="grid gap-6 xl:grid-cols-3">

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 xl:col-span-1">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-900">Booking Terbaru</h2>
            <BookOpen size={15} className="text-slate-300" />
          </div>
          <div className="space-y-3">
            {(dashboard?.recentBookings || []).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">
                Belum ada booking
              </p>
            )}
            {(dashboard?.recentBookings || []).map((booking, i) => {
              const name =
                booking.nama_pemesan || booking.nama || "User";
              const status =
                booking.status_pemesanan || booking.status || "";
              return (
                <div
                  key={booking.id || i}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor(name)}`}
                  >
                    {initials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {booking.lapanganName}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor(status)}`}
                  >
                    {status || "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="xl:col-span-2">

       

          {/* Recent Reviews */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-900">Review Terbaru</h2>
              <Star size={15} className="text-slate-300" />
            </div>
            <div className="space-y-3">
              {(dashboard?.recentReviews || []).length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">
                  Belum ada review
                </p>
              )}
              {(dashboard?.recentReviews || []).map((review) => (
                <div
                  key={review.id}
                  className="p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200 fill-slate-200"
                        }
                      />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">
                      {review.rating}/5
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {review.komentar || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">

          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden">

            <div className="flex items-center justify-between p-6 border-b">

              <h2 className="text-xl font-bold">
                Daftar User
              </h2>

              <button
                onClick={() =>
                  setShowUserModal(
                    false
                  )
                }
                className="text-red-600 font-bold"
              >
                ✕
              </button>

            </div>

            <div className="p-6 overflow-y-auto max-h-[65vh]">

              <div className="mb-4">

                <p className="text-3xl font-bold text-green-600">
                  {users.length}
                </p>

                <p className="text-slate-500">
                  Total User
                </p>

              </div>

              <div className="space-y-3">

                {users.map((user) => {

  console.log(
    "USER LOGIN DATA:",
    user.nama,
    user.last_login
  );

  return (
    <div
      key={user.id}
      className="flex items-center gap-3 p-3 border rounded-xl"
    >

                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${avatarColor(
                        user.nama
                      )}`}
                    >
                      {initials(
                        user.nama
                      )}
                    </div>

                    <div>

                      <p className="font-semibold">
                        {user.nama}
                      </p>

                      <p className="text-sm text-slate-500">
                        {user.email}
                      </p>

<p className="text-xs text-green-600 mt-1">
  {user.last_login
  ? new Date(user.last_login).toLocaleString(
      "id-ID",
      {
        timeZone: "Asia/Makassar",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    )
  : "Belum pernah login"}
</p>

                    </div>

                  </div>
                  );
              })}

              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}
