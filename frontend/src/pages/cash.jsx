// src/pages/cash.jsx
import React, { useEffect, useMemo, useRef, useState } from "react"; // ✅ NEW
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  LockKeyhole,
  MapPin,
  ShieldCheck,
} from "lucide-react";

// ✅ NEW: fallback data supaya halaman tetap aman walau state kosong
const DEFAULT_FIELD = {
  alamat: "Watang Soreang, Kec Soreang, Kota Parepare, Sulawesi Selatan 91132",
};

const DEFAULT_SLOT = {
  tanggal: "2026-04-25",
  jam_mulai: "10:00",
  jam_selesai: "13:00",
  court_no: 1,
};

const DEFAULT_ORDER_CODE = "BL-250425-001";
const DEFAULT_TOTAL_PRICE = 150000;
const DEFAULT_DURATION_MINUTES = 180;

const rupiah = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const formatDateID = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatTime = (value) => (value ? String(value).slice(0, 5) : "-");

// ✅ NEW: ikon lapangan sederhana
function CourtIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="10"
        y="10"
        width="44"
        height="44"
        rx="4"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path d="M32 10V54" stroke="currentColor" strokeWidth="3" />
      <path d="M10 32H54" stroke="currentColor" strokeWidth="3" />
      <circle cx="32" cy="32" r="7" stroke="currentColor" strokeWidth="3" />
      <path d="M18 20H24" stroke="currentColor" strokeWidth="3" />
      <path d="M40 44H46" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

export default function Cash() {
  const location = useLocation();
  const isDirectFromPesanan = Boolean(location.state?.fromPesanan); // ✅ NEW
  const navigate = useNavigate(); // ✅ NEW

  const confirmButtonRef = useRef(null); // ✅ NEW
  const topCardRef = useRef(null); // ✅ NEW
  // ✅ NEW: status persetujuan syarat
    const [agreement, setAgreement] = useState({
      oneHourBefore: isDirectFromPesanan, // ✅ NEW
      showToOfficer: isDirectFromPesanan, // ✅ NEW
    });

    const canConfirm =
      isDirectFromPesanan ||
      (agreement.oneHourBefore && agreement.showToOfficer); // ✅ NEW

    const [isConfirmed, setIsConfirmed] = useState(isDirectFromPesanan); // ✅ NEW

    useEffect(() => {
      if (isDirectFromPesanan) {
        setAgreement({
          oneHourBefore: true,
          showToOfficer: true,
        });
        setIsConfirmed(true);
      }
    }, [isDirectFromPesanan]);

  const handleScrollToConfirm = () => {
    confirmButtonRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    confirmButtonRef.current?.focus();
  };
  // ✅ NEW: ambil data dari state, pakai fallback kalau kosong
  const {
    field = DEFAULT_FIELD,
    selectedSlots = [DEFAULT_SLOT],
    totalPrice = DEFAULT_TOTAL_PRICE,
    totalDurationMinutes = DEFAULT_DURATION_MINUTES,
    kodePemesanan = DEFAULT_ORDER_CODE,
  } = location.state || {};

  const slot = selectedSlots?.[0] || DEFAULT_SLOT;
  const totalPayment = rupiah(totalPrice || DEFAULT_TOTAL_PRICE);
  const durationHours = Math.ceil(
    (totalDurationMinutes || DEFAULT_DURATION_MINUTES) / 60
  );

  
  const [copied, setCopied] = useState(false);

  // ✅ NEW
  const handleConfirm = () => {
    if (!canConfirm) return;

    setIsConfirmed(true);

    setTimeout(() => {
      topCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 200);
  };

  const handleCopy = async () => {
    try {
      if (!isConfirmed) return;
      await navigator.clipboard.writeText(kodePemesanan);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  // ✅ NEW: detail pesanan kanan
  const detailItems = useMemo(
    () => [
      {
        icon: CalendarDays,
        title: "Tanggal & Waktu",
        value: formatDateID(slot.tanggal),
        subvalue: `${formatTime(slot.jam_mulai)} - ${formatTime(
          slot.jam_selesai
        )} (${durationHours} Jam)`,
      },
      {
        icon: CourtIcon,
        title: "Lapangan",
        value: `Lapangan ${slot.court_no || 1}`,
        subvalue: "",
      },
      {
        icon: Clock3,
        title: "Durasi Bermain",
        value: `${durationHours} Jam`,
        subvalue: "",
      },
      {
        icon: MapPin,
        title: "Lokasi",
        value: field?.alamat || DEFAULT_FIELD.alamat,
        subvalue: "",
      },
    ],
    [slot, durationHours, field]
  );

  const warningPoints = [
    "Harap Datang 1 Jam Sebelum Jadwal Bermain",
    "Booking Dapat Dibatalkan Jika Terlambat",
    "Jika Tidak Hadir Tanpa Konfirmasi, Akun Dapat Dibatasi",
  ];

  return (
    <div className="min-h-screen bg-[#f8f8f5] text-[#111]">
      <div className="mx-auto max-w-[1240px] px-4 py-6 md:px-6 md:py-8">
        {/* ✅ NEW: brand atas */}
        <div className="-mt-3 mb-7 flex items-center gap-[1px] text-[32px] font-extrabold leading-none tracking-tight">
          <span>Book</span>
          <span className="text-[#2f8a3d]">Lap</span>
        </div>

        {/* ✅ NEW: banner status */}
        <div className="rounded-[18px] border border-[#bccbb7] bg-[#e8f1e7] px-4 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] md:px-6 md:py-5">
          <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_270px]">
            <div className="flex min-w-0 items-center gap-4 md:gap-5">
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#2a8b33] md:h-[88px] md:w-[88px]">
                <Check className="h-[40px] w-[40px] text-white stroke-[3.2] md:h-[50px] md:w-[50px]" />
              </div>

              <div className="min-w-0">
                <h1 className="text-[22px] font-semibold leading-tight text-[#111] md:text-[26px]">
                  Pesanan Berhasil Dikonfirmasi
                </h1>
                <p className="mt-2 max-w-[900px] text-[13px] leading-snug text-[#111] md:text-[14px]">
                  Terima Kasih! Pesanan Anda Telah Berhasil Dibuat. Silahkan
                  Datang ke Lokasi dan Lakukan Pembayaran
                </p>
              </div>
            </div>

            <div className="w-full shrink-0 rounded-[14px] border border-[#b8c1b8] bg-[#eef3ec] px-4 py-3 shadow-sm lg:w-[270px]">
              <div className="text-[13px] font-semibold text-[#7f7f7f] md:text-[14px]">
                Status Pesanan
              </div>

              <div className="mt-2 flex items-center gap-3">
                <Clock3 className="h-7 w-7 shrink-0 text-[#d97706]" />
                <div className="text-[15px] font-medium text-[#d97706] md:text-[16px]">
                  Menunggu Kedatangan
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[2.05fr_1fr] lg:gap-3.5">
          {/* ✅ NEW: kartu utama kiri */}
          <div
            ref={topCardRef} // ✅ NEW
            className="overflow-hidden rounded-[22px] border border-[#e0e0e0] bg-white shadow-[0_10px_28px_rgba(0,0,0,0.08)]"
          >
            <div className="px-5 pb-5 pt-5 md:px-6 md:pb-6 md:pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 text-[18px] font-medium leading-none text-[#111] md:text-[20px]">
                    Kode Pesanan
                  </div>

                  <div className="text-[22px] font-extrabold leading-tight text-[#2d7e39] md:text-[24px]">
                    {kodePemesanan}
                  </div>

                  <div
                    className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium md:text-[14px] ${
                      isConfirmed
                        ? "border border-[#b7dfb9] bg-[#edf8ee] text-[#2a7f30]"
                        : "border border-[#f1b0ae] bg-[#fff3f2] text-[#cc3a34]"
                    }`}
                  >
                    {isConfirmed ? "Telah Dikonfirmasi" : "Belum Dikonfirmasi"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!isConfirmed}
                  className={`mt-2 flex h-12 w-12 items-center justify-center rounded-[14px] border bg-[#f8f8f8] shadow-[0_2px_10px_rgba(0,0,0,0.10)] transition-transform active:scale-95 md:h-13 md:w-13 ${
                    isConfirmed
                      ? "border-[#bfc6d9] text-[#1d225f] hover:bg-[#f0f0f0]"
                      : "cursor-not-allowed border-[#d8d8d8] text-[#a5a5a5] opacity-70"
                  }`}
                  aria-label="Salin kode pesanan"
                >
                  <Copy className="h-5 w-5 md:h-5.5 md:w-5.5" />
                </button>
              </div>

              {/* ✅ NEW: box kecil status kode */}
              <div
                onClick={handleScrollToConfirm} // ✅ NEW
                className="mt-4 w-fit cursor-pointer rounded-[14px] border border-[#d8d8d8] bg-white px-3 py-2.5 shadow-sm transition hover:bg-[#f8f8f8] md:px-4 md:py-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0 text-[#df7a00]">
                    <LockKeyhole className="h-5 w-5 md:h-5.5 md:w-5.5" />
                  </div>

                  <div className="max-w-[300px] text-[12px] leading-snug text-[#6d6d6d] md:text-[13px]">
                    Kode akan aktif dan dapat disalin setelah anda menekan tombol
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-center gap-2 text-[14px] font-semibold text-[#2f8a3d] md:text-[15px]">
                  <span>Saya Akan Datang</span>
                  <ChevronDown className="h-4.5 w-4.5 md:h-5 md:w-5" />
                </div>
              </div>

              <div className="my-5 h-px bg-[#ededed]" />

              {/* ✅ NEW: total pembayaran */}
              <div>
                <div className="text-[18px] font-normal leading-none text-[#111] md:text-[20px]">
                  Total Pembayaran
                </div>

                <div className="mt-4 text-[22px] font-extrabold text-[#2d7e39] md:text-[24px]">
                  {totalPayment}
                </div>

                <div className="mt-4 text-[14px] leading-snug text-[#8a8a8a] md:text-[15px]">
                  Bayar Tunai Saat Tiba di Lokasi
                  <br />
                  Sebelum Waktu Bermain
                </div>
              </div>

              {/* ✅ NEW: peringatan penting */}
              <div className="mt-6 rounded-[15px] border border-[#efc6c4] bg-[#fef2f2] px-4 py-4 md:px-5 md:py-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <AlertTriangle className="h-7 w-7 shrink-0 text-[#c61f1f] md:h-8 md:w-8" />
                  <div className="text-[18px] font-medium leading-none text-[#c61f1f] md:text-[20px]">
                    Peringatan Penting
                  </div>
                </div>

                <div className="mt-4 space-y-3.5 pl-2 md:pl-7">
                  {warningPoints.map((text) => (
                    <div key={text} className="flex items-start gap-3 md:gap-4">
                      <span className="mt-[8px] h-3.5 w-3.5 shrink-0 rounded-full bg-[#b91c1c]" />
                      <div className="text-[13px] leading-snug text-[#111] md:text-[14px]">
                        {text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ NEW: kartu detail kanan */}
          <div className="rounded-[22px] border border-[#d8d8d8] bg-[#eef3ec] px-4 py-4 shadow-[0_8px_18px_rgba(0,0,0,0.06)] md:px-5 md:py-5">
            <div className="text-[22px] font-medium leading-none text-[#111] md:text-[24px]">
              Detail Pesanan
            </div>

            <div className="mt-5 space-y-6">
              {detailItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex gap-3.5">
                    <Icon className="mt-0.5 h-8 w-8 shrink-0 text-black md:h-9 md:w-9" />
                    <div className="min-w-0">
                      <div className="text-[15px] font-semibold leading-tight text-[#1d1d1d] md:text-[16px]">
                        {item.title}
                      </div>
                      <div className="mt-1 text-[14px] leading-tight text-[#7f7f7f] md:text-[15px]">
                        {item.value}
                      </div>
                      {item.subvalue ? (
                        <div className="text-[14px] leading-tight text-[#7f7f7f] md:text-[15px]">
                          {item.subvalue}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* ✅ NEW: tombol ke halaman pesanan */}
{/* ✅ NEW: tombol ke halaman pesanan, terkunci sebelum konfirmasi */}
<button
  type="button"
  onClick={() => {
    if (!isConfirmed) return; // ✅ NEW
    navigate("/pesanan");
  }}
  disabled={!isConfirmed} // ✅ NEW
  className={`mt-8 flex w-full items-center justify-center rounded-[16px] px-4 py-3 text-[15px] font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.08)] transition md:text-[16px] ${
    isConfirmed
      ? "bg-[#2a7f30] hover:brightness-95 active:scale-[0.99]"
      : "cursor-not-allowed bg-[#9bb69d] opacity-70"
  }`}
>
  CEK PESANAN ANDA
</button>
          </div>
        </div>

        {/* ✅ NEW: tombol konfirmasi bawah */}
        <div className="mt-8 rounded-[22px] border border-[#e4e4e4] bg-white px-4 py-5 shadow-[0_12px_28px_rgba(0,0,0,0.10)] md:px-6 md:py-6">
          <div className="mx-auto max-w-[620px]">
            <button
                ref={confirmButtonRef}
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm} // ✅ NEW
                className={`mx-auto flex w-full max-w-[520px] items-center justify-center rounded-[18px] px-5 py-4 text-[18px] font-semibold text-white shadow-[0_8px_18px_rgba(0,0,0,0.08)] transition-transform md:text-[20px] ${
                  canConfirm
                    ? "bg-[#2a7f30] hover:brightness-95 active:scale-[0.99]"
                    : "cursor-not-allowed bg-[#9bb69d] opacity-70"
                }`}
              >
              Saya Akan Datang
            </button>

            {/* ✅ NEW: syarat yang harus dicentang */}
          <div className="mt-4 space-y-3">
            <label className="flex cursor-pointer items-start gap-3 text-[13px] font-semibold text-[#7b7b7b] md:text-[14px]">
              <input
                type="checkbox"
                checked={agreement.oneHourBefore}
                onChange={(e) =>
                  setAgreement((prev) => ({
                    ...prev,
                    oneHourBefore: e.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 shrink-0 accent-[#2a7f30]"
              />
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#2a7f30]" />
                <span>Konfirmasi Maksimal 1 Jam Sebelum Bermain</span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 text-center text-[13px] font-semibold text-[#7b7b7b] md:text-[14px]">
              <input
                type="checkbox"
                checked={agreement.showToOfficer}
                onChange={(e) =>
                  setAgreement((prev) => ({
                    ...prev,
                    showToOfficer: e.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 shrink-0 accent-[#2a7f30]"
              />
              <span className="flex items-start gap-2 text-left">
                <LockKeyhole className="mt-0.5 h-5 w-5 text-[#2a7f30]" />
                <span>
                  Setelah Konfirmasi, Kode Akan Aktif dan Dapat Disalin Untuk ditunjukkan ke Petugas
                </span>
              </span>
            </label>
          </div>
          </div>
        </div>
      </div>

      {/* ✅ NEW: toast saat copy berhasil */}
      <div
        className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1f7f2f] px-4 py-2.5 text-sm text-white shadow-lg transition-all duration-300 ${
          copied
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        Kode pesanan berhasil disalin
      </div>
    </div>
  );
}