// pages/admin/Booking.js
import { useEffect, useMemo, useState, useRef } from "react";
import {
  getAllPemesanan,
  updateStatusPemesanan,
  setujuiPembatalan,
} from "../../services/api";
import {
  Bell,
  Search,
  X,
  CheckCircle,
  Clock,
  XCircle,
  Ban,
  Gamepad2,
  Trophy,
  MapPin,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  Package,
  ChevronRight,
  RefreshCw,
  Filter,
  User,
  Hash,
  Wallet,
  AlertTriangle,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  menunggu_pembayaran: {
    label: "Menunggu Bayar",
    color: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-400",
    icon: Clock,
    bar: "bg-amber-400",
  },
  menunggu_kedatangan: {
    label: "Menunggu Hadir",
    color: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    dot: "bg-sky-400",
    icon: MapPin,
    bar: "bg-sky-400",
  },
  sedang_dimainkan: {
    label: "Sedang Bermain",
    color: "bg-green-50 text-green-700 ring-1 ring-green-200",
    dot: "bg-green-500",
    icon: Gamepad2,
    bar: "bg-green-500",
  },
  permintaan_pembatalan: {
    label: "Minta Batal",
    color: "bg-red-50 text-red-700 ring-1 ring-red-200",
    dot: "bg-red-500",
    icon: AlertTriangle,
    bar: "bg-red-500",
  },
  menunggu_persetujuan_pembatalan: {
    label: "Minta Batal",
    color: "bg-red-50 text-red-700 ring-1 ring-red-200",
    dot: "bg-red-500",
    icon: AlertTriangle,
    bar: "bg-red-500",
  },
  dibatalkan: {
    label: "Dibatalkan",
    color: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    dot: "bg-slate-400",
    icon: Ban,
    bar: "bg-slate-400",
  },
  selesai: {
    label: "Selesai",
    color: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
    icon: Trophy,
    bar: "bg-emerald-500",
  },
  sudah_bayar: {
    label: "Sudah Bayar",
    color:
      "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    dot: "bg-blue-500",
    icon: CheckCircle,
    bar: "bg-blue-500",
  },
  expired: {
    label: "Expired",
    color: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
    dot: "bg-orange-400",
    icon: XCircle,
    bar: "bg-orange-400",
  },
};

const getStatus = (s) =>
  STATUS_CONFIG[s] || {
    label: s?.replace(/_/g, " ") || "-",
    color: "bg-slate-100 text-slate-500",
    dot: "bg-slate-300",
    icon: Clock,
    bar: "bg-slate-300",
  };

const getPaymentLabel = (item) => {
  if (item.payment_channel === "cash") return { label: "Cash di Tempat", icon: "💵" };
  const va = String(item.va_number || "");
  if (va.startsWith("451")) return { label: "BSI Virtual Account", icon: "🏦" };
  if (va.startsWith("009")) return { label: "BNI Virtual Account", icon: "🏦" };
  if (va.startsWith("002")) return { label: "BRI Virtual Account", icon: "🏦" };
  if (va.startsWith("008")) return { label: "Mandiri Virtual Account", icon: "🏦" };
  if (item.payment_channel === "ewallet") return { label: "E-Wallet", icon: "📱" };
  if (item.payment_channel === "minimarket") return { label: "Indomaret", icon: "🏪" };
  return { label: "Transfer Bank", icon: "🏦" };
};

const rupiah = (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`;
// ===== NEW CODE TIMER ADMIN =====

const formatCountdown = (
  expiresAt
) => {
  if (!expiresAt)
    return "00:00:00";

  const remaining =
    new Date(expiresAt).getTime() -
    Date.now();

  if (remaining <= 0)
    return "00:00:00";

  const hours = Math.floor(
    remaining / 3600000
  );

  const minutes = Math.floor(
    (remaining % 3600000) /
      60000
  );

  const seconds = Math.floor(
    (remaining % 60000) /
      1000
  );

  return [
    String(hours).padStart(
      2,
      "0"
    ),
    String(minutes).padStart(
      2,
      "0"
    ),
    String(seconds).padStart(
      2,
      "0"
    ),
  ].join(":");
};

// ===== END NEW CODE =====

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
};

const FILTERS = [
 "Semua",
 "Menunggu Bayar",
 "Menunggu Hadir",
 "Sudah Bayar",
 "Sedang Bermain",
 "Expired",
 "Minta Batal",
 "Selesai"
];

const filterToStatus = {
  "Menunggu Bayar": "menunggu_pembayaran",
  "Menunggu Hadir": "menunggu_kedatangan",
  "Sudah Bayar": "sudah_bayar",
  "Sedang Bermain": "sedang_dimainkan",
  "Minta Batal": ["permintaan_pembatalan", "menunggu_persetujuan_pembatalan"],
  "Selesai": "selesai",
   Expired: "expired",
};

// ─── sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, accent, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl px-5 py-4 shadow-sm ring-1 ring-slate-100 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = getStatus(status);
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={13} className="text-slate-500" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5 leading-snug">{value || "-"}</p>
      </div>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function AdminBooking() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [newCount, setNewCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  // ===== NEW CODE TIMER ADMIN =====
  const [, forceUpdate] =
    useState(0);

  useEffect(() => {
    const interval =
      setInterval(() => {
        forceUpdate(
          (v) => v + 1
        );
      }, 1000);

    return () =>
      clearInterval(interval);
  }, []);
// ===== END NEW CODE =====
  const prevCountRef = useRef(0);

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getAllPemesanan();
      const list = data || [];
      setBookings(list);

      // hitung notif baru (menunggu_pembayaran + permintaan_pembatalan)
      const urgent = list.filter(
        (b) =>
          b.status_pemesanan === "menunggu_pembayaran" ||
          b.status_pemesanan === "permintaan_pembatalan" ||
          b.status_pemesanan === "menunggu_persetujuan_pembatalan"
      ).length;
      if (urgent > prevCountRef.current) setNewCount(urgent);
      prevCountRef.current = urgent;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = useMemo(() => {
    return bookings.filter((item) => {
      const text = `${item.kode_pemesanan || ""} ${item.nama_pemesan || ""} ${item.email || ""}`.toLowerCase();
      const matchKeyword = text.includes(keyword.toLowerCase());
      if (activeFilter === "Semua") return matchKeyword;
      const target = filterToStatus[activeFilter];
      const matchStatus = Array.isArray(target)
        ? target.includes(item.status_pemesanan)
        : item.status_pemesanan === target;
      return matchKeyword && matchStatus;
    });
  }, [bookings, keyword, activeFilter]);

  // stats
  const stats = useMemo(
  () => ({
    semua: bookings.length,

    menungguBayar: bookings.filter(
      (b) =>
        b.status_pemesanan ===
        "menunggu_pembayaran"
    ).length,

    menungguHadir: bookings.filter(
      (b) =>
        b.status_pemesanan ===
        "menunggu_kedatangan"
    ).length,

    sudahBayar: bookings.filter(
      (b) =>
        b.status_pemesanan ===
        "sudah_bayar"
    ).length,

    sedangBermain: bookings.filter(
      (b) =>
        b.status_pemesanan ===
        "sedang_dimainkan"
    ).length,

    expired: bookings.filter(
      (b) =>
        b.status_pemesanan ===
        "expired"
    ).length,

    batal: bookings.filter(
      (b) =>
        b.status_pemesanan ===
          "permintaan_pembatalan" ||
        b.status_pemesanan ===
          "menunggu_persetujuan_pembatalan"
    ).length,

    selesai: bookings.filter(
      (b) =>
        b.status_pemesanan ===
        "selesai"
    ).length,
  }),
  [bookings]
);
  const urgentList = useMemo(() =>
    bookings.filter(
      (b) =>
        b.status_pemesanan === "menunggu_pembayaran" ||
        b.status_pemesanan === "permintaan_pembatalan" ||
        b.status_pemesanan === "menunggu_persetujuan_pembatalan"
    ).slice(0, 5),
    [bookings]
  );

  const handleKonfirmasi = async (id, newStatus) => {
    try {
      setActionLoading(true);
      await updateStatusPemesanan(id, newStatus);
      await loadData(true);
      // update selected booking
      setSelectedBooking((prev) => prev ? { ...prev, status_pemesanan: newStatus } : null);
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetujuiBatal = async (id) => {
    try {
      setActionLoading(true);
      await setujuiPembatalan(id);
      await loadData(true);
      setSelectedBooking((prev) => prev ? { ...prev, status_pemesanan: "dibatalkan" } : null);
    } catch (err) {
      console.error(err);
      alert("Gagal menyetujui pembatalan");
    } finally {
      setActionLoading(false);
    }
  };
  const badgeCounts = {
  Semua: stats.semua,

  "Menunggu Bayar":
    stats.menungguBayar,

  "Menunggu Hadir":
    stats.menungguHadir,

  "Sudah Bayar":
    stats.sudahBayar,

  "Sedang Bermain":
    stats.sedangBermain,

  Expired:
    stats.expired,

  "Minta Batal":
    stats.batal,

  Selesai:
    stats.selesai,
};

  return (
    <div className="min-h-screen bg-[#f0f4f0]">

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Booking</h1>
          <p className="text-xs text-slate-400 mt-0.5">Pantau dan kelola seluruh pesanan masuk</p>
        </div>

        <div className="flex items-center gap-3">
          {/* refresh */}
          <button
            onClick={() => loadData()}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw size={15} />
          </button>

          {/* notif bell */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifPanel(!showNotifPanel); setNewCount(0); }}
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <Bell size={15} />
            </button>
            {newCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {newCount > 9 ? "9+" : newCount}
              </span>
            )}

            {/* notif dropdown */}
            {showNotifPanel && (
              <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl ring-1 ring-slate-100 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">Perlu Tindakan</p>
                  <span className="text-xs text-slate-400">{urgentList.length} item</span>
                </div>
                {urgentList.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-400">Tidak ada notifikasi</div>
                ) : (
                  <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                    {urgentList.map((b) => {
                      const cfg = getStatus(b.status_pemesanan);
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={b.id}
                          onClick={() => { setSelectedBooking(b); setShowNotifPanel(false); }}
                          className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 text-left transition-colors"
                        >
                          <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.dot} bg-opacity-20`}>
                            <Icon size={13} className={`text-current`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {b.nama_pemesan}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{cfg.label}</p>
                          </div>
                          <span className={`ml-auto mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color} shrink-0`}>
                            Aksi
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* ── SEARCH + FILTER ── */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm ring-1 ring-slate-100 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau kode booking..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
            <Filter size={13} className="text-slate-400 shrink-0" />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`relative text-xs font-semibold px-5 py-2 rounded-full transition-all ${
                  activeFilter === f
                    ? "bg-[#16a34a] text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {f}

                {(badgeCounts[f] || 0) > 0 && (
                  <span
                    className="
                      absolute
                      -top-2
                      -right-2
                      min-w-[22px]
                      h-[22px]
                      px-1.5
                      rounded-full
                      bg-red-500
                      text-white
                      text-[10px]
                      font-bold
                      flex
                      items-center
                      justify-center
                      shadow-md
                      border-2
                      border-white
                    "
                  >
                    {badgeCounts[f] > 99
                      ? "99+"
                      : badgeCounts[f]}
                  </span>
                )}
              </button>
            ))}
      
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className={`grid gap-5 transition-all duration-300 ${selectedBooking ? "xl:grid-cols-[1fr_420px]" : "grid-cols-1"}`}>

          {/* ── LIST ── */}
          <div className="space-y-3">
            {loading && (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="w-7 h-7 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-slate-400 mt-3">Memuat data...</p>
              </div>
            )}

            {!loading && filteredData.length === 0 && (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm ring-1 ring-slate-100">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Search size={22} className="text-slate-400" />
                </div>
                <p className="font-semibold text-slate-700">Tidak ada booking</p>
                <p className="text-sm text-slate-400 mt-1">Coba ubah filter atau kata kunci pencarian</p>
              </div>
            )}

            {!loading && filteredData.map((item) => {
              const cfg = getStatus(item.status_pemesanan);
              const pay = getPaymentLabel(item);
              const isSelected = selectedBooking?.id === item.id;
              const isUrgent =
                item.status_pemesanan === "menunggu_pembayaran" ||
                item.status_pemesanan === "permintaan_pembatalan" ||
                item.status_pemesanan === "menunggu_persetujuan_pembatalan";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedBooking(isSelected ? null : item)}
                  className={`w-full text-left bg-white rounded-2xl p-5 shadow-sm ring-1 transition-all duration-200 border-l-4 ${cfg.bar.replace("bg-", "border-l-")} ${
                    isSelected
                      ? "ring-[#16a34a]/40 shadow-md"
                      : "ring-slate-100 hover:shadow-md hover:ring-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* left accent */}
                    <div className={`mt-1 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isUrgent ? "bg-red-50" : "bg-slate-50"}`}>
                      {isUrgent
                        ? <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        : <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-extrabold text-slate-900 text-sm tracking-tight truncate">
                          {item.kode_pemesanan ||
                            item.va_number ||
                            `#${item.id}`}
                        </p>

                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge
                            status={
                              item.status_pemesanan
                            }
                          />

                          {item.status_pemesanan ===
                            "menunggu_pembayaran" &&
                            item.payment_expires_at && (
                              <div
                                className="
                                  inline-flex
                                  items-center
                                  rounded-lg
                                  bg-amber-50
                                  px-2.5
                                  py-1
                                  text-xs
                                  font-bold
                                  text-amber-700
                                "
                              >
                                ⏳{" "}
                                {formatCountdown(
                                  item.payment_expires_at
                                )}
                              </div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mt-1 font-medium">{item.nama_pemesan}</p>
                      <p className="text-xs text-slate-400 truncate">{item.email}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg font-medium">
                          {pay.icon} {pay.label}
                        </span>
                        <span className="text-sm font-extrabold text-[#16a34a]">
                          {rupiah(item.total_bayar)}
                        </span>
                      </div>
                      
                    </div>

                    <ChevronRight
                      size={16}
                      className={`shrink-0 mt-1 transition-transform ${isSelected ? "rotate-90 text-[#16a34a]" : "text-slate-300"}`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── DETAIL PANEL ── */}
          {selectedBooking && (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden self-start sticky top-24">
              {/* panel header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, #0f4d1c 0%, #16a34a 100%)" }}
              >
                <div>
                  <p className="text-white/60 text-xs font-medium">Detail Booking</p>
                  <p className="text-white font-extrabold text-sm mt-0.5 truncate max-w-[220px]">
                    {selectedBooking.kode_pemesanan || selectedBooking.va_number || `#${selectedBooking.id}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* status bar */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-start justify-between">
  <div className="flex flex-col gap-2">
    <StatusBadge
      status={
        selectedBooking.status_pemesanan
      }
    />

    {selectedBooking.status_pemesanan ===
      "menunggu_pembayaran" &&
      selectedBooking.payment_expires_at && (
        <div
          className="
            inline-flex
            w-fit
            items-center
            rounded-lg
            bg-amber-50
            px-2.5
            py-1
            text-xs
            font-bold
            text-amber-700
          "
        >
          ⏳{" "}
          {formatCountdown(
            selectedBooking.payment_expires_at
          )}
        </div>
    )}
  </div>

  <span className="text-lg font-extrabold text-[#16a34a]">
    {rupiah(
      selectedBooking.total_bayar
    )}
  </span>
</div>
              <div className="px-5 py-5 space-y-5 max-h-[calc(100vh-280px)] overflow-y-auto
                [&::-webkit-scrollbar]:w-1
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-slate-200">

                {/* pemesan */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Pemesan</p>
                  <div className="space-y-3">
                    <DetailRow icon={User} label="Nama" value={selectedBooking.nama_pemesan} />
                    <DetailRow icon={Mail} label="Email" value={selectedBooking.email} />
                    <DetailRow icon={Phone} label="WhatsApp" value={selectedBooking.no_whatsapp} />
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* pembayaran */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Pembayaran</p>
                  <div className="space-y-3">
                    <DetailRow
                      icon={CreditCard}
                      label="Metode"
                      value={`${getPaymentLabel(selectedBooking).icon} ${getPaymentLabel(selectedBooking).label}`}
                    />
                    <DetailRow
                      icon={Hash}
                      label="Kode / Nomor VA"
                      value={selectedBooking.va_number || selectedBooking.payment_reference || selectedBooking.kode_pemesanan}
                    />
                    <DetailRow icon={Wallet} label="Total Bayar" value={rupiah(selectedBooking.total_bayar)} />
                    {
                      selectedBooking
                        .status_pemesanan ===
                        "menunggu_pembayaran" &&
                      selectedBooking
                        .payment_expires_at && (
                        <DetailRow
                          icon={Clock}
                          label="Sisa Waktu Pembayaran"
                          value={formatCountdown(
                            selectedBooking
                              .payment_expires_at
                          )}
                        />
                      )
                    }
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* slot booking */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Jadwal Booking</p>
                  <div className="space-y-2">
                    {(selectedBooking.detail_pemesanan || []).map((slot, i) => (
                      <div key={i} className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium">Lapangan</p>
                            <p className="text-sm font-bold text-slate-800">{slot.nama_lapangan} #{slot.nomor_lapangan}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium">Tanggal</p>
                            <p className="text-sm font-bold text-slate-800">{slot.tanggal}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[10px] text-slate-400 font-medium">Jam</p>
                            <p className="text-sm font-bold text-[#16a34a]">
                              {String(slot.jam_mulai).slice(0,5)} – {String(slot.jam_selesai).slice(0,5)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedBooking.lapangan?.alamat && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-slate-500">
                      <MapPin size={12} className="mt-0.5 shrink-0 text-[#16a34a]" />
                      <span>{selectedBooking.lapangan.alamat}</span>
                    </div>
                  )}
                </div>

                {/* layanan tambahan */}
                {(selectedBooking.detail_layanan || []).length > 0 && (
                  <>
                    <div className="h-px bg-slate-100" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Layanan Tambahan</p>
                      <div className="space-y-2">
                        {selectedBooking.detail_layanan.map((l, i) => (
                          <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{l.layanan?.nama_layanan || "-"}</p>
                              <p className="text-xs text-slate-400">Qty: {l.qty}</p>
                            </div>
                            <p className="text-sm font-bold text-[#16a34a]">{rupiah(l.subtotal)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex justify-between text-sm font-bold border-t border-slate-100 pt-2">
                        <span className="text-slate-600">Total Layanan</span>
                        <span className="text-[#16a34a]">{rupiah(selectedBooking.subtotal_layanan)}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* alasan batal */}
                {selectedBooking.alasan_batal && (
                  <>
                    <div className="h-px bg-slate-100" />
                    <div className="rounded-xl bg-red-50 ring-1 ring-red-100 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} className="text-red-500" />
                        <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Alasan Pembatalan</p>
                      </div>
                      <p className="text-sm text-red-800 leading-relaxed">{selectedBooking.alasan_batal}</p>
                    </div>
                  </>
                )}
              </div>

              {/* ── ACTION BUTTONS ── */}
              <div className="px-5 py-4 border-t border-slate-100 space-y-2">
                {selectedBooking.status_pemesanan === "menunggu_pembayaran" && (
                  <button
                    onClick={() => handleKonfirmasi(selectedBooking.id, "sudah_bayar")}
                    disabled={actionLoading}
                    className="w-full py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={15} />
                    {actionLoading ? "Memproses..." : "Konfirmasi Pembayaran"}
                  </button>
                )}
                {selectedBooking.status_pemesanan === "menunggu_kedatangan" && (
                  <button
                    onClick={() => handleKonfirmasi(selectedBooking.id, "sudah_bayar")}
                    disabled={actionLoading}
                    className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={15} />
                    {actionLoading ? "Memproses..." : "Tandai Sudah Bayar"}
                  </button>
                )}
                {(selectedBooking.status_pemesanan === "permintaan_pembatalan" ||
                  selectedBooking.status_pemesanan === "menunggu_persetujuan_pembatalan") && (
                  <button
                    onClick={() => handleSetujuiBatal(selectedBooking.id)}
                    disabled={actionLoading}
                    className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <XCircle size={15} />
                    {actionLoading ? "Memproses..." : "Setujui Pembatalan"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* overlay notif close */}
      {showNotifPanel && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifPanel(false)} />
      )}
    </div>
  );
}
