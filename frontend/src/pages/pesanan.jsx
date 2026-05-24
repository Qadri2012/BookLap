import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { ChevronDown } from "lucide-react";

// ✅ NEW: Modern Booking Summary Cards
function SummaryCard({ title, value, subtitle, icon: Icon, accent }) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-[24px] border p-5 sm:p-6 transition-all duration-300",
        "bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(16,24,40,0.08)]",
        "hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(16,24,40,0.12)]",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          accent.bg,
        ].join(" ")} 
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {title}
          </p>

          <div className="mt-3 flex items-end gap-2">
            <span className={`text-4xl font-extrabold tracking-tight ${accent.text}`}>
              {value}
            </span>
          </div>

          {subtitle && (
            <p className="mt-2 text-sm leading-5 text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={[
            "flex h-14 w-14 items-center justify-center rounded-2xl border shadow-sm",
            "bg-white/90 border-white/70",
          ].join(" ")}
        >
          <Icon className={`h-7 w-7 ${accent.icon}`} strokeWidth={2.2} />
        </div>
      </div>

      <div className="relative z-10 mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full w-2/3 rounded-full ${accent.bar}`} />
      </div>
    </div>
  );
}

function InfoBox({ title, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="mt-1 break-words font-bold text-gray-800">{value}</p>
    </div>
  );
}

const BANK_LABEL_BY_PREFIX = {
  "009": "BNI",
  "002": "BRI",
  "008": "Mandiri",
  "451": "BSI",
};

function getPaymentMethodLabel(item) {
  const channel = String(item.payment_channel || "").toLowerCase();
  const va = String(item.va_number || "");

  if (channel === "bank") {
    const prefix = va.slice(0, 3);
    const bankName = BANK_LABEL_BY_PREFIX[prefix] || "Transfer Bank";
    return `${bankName} Virtual Account`;
  }

  if (channel === "ewallet") return "E-Wallet";
  if (channel === "minimarket") return "Indomaret";
  if (channel === "cash") return "Cash di Tempat";

  return "-";
}

export default function Pesanan() {
  const [cancelingId, setCancelingId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  // ✅ NEW: ambil user login
  const user = JSON.parse(localStorage.getItem("user"));
  const [expandedCardId, setExpandedCardId] = useState(null);
  const navigate = useNavigate();

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

  // ✅ CASH
  // ✅ NEW: navigasi ke cash tanpa variabel yang belum didefinisikan
if (channel === "cash") {
  navigate("/cash", {
    state: {
      pemesananId: item.id,
      kodePemesanan: item.kode_pemesanan,
      field: item.field || {
        alamat: item.alamat_lapangan || item.alamat || "-",
      },
      selectedSlots: Array.isArray(item.detail_pemesanan)
        ? item.detail_pemesanan.map((detail) => ({
            tanggal: detail.tanggal,
            jam_mulai: detail.jam_mulai,
            jam_selesai: detail.jam_selesai,
            court_no: detail.court_no || detail.no_lapangan || 1,
          }))
        : [],
      totalPrice: item.total_bayar,
      totalDurationMinutes: item.total_durasi_menit,
      paymentMethod: "cash",
      namaPemesan: item.nama_pemesan,
      emailPemesan: item.email,
      noWhatsapp: item.no_whatsapp,
      fromPesanan: true,
    },
  });

  return;
}

  // ✅ TRANSFER / E-WALLET / MINIMARKET
  navigate("/transfer", {
    state: {
      pemesananId: item.id,

      totalPrice: item.total_bayar,

      selectedTransferMethod:
        getBankCodeFromVA(item.va_number),

      vaNumber: item.va_number,

      paymentReference: item.payment_reference,

      paymentChannel: item.payment_channel,

      namaPemesan: item.nama_pemesan,
      emailPemesan: item.email,
      noWhatsapp: item.no_whatsapp,
    },
  });
};
  // ✅ NEW: state data pesanan
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  // ✅ NEW: fetch pesanan user
  useEffect(() => {
    const fetchPesanan = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }

        const response = await api.get(`/pemesanan/user/${user.id}`);

        setPesanan(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Gagal mengambil pesanan:", error);
        setPesanan([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPesanan();
  }, [user?.id]);
  

  const totalPesanan = pesanan.length;
  const menungguBayar = pesanan.filter(
    (item) => item.status_pemesanan === "menunggu_pembayaran"
  ).length;

  const menungguKedatangan = pesanan.filter(
    (item) => item.status_pemesanan === "menunggu_kedatangan"
  ).length;

const handleSubmitCancellation = async (item) => {
  if (!cancelReason.trim()) return;

  try {
    setCancelLoading(true);

    await api.patch(`/pemesanan/${item.id}/status`, {
      status_pemesanan: "permintaan_pembatalan",
      alasan_batal: cancelReason.trim(),
    });

    setCancelReason("");
    setCancelingId(null);

    const response = await api.get(`/pemesanan/user/${user.id}`);
    setPesanan(Array.isArray(response.data) ? response.data : []);
  } catch (error) {
    console.error("Gagal ajukan pembatalan:", error);
  } finally {
    setCancelLoading(false);
  }
};


  return (
    <div className="bg-[#f5f5f5] min-h-screen font-sans">
      {/* ✅ NAVBAR */}

      {/* 🔥 HERO BARU (SUDAH FIX & RESPONSIVE) */}
      <section className="relative w-full h-[50vh] md:h-[60vh] flex items-center overflow-hidden rounded-b-[50px]">
        {/* Background */}
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=2400&q=100"
          alt="Lapangan futsal"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 px-6 sm:px-10 lg:px-16 text-white mt-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">
            Pesanan <span className="text-green-400">Anda</span>
          </h1>

          <p className="mt-4 text-white/70 max-w-md">
            Kelola dan lihat riwayat pemesanan lapangan Anda dengan mudah dan cepat.
          </p>
        </div>
      </section>

   
   

      {/* ✅ CONTENT */}
      <div className="max-w-5xl mx-auto px-6">
        {/* EMPTY STATE */}
        {!loading && pesanan.length === 0 && (
          <div className="text-center py-20 relative">
            <img
              src="/logo.png"
              alt="bg"
              className="absolute left-1/2 -translate-x-1/2 top-10 w-[500px] opacity-10 pointer-events-none"
            />

            <h2 className="text-3xl font-bold mb-2 relative z-10">
              Belum Ada Pesanan
            </h2>

            <p className="text-gray-600 mb-6 relative z-10">
              Anda belum memiliki pesanan apapun yuk,
              <br />
              Mulai booking lapangan favoritmu sekarang
            </p>

            <a
              href="/lapangan"
              className="inline-block bg-green-700 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md relative z-10"
            >
              Waktunya Pesan Lapangan
            </a>

            <p className="mt-4 text-sm text-gray-700 relative z-10">
              ✅ Pembayaran Aman dan Terpercaya
            </p>
          </div>
        )}
       
      {/* ✅ LIST PESANAN */}
        {!loading && pesanan.length > 0 && (
          <div className="space-y-6 py-10">
            {pesanan.map((item) => {
              const isOpen = expandedCardId === item.id;
              const paymentCode =
                item.va_number || item.payment_reference || item.kode_pemesanan || "-";

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedCardId(isOpen ? null : item.id)}
                    className="flex w-full items-start justify-between gap-4 text-left"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {item.kode_pemesanan || item.va_number || item.payment_reference}
                      </h2>

                      <p className="mt-1 text-gray-500">{item.nama_pemesan}</p>

                      <p className="text-sm text-gray-500">{item.email}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <div className="inline-block rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                        {item.status_pemesanan}
                      </div>

                      {item.status_pemesanan === "menunggu_pembayaran" && (
                        <button
                          type="button"
                          onClick={() =>
                            setCancelingId(cancelingId === item.id ? null : item.id)
                          }
                          className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Ajukan Pembatalan
                        </button>
                      )}
                    </div>

                    <ChevronDown
                      className={[
                        "h-7 w-7 text-green-700 transition-transform duration-300",
                        isOpen ? "rotate-180" : "rotate-0",
                      ].join(" ")}
                    />
                  </div>
                  </button>

                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <InfoBox
                      title="Metode Pembayaran"
                      value={getPaymentMethodLabel(item)}
                    />

                    <InfoBox
                      title={
                        item.payment_channel === "bank"
                          ? "Nomor Virtual Account"
                          : "Kode Pembayaran"
                      }
                      value={paymentCode}
                    />

                    <InfoBox
                      title="Total Bayar"
                      value={`Rp ${Number(item.total_bayar || 0).toLocaleString("id-ID")}`}
                    />
                  </div>

                  {cancelingId === item.id && item.status_pemesanan === "menunggu_pembayaran" && (
                    <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                      <p className="mb-2 text-sm font-semibold text-red-700">
                        Alasan Pembatalan
                      </p>

                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Tulis alasan pembatalan..."
                        className="min-h-[100px] w-full rounded-xl border border-red-200 bg-white p-3 text-sm outline-none focus:border-red-400"
                      />

                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setCancelingId(null)}
                          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600"
                        >
                          Batal
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSubmitCancellation(item)}
                          disabled={cancelLoading}
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                        >
                          {cancelLoading ? "Mengirim..." : "Kirim Pembatalan"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenPaymentPage(item)}
                      className="rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                    >
                      {String(item.payment_channel || "").toLowerCase() === "cash"
                        ? "Lihat Pembayaran Cash"
                        : "Lihat Detail Pembayaran"}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-6 border-t border-gray-100 pt-5">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <InfoBox title="Nama Pemesan" value={item.nama_pemesan || "-"} />
                        <InfoBox title="Email" value={item.email || "-"} />
                        <InfoBox title="No WhatsApp" value={item.no_whatsapp || "-"} />
                        <InfoBox title="Status Kedatangan" value={item.status_kedatangan || "-"} />
                        <InfoBox title="Status Kedatangan" value={item.status_kedatangan || "-"} />
                      </div>

                      {Array.isArray(item.detail_pemesanan) && item.detail_pemesanan.length > 0 && (
                        <div className="mt-6">
                          <h3 className="mb-3 text-lg font-bold text-gray-800">
                            Detail Slot Pemesanan
                          </h3>

                          <div className="space-y-3">
                            {item.detail_pemesanan.map((detail, index) => (
                              <div
                                key={detail.id || index}
                                className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                              >
                                <p className="font-semibold text-gray-800">
                                  {detail.nama_lapangan || "Lapangan"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Tanggal: {detail.tanggal || "-"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Jam: {detail.jam_mulai?.slice(0, 5) || "-"} - {detail.jam_selesai?.slice(0, 5) || "-"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Harga: Rp {Number(detail.harga || 0).toLocaleString("id-ID")}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PAYMENT CARD */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-green-100 mb-20 mt-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/70 via-white to-green-50/40 pointer-events-none" />

          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
              Cara Melakukan Pemesanan
            </h3>
            <p className="text-center text-gray-500 mb-10 text-sm sm:text-base">
              Ikuti langkah berikut untuk menyelesaikan pembayaran pesanan Anda.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md">
                  ⚽
                </div>
                <p className="mt-3 font-semibold text-gray-800">Pilih</p>
                <p className="text-xs text-gray-500 mt-1">Pilih lapangan dan jadwal</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md">
                  📋
                </div>
                <p className="mt-3 font-semibold text-gray-800">Konfirmasi</p>
                <p className="text-xs text-gray-500 mt-1">Cek detail pesanan</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md">
                  💳
                </div>
                <p className="mt-3 font-semibold text-gray-800">Bayar</p>
                <p className="text-xs text-gray-500 mt-1">Lakukan pembayaran</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-400 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md">
                  ✅
                </div>
                <p className="mt-3 font-semibold text-gray-800">Selesai</p>
                <p className="text-xs text-gray-500 mt-1">Pesanan terkonfirmasi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}