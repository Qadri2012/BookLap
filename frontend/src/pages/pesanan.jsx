// src/pages/pesanan.jsx
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import {
  ChevronDown,
  CalendarDays,
  MapPin,
  Clock3,
  Grid2x2,
  CreditCard,
  Hash,
  Wallet,
  User,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_MAP = {
  menunggu_pembayaran: {
    label: "Menunggu Pembayaran",
    color: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    border: "border-l-amber-400",
    dot: "bg-amber-400",
    icon: Timer,
  },
  menunggu_kedatangan: {
    label: "Menunggu Kedatangan",
    color: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    border: "border-l-sky-400",
    dot: "bg-sky-400",
    icon: AlertCircle,
  },
  selesai: {
    label: "Selesai",
    color: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    border: "border-l-emerald-500",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  dibatalkan: {
    label: "Pembatalan Berhasil",
    color: "bg-red-50 text-red-600 ring-1 ring-red-200",
    border: "border-l-red-400",
    dot: "bg-red-400",
    icon: CheckCircle2,
  },
  permintaan_pembatalan: {
    label: "Pengajuan Batal",
    color: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
    border: "border-l-orange-400",
    dot: "bg-orange-400",
    icon: XCircle,
  },
  sudah_bayar: {
    label: "Sudah Bayar",
    color:
      "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    border:
      "border-l-blue-400",
    dot: "bg-blue-500",
    icon: CheckCircle2,
  },
  expired: {
    label: "Expired",
    color: "bg-red-50 text-red-700 ring-1 ring-red-200",
    border: "border-l-red-500",
    dot: "bg-red-500",
    icon: XCircle,
  },
};

const getStatus = (raw = "") => STATUS_MAP[raw] || {
  label: raw.replace(/_/g, " "),
  color: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  border: "border-l-slate-300",
  dot: "bg-slate-400",
  icon: AlertCircle,
};

const BANK_LABEL_BY_PREFIX = {
  "009": "BNI",
  "002": "BRI",
  "008": "Mandiri",
  "451": "BSI",
};

// ===== NEW CODE TIMER =====
const getRemainingTime = (expiresAt) => {
  if (!expiresAt) return null;

  const diff =
    new Date(expiresAt).getTime() -
    Date.now();

  if (diff <= 0) {
    return "00:00:00";
  }

  const hours = String(
    Math.floor(diff / 3600000)
  ).padStart(2, "0");

  const minutes = String(
    Math.floor(
      (diff % 3600000) / 60000
    )
  ).padStart(2, "0");

  const seconds = String(
    Math.floor(
      (diff % 60000) / 1000
    )
  ).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};
const getCashRemainingTime = (
  item
) => {

  if (
    item.payment_channel !== "cash"
  ) {
    return null;
  }

  if (
    item.status_pemesanan !==
    "menunggu_kedatangan"
  ) {
    return null;
  }

  const firstSlot =
    item.detail_pemesanan?.[0];

  if (!firstSlot) {
    return null;
  }

  const playTime =
    new Date(
      `${firstSlot.tanggal}T${String(
        firstSlot.jam_mulai
      ).slice(0, 5)}:00+08:00`
    );

  const timerStart =
    new Date(
      playTime.getTime() -
        60 * 60 * 1000
    );

  const now = Date.now();

  if (
    now <
    timerStart.getTime()
  ) {
    return null;
  }

  const diff =
    playTime.getTime() -
    now;

  if (diff <= 0) {
    return "00:00:00";
  }

  const hours = String(
    Math.floor(diff / 3600000)
  ).padStart(2, "0");

  const minutes = String(
    Math.floor(
      (diff % 3600000) /
        60000
    )
  ).padStart(2, "0");

  const seconds = String(
    Math.floor(
      (diff % 60000) / 1000
    )
  ).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};
const canCancelCashBooking = (
  item
) => {

  if (
    item.payment_channel !== "cash"
  ) {
    return false;
  }

  if (
    item.status_pemesanan !==
    "menunggu_kedatangan"
  ) {
    return false;
  }

  const firstSlot =
    item.detail_pemesanan?.[0];

  if (!firstSlot) {
    return false;
  }

  const playTime =
    new Date(
      `${firstSlot.tanggal}T${String(
        firstSlot.jam_mulai
      ).slice(0, 5)}:00+08:00`
    );

  const timerStart =
    new Date(
      playTime.getTime() -
      60 * 60 * 1000
    );

  return (
    Date.now() <
    timerStart.getTime()
  );
};

function getPaymentMethodLabel(item) {
  const channel = String(item.payment_channel || "").toLowerCase();
  const va = String(item.va_number || "");
  if (channel === "bank") {
    const prefix = va.slice(0, 3);
    return `${BANK_LABEL_BY_PREFIX[prefix] || "Transfer Bank"} Virtual Account`;
  }
  if (channel === "ewallet") return "E-Wallet";
  if (channel === "minimarket") return "Indomaret";
  if (channel === "cash") return "Cash di Tempat";
  return "-";
}

// ─── sub-components ──────────────────────────────────────────────────────────

function PaymentChip({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon size={12} />
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-bold text-slate-800 break-all leading-snug">{value}</p>
    </div>
  );
}

function DetailField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#16a34a]/10">
        <Icon size={15} className="text-[#16a34a]" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-800 leading-snug">{value || "-"}</p>
      </div>
    </div>
  );
}

function BookingInfoItem({ icon: Icon, title, children }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#16a34a]/10">
        <Icon size={17} className="text-[#16a34a]" strokeWidth={2} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <div className="mt-0.5 space-y-0.5">{children}</div>
      </div>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function Pesanan() {
  const [cancelingId, setCancelingId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [expandedCardId, setExpandedCardId] = useState(null);
  const navigate = useNavigate();

  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  // ===== NEW CODE TIMER =====
const [, forceUpdate] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    forceUpdate((v) => v + 1);
  }, 1000);

  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    const fetchPesanan = async () => {
      try {
        if (!user?.id) { setLoading(false); return; }
        const response = await api.get(`/pemesanan/user/${user.id}`);
        const activeOrders = (Array.isArray(response.data)
          ? response.data
          : []
        ).filter(
          (item) =>
            ![
              "selesai",
              "dibatalkan",
              "expired",
            ].includes(item.status_pemesanan)
        );
        setPesanan(activeOrders);
      } catch (error) {
        console.error("Gagal mengambil pesanan:", error);
        setPesanan([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPesanan();
  }, [user?.id]);

  const getBankCodeFromVA = (va = "") => {
    const prefix = String(va).slice(0, 3);
    if (prefix === "009") return "bni";
    if (prefix === "002") return "bri";
    if (prefix === "008") return "mandiri";
    if (prefix === "451") return "bsi";
    return "";
  };

const handleOpenPaymentPage = (item) => {
  const channel = String(item.payment_channel || "").toLowerCase();

  if (channel === "cash") {
    navigate("/cash", {
      state: {
        pemesananId: item.id,
        kodePemesanan: item.kode_pemesanan,

        // ✅ UBAH: dari item.field → item.lapangan
        field: item.lapangan || item.field || {
          alamat: item.alamat_lapangan || "-",
        },

        // ✅ UBAH: court_no dari nomor_lapangan
        selectedSlots: Array.isArray(item.detail_pemesanan)
          ? item.detail_pemesanan.map((d) => ({
              tanggal: d.tanggal,
              jam_mulai: d.jam_mulai,
              jam_selesai: d.jam_selesai,
              court_no: d.nomor_lapangan || d.court_no || 1,
            }))
          : [],

        totalPrice: item.total_bayar,
        totalDurationMinutes: item.total_durasi_menit,
        paymentMethod: "cash",
        namaPemesan: item.nama_pemesan,
        emailPemesan: item.email,
        noWhatsapp: item.no_whatsapp,
        fromPesanan: true,
        paymentConfirmedAt: item.confirmed_arrival_at,
        statusPemesanan: item.status_pemesanan,

        // ✅ UBAH: mapping detail_layanan dengan nama_layanan
        selectedServiceDetails: Array.isArray(item.detail_layanan)
          ? item.detail_layanan.map((d) => ({
              id: d.layanan_id || d.id,
              nama_layanan: d.layanan?.nama_layanan || d.nama_layanan || "-",
              qty: d.qty,
              harga_satuan: d.harga_satuan,
              subtotal: d.subtotal,
            }))
          : [],
      },
    });
    return;
  }

  localStorage.setItem("pemesananId", item.id);
  navigate("/transfer", {
    state: {
      selectedSlots: item.detail_pemesanan || [],
      field: item.lapangan || {},            // ✅ UBAH: item.lapangan
      totalDurationMinutes: item.total_durasi_menit,
      pemesananId: item.id,
      totalPrice: item.total_bayar,
      selectedTransferMethod: getBankCodeFromVA(item.va_number),
      vaNumber: item.va_number,
      paymentReference: item.payment_reference,
      paymentChannel: item.payment_channel,
      namaPemesan: item.nama_pemesan,
      emailPemesan: item.email,
      noWhatsapp: item.no_whatsapp,
      paymentExpiresAt: item.payment_expires_at,
      // ✅ TAMBAH: kirim selectedServiceDetails ke transfer juga
      selectedServiceDetails: Array.isArray(item.detail_layanan)
        ? item.detail_layanan.map((d) => ({
            id: d.layanan_id || d.id,
            nama_layanan: d.layanan?.nama_layanan || d.nama_layanan || "-",
            qty: d.qty,
            harga_satuan: d.harga_satuan,
            subtotal: d.subtotal,
          }))
        : [],
    },
  });
};

const handleSubmitCancellation = async (
  item
) => {
  if (!cancelReason.trim()) {
    alert(
      "Alasan pembatalan wajib diisi"
    );
    return;
  }

  try {
    setCancelLoading(true);

    const response =
      await api.patch(
        `/pemesanan/${item.id}/ajukan-pembatalan`,
        {
          alasan_batal:
            cancelReason.trim(),
        }
      );

    alert(
      response.data.message ||
      "Permintaan pembatalan berhasil dikirim"
    );

    setCancelReason("");
    setCancelingId(null);

    const refresh =
      await api.get(
        `/pemesanan/user/${user.id}`
      );

    const activeOrders = (
      Array.isArray(refresh.data)
        ? refresh.data
        : []
    ).filter(
      (item) =>
        ![
          "selesai",
          "dibatalkan",
          "expired",
        ].includes(item.status_pemesanan)
    );

    setPesanan(activeOrders);

  } catch (error) {

    console.error(
      "ERROR PEMBATALAN =",
      error
    );

    alert(
      error?.response?.data?.message ||
      "Gagal mengajukan pembatalan"
    );

  } finally {
    setCancelLoading(false);
  }
};

  return (
    <div className="bg-[#f0f4f8] min-h-screen font-sans">

      {/* ── HERO ── */}
      <section className="relative w-full h-[46vh] md:h-[52vh] flex items-center overflow-hidden rounded-b-[40px]">
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=2400&q=100"
          alt="Lapangan futsal"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="relative z-10 px-6 sm:px-12 lg:px-16 text-white mt-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/50 mb-2">BookLap</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
            Pesanan <span className="text-[#4ade80]">Anda</span>
          </h1>
          <p className="mt-3 text-white/60 max-w-md text-sm leading-relaxed">
            Kelola dan lihat riwayat pemesanan lapangan Anda dengan mudah.
          </p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 rounded-full border-2 border-[#16a34a] border-t-transparent animate-spin" />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && pesanan.length === 0 && (
          <div className="text-center py-24 relative">
            <img
              src="/logo.png"
              alt="bg"
              className="absolute left-1/2 -translate-x-1/2 top-10 w-[400px] opacity-[0.06] pointer-events-none select-none"
            />
            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#16a34a]/10">
                <Grid2x2 size={36} className="text-[#16a34a]" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Belum Ada Pesanan</h2>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                Anda belum memiliki pesanan apapun.<br />
                Yuk mulai booking lapangan favoritmu sekarang!
              </p>
              <a
                href="/lapangan"
                className="inline-block bg-[#16a34a] hover:bg-[#15803d] text-white px-8 py-3 rounded-xl font-semibold shadow-md transition-colors"
              >
                Pesan Lapangan Sekarang
              </a>
            </div>
          </div>
        )}

        {/* ── LIST PESANAN ── */}
        {!loading && pesanan.length > 0 && (
          <div className="space-y-4 py-8">
            {pesanan.map((item) => {
              // console.log("ITEM PESANAN =", item);
              console.log(
  JSON.stringify(item, null, 2)
);
console.log("TOTAL DURASI =", item.total_durasi_menit);
console.log("DETAIL =", item.detail_pemesanan);
              const isOpen = expandedCardId === item.id;
              const st = getStatus(item.status_pemesanan);
              const StatusIcon = st.icon;
              const paymentCode =
                item.va_number || item.payment_reference || item.kode_pemesanan || "-";
              const details = item.detail_pemesanan || [];
              const firstDetail = details[0] || {};
              const lastDetail =
                details[details.length - 1] || {};
              // ===== NEW CODE =====
              const layananTambahan =
                item.detail_layanan || [];

              return (
                <div
                  key={item.id}
                  className={`relative rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 border-l-4 overflow-hidden transition-shadow hover:shadow-md ${st.border}`}
                >
                  {/* ── WATERMARK ── */}
                  <div
                    className="pointer-events-none select-none absolute inset-0 z-0 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <img
                      src="/logo2.png"
                      alt=""
                      className="w-[72%] max-w-[420px] min-w-[260px] object-contain"
                      style={{
                        opacity: 0.09,
                        filter: "grayscale(100%) contrast(1.6) brightness(0.7)",
                        transform: "rotate(-8deg) scale(1.05)",
                      }}
                    />
                  </div>
                  {/* ── CARD HEADER ── */}
                  <button
                    type="button"
                    onClick={() => setExpandedCardId(isOpen ? null : item.id)}
                    className="relative z-10 w-full text-left px-5 pt-5 pb-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                          Kode Pemesanan
                        </p>
                        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight truncate">
                          {item.kode_pemesanan || item.va_number || item.payment_reference}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 truncate">
                          {item.nama_pemesan}
                          <span className="mx-1.5 text-slate-300">·</span>
                          {item.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* ===== NEW CODE TIMER ===== */}
                        {
                          item.payment_channel !==
                            "cash" &&
                          item.status_pemesanan ===
                            "menunggu_pembayaran" &&
                          item.payment_expires_at && (
                            <div className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5">
                              <Timer
                                size={13}
                                className="text-orange-500"
                              />
                              <span className="text-xs font-bold text-orange-600">
                                {getRemainingTime(
                                  item.payment_expires_at
                                )}
                              </span>
                            </div>
                        )}
                        {
                          item.payment_channel ===
                            "cash" &&
                          item.status_pemesanan ===
                            "menunggu_kedatangan" &&
                          getCashRemainingTime(
                            item
                          ) && (
                            <div className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5">

                              <Timer
                                size={13}
                                className="text-orange-500"
                              />

                              <span className="text-xs font-bold text-orange-600">
                                {
                                  getCashRemainingTime(
                                    item
                                  )
                                }
                              </span>
                            </div>
                          )
                        }
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${st.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
                        />
                      </div>
                    </div>
                  </button>

                  {/* ── PAYMENT ROW ── */}
                  <div className="relative z-10 px-5 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <PaymentChip
                      icon={CreditCard}
                      label="Metode Pembayaran"
                      value={getPaymentMethodLabel(item)}
                    />
                    <PaymentChip
                      icon={Hash}
                      label={item.payment_channel === "bank" ? "Nomor VA" : "Kode Bayar"}
                      value={paymentCode}
                    />
                    <PaymentChip
                      icon={Wallet}
                      label="Total Bayar"
                      value={`Rp ${Number(item.total_bayar || 0).toLocaleString("id-ID")}`}
                    />
                  </div>

                  {/* ── ACTION ROW ── */}
                  <div className="relative z-10 px-5 pb-5 flex items-center justify-between gap-3 flex-wrap">
                    {(
                        [
                          "menunggu_pembayaran",
                          "sudah_bayar",
                        ].includes(
                          item.status_pemesanan
                        )
                        ||
                        canCancelCashBooking(item)
                      ) && (
                      <button
                        type="button"
                        onClick={() => setCancelingId(cancelingId === item.id ? null : item.id)}
                        className="text-xs font-semibold px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Ajukan Pembatalan
                      </button>
                    )}
                    <div className="ml-auto">
                      <button
                        type="button"
                        onClick={() => handleOpenPaymentPage(item)}
                        className="rounded-xl bg-[#16a34a] hover:bg-[#15803d] px-5 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm"
                      >
                        {String(item.payment_channel || "").toLowerCase() === "cash"
                          ? "Lihat Pembayaran Cash"
                          : "Lihat Detail Pembayaran"}
                      </button>
                    </div>
                  </div>

                  {/* ── CANCEL FORM ── */}
                  {cancelingId === item.id &&
                    (
                      [
                        "menunggu_pembayaran",
                        "sudah_bayar",
                      ].includes(
                        item.status_pemesanan
                      )
                      ||
                      canCancelCashBooking(item)
                    )
                    && (
                    <div className="relative z-10 mx-5 mb-5 rounded-xl border border-red-100 bg-red-50 p-4">
                      <p className="mb-2 text-sm font-semibold text-red-700">Alasan Pembatalan</p>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Tulis alasan pembatalan..."
                        className="min-h-[90px] w-full rounded-xl border border-red-200 bg-white p-3 text-sm outline-none focus:border-red-400 resize-none"
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setCancelingId(null); setCancelReason(""); }}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const confirmCancel = window.confirm(
                              "Apakah Anda yakin ingin membatalkan pesanan ini?\n\nPembatalan yang sudah dikirim tidak dapat dibatalkan kembali."
                            );

                            if (confirmCancel) {
                              handleSubmitCancellation(item);
                            }
                          }}
                          disabled={cancelLoading || !cancelReason.trim()}
                          className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition-colors"
                        >
                          {cancelLoading ? "Mengirim…" : "Kirim Pembatalan"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── EXPANDED DETAIL ── */}
                  {isOpen && (
                    <div className="relative z-10 border-t border-slate-100 px-5 py-5 space-y-5">

                      {/* Pemesan Info */}
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                          Detail Pemesan
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <DetailField icon={User} label="Nama Pemesan" value={item.nama_pemesan} />
                          <DetailField icon={Mail} label="Email" value={item.email} />
                          <DetailField icon={Phone} label="No WhatsApp" value={item.no_whatsapp} />
                          <DetailField
                            icon={StatusIcon}
                            label="Status Kedatangan"
                            value={item.status_kedatangan || "-"}
                          />
                        </div>
                      </div>

                      {/* Booking Info */}
                      <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-100 p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">
                          Informasi Booking
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <BookingInfoItem icon={CalendarDays} title="Tanggal & Waktu">
                            <p className="text-sm font-semibold text-slate-800">
                              {firstDetail.tanggal || "-"}
                            </p>
                            <p className="text-sm text-slate-600">
                               {firstDetail.jam_mulai?.slice(0, 5) || "-"} – {lastDetail.jam_selesai?.slice(0, 5) || "-"}
                            </p>
                          </BookingInfoItem>

                          <BookingInfoItem icon={Grid2x2} title="Lapangan">
                          <p className="text-sm font-semibold text-slate-800">
                            {firstDetail.nama_lapangan ||
                              item.lapangan?.nama ||
                              item.field?.nama ||
                              "-"}
                          </p>
                        </BookingInfoItem>

                          <BookingInfoItem icon={Clock3} title="Durasi Bermain">
                            <p className="text-sm font-semibold text-slate-800">
                              {Math.floor(Number(item.total_durasi_menit || 0) / 60)} Jam
                            </p>
                          </BookingInfoItem>

                          <BookingInfoItem icon={MapPin} title="Lokasi">
                            <p className="text-sm font-semibold text-slate-800 leading-snug">
                              {item.lapangan?.alamat || item.alamat_lapangan || item.field?.alamat || "-"}
                            </p>
                          </BookingInfoItem>
                        </div>
                        {/* ===== NEW CODE : LAYANAN TAMBAHAN ===== */}
                        {layananTambahan.length > 0 && (
                          <div className="mt-5 border-t border-slate-200 pt-4">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                              Layanan Tambahan
                            </p>

                            <div className="space-y-2">
                              {layananTambahan.map((layanan) => (
                                <div
                                  key={layanan.id}
                                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-slate-100"
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                      {layanan.layanan?.nama_layanan || "-"}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                      Qty: {layanan.qty}
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <p className="text-sm font-bold text-[#16a34a]">
                                      Rp{" "}
                                      {Number(
                                        layanan.subtotal || 0
                                      ).toLocaleString("id-ID")}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                              <span className="text-sm font-semibold text-slate-700">
                                Total Layanan
                              </span>

                              <span className="text-sm font-bold text-[#16a34a]">
                                Rp{" "}
                                {Number(
                                  item.subtotal_layanan || 0
                                ).toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── HOW TO ORDER ── */}
        <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-slate-100 mb-20 mt-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#16a34a]/5 via-white to-white pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-center text-slate-900 mb-1">
              Cara Melakukan Pemesanan
            </h3>
            <p className="text-center text-slate-400 mb-8 text-sm">
              Empat langkah mudah untuk booking lapangan
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { emoji: "⚽", step: "Pilih", desc: "Pilih lapangan & jadwal" },
                { emoji: "📋", step: "Konfirmasi", desc: "Cek detail pesanan" },
                { emoji: "💳", step: "Bayar", desc: "Lakukan pembayaran" },
                { emoji: "✅", step: "Selesai", desc: "Pesanan terkonfirmasi" },
              ].map((s, i) => (
                <div key={s.step} className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div
                      style={{ opacity: 1 - i * 0.15 }}
                      className="w-14 h-14 bg-[#16a34a] rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                    >
                      {s.emoji}
                    </div>
                    {i < 3 && (
                      <div className="hidden md:block absolute top-7 left-[calc(100%+4px)] w-[calc(100vw/4-60px)] h-px bg-slate-200" />
                    )}
                  </div>
                  <p className="mt-3 font-semibold text-slate-800 text-sm">{s.step}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
