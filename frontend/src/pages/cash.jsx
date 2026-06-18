// src/pages/cash.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
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

// ─── constants ───────────────────────────────────────────────────────────────

const DEFAULT_FIELD = {
  alamat: "Watang Soreang, Kec Soreang, Kota Parepare, Sulawesi Selatan 91132",
};

const DEFAULT_SLOT = {
  tanggal: "2026-04-25",
  jam_mulai: "10:00",
  jam_selesai: "13:00",
  court_no: 1,
};

const DEFAULT_ORDER_CODE      = "BL-250425-001";
const DEFAULT_TOTAL_PRICE     = 150000;
const DEFAULT_DURATION_MINUTES = 180;

// ─── helpers ─────────────────────────────────────────────────────────────────

const rupiah = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const formatDateID = (dateString) => {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
};

const formatTime = (value) => (value ? String(value).slice(0, 5) : "-");

const pad2 = (n) => String(n).padStart(2, "0");

// ─── CourtIcon ───────────────────────────────────────────────────────────────

function CourtIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <rect x="10" y="10" width="44" height="44" rx="4" stroke="currentColor" strokeWidth="3" />
      <path d="M32 10V54" stroke="currentColor" strokeWidth="3" />
      <path d="M10 32H54" stroke="currentColor" strokeWidth="3" />
      <circle cx="32" cy="32" r="7" stroke="currentColor" strokeWidth="3" />
      <path d="M18 20H24" stroke="currentColor" strokeWidth="3" />
      <path d="M40 44H46" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function Cash() {
  const location  = useLocation();
  const navigate  = useNavigate();

  const isDirectFromPesanan = Boolean(location.state?.fromPesanan);

  // ─── FIX: destructuring HARUS di atas semua useEffect yang memakainya ──────
  const {
    field                = DEFAULT_FIELD,
    selectedSlots        = [DEFAULT_SLOT],
    totalPrice           = DEFAULT_TOTAL_PRICE,
    totalDurationMinutes = DEFAULT_DURATION_MINUTES,
    kodePemesanan        = DEFAULT_ORDER_CODE,
    pemesananId,
    statusPemesanan,
    selectedServiceDetails = [],
  } = location.state || {};

  const slot          = selectedSlots?.[0] || DEFAULT_SLOT;
  // ===== NEW CODE =====
  const firstSlot =
    selectedSlots?.[0] || DEFAULT_SLOT;

  const lastSlot =
    selectedSlots?.[
      selectedSlots.length - 1
    ] || DEFAULT_SLOT;
  const totalPayment  = rupiah(totalPrice);
  const durationHours =
  totalDurationMinutes / 60;

  // ─── refs ────────────────────────────────────────────────────────────────────
  const confirmButtonRef = useRef(null);
  const topCardRef       = useRef(null);

  // ─── state ───────────────────────────────────────────────────────────────────
  const [copied,      setCopied]      = useState(false);
  const [timeLeft,    setTimeLeft]    = useState(null);
  const [timerReady,  setTimerReady]  = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(isDirectFromPesanan);
  const [agreement, setAgreement] = useState(
    isDirectFromPesanan
  );

  const canConfirm =
  isDirectFromPesanan || agreement;

  // ─── restore confirmed state dari localStorage ───────────────────────────────
  // Sekarang aman karena kodePemesanan sudah dideklarasikan di atas
  useEffect(() => {
    const saved = localStorage.getItem(`cash_confirmed_${kodePemesanan}`);
    if (saved === "true") setIsConfirmed(true);
  }, [kodePemesanan]);

  useEffect(() => {
    if (isDirectFromPesanan) {
      setAgreement(true);
      setIsConfirmed(true);
    }
  }, [isDirectFromPesanan]);

  // ─── countdown timer ─────────────────────────────────────────────────────────
  /**
   * Hitung deadline pembayaran cash = jam_mulai - 1 jam (WITA UTC+8).
   *
   * Masalah: `new Date("2026-06-14T11:00:00")` tanpa suffix timezone
   * dibaca sebagai LOCAL time browser — jika browser bukan UTC+8,
   * hasilnya meleset beberapa jam.
   *
   * Fix: tambahkan "+08:00" agar selalu diinterpretasikan sebagai WITA,
   * lalu kurangi 1 jam (3.600.000 ms).
   */
  const getCashDeadline = () => {
    if (!slot?.tanggal || !slot?.jam_mulai) return null;

    // Ambil HH:MM saja (buang detik kalau ada)
    const jamStr = String(slot.jam_mulai).slice(0, 5); // "11:00"

    // Parse sebagai WITA (UTC+8) secara eksplisit
    const playTimeWITA = new Date(`${slot.tanggal}T${jamStr}:00+08:00`);

    if (Number.isNaN(playTimeWITA.getTime())) return null;

    // Deadline = 1 jam SEBELUM jam main
    return new Date(playTimeWITA.getTime() - 60 * 60 * 1000);
  };

  // Hitung sisa ms dari sekarang ke deadline (0 jika sudah lewat)
  const calcTimeLeft = () => {
    if (!slot?.tanggal || !slot?.jam_mulai)
      return 0;

    const jamStr = String(
      slot.jam_mulai
    ).slice(0, 5);

    const playTime = new Date(
      `${slot.tanggal}T${jamStr}:00+08:00`
    );

    const timerStart = new Date(
      playTime.getTime() -
        60 * 60 * 1000
    );

    const now = Date.now();

    // BELUM MASUK WAKTU TIMER
    if (
      now <
      timerStart.getTime()
    ) {
      return null;
    }

    // SUDAH LEWAT WAKTU BERMAIN
    if (now >= playTime.getTime()) {
      return 0;
    }

    return playTime.getTime() - now;
  };

  useEffect(() => {
    if (!isConfirmed) return;

    // Set langsung agar tampil angka benar sebelum interval pertama
    const initial = calcTimeLeft();
    setTimeLeft(initial);
    setTimerReady(true);

    if (initial === 0) return; // sudah lewat, tidak perlu interval

    const interval = setInterval(() => {
      const remaining = calcTimeLeft();
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, slot?.tanggal, slot?.jam_mulai]);

  const hours   = pad2(Math.floor(timeLeft / 3_600_000));
  const minutes = pad2(Math.floor((timeLeft % 3_600_000) / 60_000));
  const seconds = pad2(Math.floor((timeLeft % 60_000) / 1_000));

  // isExpired hanya true jika timer sudah siap DAN habis (bukan saat inisialisasi 0)
  const isExpired = false;
  
  const playTime = slot?.tanggal &&
                 slot?.jam_mulai
  ? new Date(
      `${slot.tanggal}T${String(
        slot.jam_mulai
      ).slice(0, 5)}:00+08:00`
    )
  : null;

const timerStart = playTime
  ? new Date(
      playTime.getTime() -
        60 * 60 * 1000
    )
  : null;

const timerNotStarted =
  timerStart &&
  Date.now() <
    timerStart.getTime();

  // ─── handlers ────────────────────────────────────────────────────────────────
  const handleScrollToConfirm = () => {
    confirmButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    confirmButtonRef.current?.focus();
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    setIsConfirmed(true);
    localStorage.setItem(`cash_confirmed_${kodePemesanan}`, "true");
    setTimeout(() => {
      topCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  const handleCopy = async () => {
    if (!isConfirmed) return;
    try {
      await navigator.clipboard.writeText(kodePemesanan);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  // ─── detail items ─────────────────────────────────────────────────────────────
  const detailItems = useMemo(
    () => [
      {
        icon: CalendarDays,
        title: "Tanggal & Waktu",
        value: formatDateID(
          firstSlot.tanggal
        ),

        subvalue: `${formatTime(
          firstSlot.jam_mulai
        )} - ${formatTime(
          lastSlot.jam_selesai
        )}`,
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

  // ─── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f8f5] text-[#111]">
      <div className="mx-auto max-w-[1240px] px-4 py-6 md:px-6 md:py-8">

        {/* brand */}
        <div className="-mt-3 mb-7 flex items-center gap-[1px] text-[32px] font-extrabold leading-none tracking-tight">
          <span>Book</span>
          <span className="text-[#2f8a3d]">Lap</span>
        </div>

        {/* ── BANNER STATUS ── */}
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
                  Terima Kasih! Pesanan Anda Telah Berhasil Dibuat. Silahkan Datang ke Lokasi dan Lakukan Pembayaran
                </p>
              </div>
            </div>

            {/* timer */}
            <div className="w-full shrink-0 rounded-[14px] border border-[#b8c1b8] bg-[#eef3ec] px-4 py-3 shadow-sm lg:w-[270px]">
              <div className="text-[13px] font-semibold text-[#7f7f7f] md:text-[14px]">Status Pesanan</div>
              <div className="mt-2 flex items-center gap-3">
                <Clock3 className={`h-7 w-7 shrink-0 ${isExpired ? "text-red-500" : "text-[#d97706]"}`} />
                <div className="flex flex-col">
                  <div className={`text-[15px] font-medium ${isExpired ? "text-red-500" : "text-[#d97706]"}`}>
                    {
                      statusPemesanan ===
                      "sudah_bayar"
                        ? "Sudah Dibayar"
                        : statusPemesanan ===
                          "expired"
                          ? "Expired"
                          : "Menunggu Kedatangan"
                    }
                  </div>
                  {
                  isConfirmed &&
                  timerNotStarted && (
                    <div className="mt-1 text-[13px] text-[#666]">
                      Timer aktif 1 jam sebelum bermain
                    </div>
                  )}

                  {
                  isConfirmed &&
                  timeLeft !== null &&
                  !timerNotStarted &&
                  statusPemesanan ===
                    "menunggu_kedatangan" && (
                    <div className="mt-1 text-[20px] font-extrabold tracking-widest text-[#d97706]">
                      {hours}:{minutes}:{seconds}
                    </div>
                  )}
                  {isConfirmed && !timerReady && (
                    <div className="mt-1 text-[13px] text-[#9a9a9a]">Memuat timer…</div>
                  )}
                  {!isConfirmed && (
                    <div className="mt-1 text-[12px] text-[#9a9a9a]">
                      Konfirmasi terlebih dahulu
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[2.05fr_1fr] lg:gap-3.5">

          {/* LEFT CARD */}
          <div
            ref={topCardRef}
            className="overflow-hidden rounded-[22px] border border-[#e0e0e0] bg-white shadow-[0_10px_28px_rgba(0,0,0,0.08)]"
          >
            <div className="px-5 pb-5 pt-5 md:px-6 md:pb-6 md:pt-6">

              {/* kode pesanan */}
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
                    {isConfirmed ? "✓ Telah Dikonfirmasi" : "Belum Dikonfirmasi"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!isConfirmed}
                  className={`mt-2 flex h-12 w-12 items-center justify-center rounded-[14px] border bg-[#f8f8f8] shadow-[0_2px_10px_rgba(0,0,0,0.10)] transition-transform active:scale-95 ${
                    isConfirmed
                      ? "border-[#bfc6d9] text-[#1d225f] hover:bg-[#f0f0f0]"
                      : "cursor-not-allowed border-[#d8d8d8] text-[#a5a5a5] opacity-60"
                  }`}
                  aria-label="Salin kode pesanan"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>

              {/* hint scroll to confirm */}
              {!isConfirmed && (
                <div
                  onClick={handleScrollToConfirm}
                  className="mt-4 w-fit cursor-pointer rounded-[14px] border border-[#d8d8d8] bg-white px-3 py-2.5 shadow-sm transition hover:bg-[#f8f8f8] md:px-4 md:py-3"
                >
                  <div className="flex items-start gap-2.5">
                    <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[#df7a00]" />
                    <div className="max-w-[300px] text-[12px] leading-snug text-[#6d6d6d] md:text-[13px]">
                      Kode akan aktif dan dapat disalin setelah anda menekan tombol
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2 text-[14px] font-semibold text-[#2f8a3d] md:text-[15px]">
                    <span>Saya Akan Datang</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              )}

              <div className="my-5 h-px bg-[#ededed]" />

              {/* total pembayaran */}
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

              {/* warning */}
              <div className="mt-6 rounded-[15px] border border-[#efc6c4] bg-[#fef2f2] px-4 py-4 md:px-5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-7 w-7 shrink-0 text-[#c61f1f]" />
                  <div className="text-[18px] font-medium leading-none text-[#c61f1f] md:text-[20px]">
                    Peringatan Penting
                  </div>
                </div>
                <div className="mt-4 space-y-3.5 pl-2 md:pl-7">
                  {warningPoints.map((text) => (
                    <div key={text} className="flex items-start gap-3">
                      <span className="mt-[8px] h-3.5 w-3.5 shrink-0 rounded-full bg-[#b91c1c]" />
                      <div className="text-[13px] leading-snug text-[#111] md:text-[14px]">{text}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT CARD — detail pesanan */}
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
              {/* ===== NEW CODE ===== */}
              {selectedServiceDetails.length > 0 && (
                <div className="border-t border-[#d7d7d7] pt-5">
                  <div className="mb-3 text-[16px] font-semibold text-[#111]">
                    Layanan Tambahan
                  </div>

                  <div className="space-y-2">
                    {selectedServiceDetails.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-[14px]"
                      >
                        <span>
                          {item.nama_layanan || item.layanan?.nama_layanan || "-"} x {item.qty}
                        </span>

                        <span className="font-medium">
                          Rp {Number(item.subtotal || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => { if (isConfirmed) navigate("/pesanan"); }}
              disabled={!isConfirmed}
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

        {/* ── CONFIRM SECTION ── */}
        <div className="mt-8 rounded-[22px] border border-[#e4e4e4] bg-white px-4 py-5 shadow-[0_12px_28px_rgba(0,0,0,0.10)] md:px-6 md:py-6">
          <div className="mx-auto max-w-[620px]">
            <button
              ref={confirmButtonRef}
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`mx-auto flex w-full max-w-[520px] items-center justify-center rounded-[18px] px-5 py-4 text-[18px] font-semibold text-white shadow-[0_8px_18px_rgba(0,0,0,0.08)] transition-transform md:text-[20px] ${
                canConfirm
                  ? "bg-[#2a7f30] hover:brightness-95 active:scale-[0.99]"
                  : "cursor-not-allowed bg-[#9bb69d] opacity-70"
              }`}
            >
              {isConfirmed ? "✓ Sudah Dikonfirmasi" : "Saya Akan Datang"}
            </button>

          <div className="mt-4">
            <label className="flex cursor-pointer items-start gap-3 text-[13px] font-semibold text-[#7b7b7b] md:text-[14px]">

              <input
                type="checkbox"
                checked={agreement}
                onChange={(e) =>
                  setAgreement(e.target.checked)
                }
                disabled={isConfirmed}
                className="mt-1 h-4 w-4 shrink-0 accent-[#2a7f30]"
              />

              <span className="flex items-start gap-2 text-left">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-[#2a7f30]" />

                <span>
                  Saya menyetujui untuk datang maksimal 1 jam sebelum jadwal bermain.
                  Setelah konfirmasi, kode pesanan akan aktif dan dapat disalin untuk
                  ditunjukkan kepada petugas saat melakukan pembayaran.
                </span>
              </span>

            </label>
          </div>
          </div>
        </div>

      </div>

      {/* toast copy */}
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
