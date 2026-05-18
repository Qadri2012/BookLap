// src/pages/pemesanan.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import {
  ChevronDown,
  ChevronLeft,
  Headset,
  CreditCard,
  ShieldCheck,
  BadgePercent,
  Goal,
  Trash2,
  LayoutGrid,
  MapPinned,
} from "lucide-react";

// const paymentOptions = [
//   { id: "transfer", title: "Transfer" },
//   { id: "cash", title: "Cash di Tempat" },
// ];

// const transferMethods = [
//   { id: "bni", label: "BNI Virtual Account", fee: 4000 },
//   { id: "bri", label: "BRI Virtual Account", fee: 4000 },
//   { id: "bsi", label: "BSI Virtual Account", fee: 4500 },
//   { id: "mandiri", label: "Mandiri Virtual Account", fee: 4000 },
//   { id: "indomaret", label: "Indomaret", fee: 6500 },
//   { id: "ewallet", label: "E-Wallet", fee: 3000 },
// ];

const cashSteps = [
  {
    id: 1,
    icon: MapPinned,
    title: "Datang Ke",
    desc: "Lokasi Sesuai Jadwal",
  },
  {
    id: 2,
    icon: LayoutGrid,
    title: "Tunjukkan",
    desc: "Kode Pesanan Anda",
  },
  {
    id: 3,
    icon: CreditCard,
    title: "Lakukan",
    desc: "Pembayaran Ke Kasir",
  },
  {
    id: 4,
    icon: Goal,
    title: "Mulai Bermain",
    desc: "dan Nikmati Lapangan",
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Transaksi Aman",
    desc: "dengan Enkripsi Data",
  },
  {
    icon: BadgePercent,
    title: "Dapatkan Harga",
    desc: "Kompetitif dengan Kualitas Terbaik",
  },
  {
    icon: CreditCard,
    title: "Pesan Lapangan",
    desc: "Kapan Saja dan Dimana Saja",
  },
  {
    icon: Headset,
    title: "Tim Kami Siap",
    desc: "Membantu Reservasi Anda",
  },
];


const rupiahToNumber = (value) =>
  Number(String(value ?? "").replace(/[^\d]/g, "")) || 0;

const formatRupiah = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

function Step({ number, label, active, done }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          "flex h-9 w-9 items-center justify-center rounded-full border text-[15px] font-medium",
          active || done
            ? "border-[#2e8a3a] bg-[#2e8a3a] text-white"
            : "border-[#777] bg-white text-[#333]",
        ].join(" ")}
      >
        {String(number).padStart(2, "0")}
      </div>
      <span className="text-[16px] text-[#222]">{label}</span>
    </div>
  );
}

function PaymentCard({ active, title, price, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative h-[88px] w-full rounded-[12px] border bg-white px-4 pt-2 text-left shadow-[0_3px_8px_rgba(0,0,0,0.15)] transition",
        active ? "border-[#2e8a3a]" : "border-[#cfcfcf]",
      ].join(" ")}
    >
      <div className="absolute right-3 top-3 h-5 w-5 rounded-full border border-[#707070] bg-white p-[2px]">
        {active && <div className="h-full w-full rounded-full bg-[#2e8a3a]" />}
      </div>

      <div className="flex h-full flex-col items-center justify-center leading-none">
        <div className="text-[20px] font-medium text-[#111]">{title}</div>
        <div className="mt-2 text-[18px] font-semibold text-[#2e8a3a]">
          {price}
        </div>
      </div>
    </button>
  );
}

function BenefitItem({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#b8c7c5]">
        <Icon size={28} strokeWidth={2} className="text-[#2c2c2c]" />
      </div>
      <div className="text-[13px] font-medium leading-4 text-[#666]">
        <div>{title}</div>
        <div>{desc}</div>
      </div>
    </div>
  );
}

export default function Pemesanan() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    field,
    selectedSlots: initialSelectedSlots = [],
    totalDurationMinutes = 0,
  } = location.state || {};
  const [selectedSlots, setSelectedSlots] = useState(initialSelectedSlots);

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const transferPayment = paymentOptions.find((item) => item.kode === "transfer");
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState("");
  const [transferMethods, setTransferMethods] = useState([]);
  const [transferLoading, setTransferLoading] = useState(true);
  const [transferError, setTransferError] = useState("");
  const [transferSelectionError, setTransferSelectionError] = useState("");
  const [selectedServices, setSelectedServices] = useState({});
  const [selectedTransferMethod, setSelectedTransferMethod] = useState(null);
  const [isServicesOpen, setIsServicesOpen] = useState(true);
  const [showBackHint, setShowBackHint] = useState(false);

  const [namaPemesan, setNamaPemesan] = useState("");
  const [emailPemesan, setEmailPemesan] = useState("");
  const [noWhatsapp, setNoWhatsapp] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");

  const paymentSectionRef = useRef(null);
  const formSectionRef = useRef(null);
  const transferSectionRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setPaymentLoading(true);
        setPaymentError("");

        const res = await fetch(
          "http://localhost:5000/api/metode-pembayaran"
        );

        if (!res.ok) {
          throw new Error("Gagal mengambil metode pembayaran");
        }

        const data = await res.json();

        setPaymentOptions(
          Array.isArray(data)
            ? data.map((item) => ({
                dbId: item.id,
                kode: item.kode,
                title: item.nama_metode,
              }))
            : []
        );
      } catch (error) {
        console.error(error);
        setPaymentOptions([]);
        setPaymentError("Metode pembayaran gagal dimuat");
      } finally {
        setPaymentLoading(false);
      }
    };

    fetchPaymentMethods();
    }, []);

useEffect(() => {
  const fetchTransferMethods = async () => {
    try {
      if (!transferPayment?.dbId) return;

      setTransferLoading(true);
      setTransferError("");

      const res = await fetch(
        `http://localhost:5000/api/metode-transfer?metode_pembayaran_id=${transferPayment.dbId}`
      );

      if (!res.ok) {
        throw new Error("Gagal mengambil metode transfer");
      }

      const data = await res.json();

      setTransferMethods(
        Array.isArray(data)
          ? data.map((item) => ({
              dbId: item.id,
              kode: item.kode,
              label: item.nama_metode,
              fee: Number(item.biaya_admin || 0),
              logo: item.logo || null,
            }))
          : []
      );
    } catch (error) {
      console.error(error);
      setTransferMethods([]);
      setTransferError("Metode transfer gagal dimuat");
    } finally {
      setTransferLoading(false);
    }
  };

  fetchTransferMethods();
}, [transferPayment?.dbId]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        setServicesError("");

        const res = await fetch("http://localhost:5000/api/layanan-tambahan");
        if (!res.ok) {
          throw new Error("Gagal mengambil layanan tambahan");
        }

        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setServices([]);
        setServicesError("Layanan tambahan gagal dimuat.");
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  const selectedSlotCount = selectedSlots.length;
  const bookingDurationMinutes = totalDurationMinutes || selectedSlotCount * 60;

  const biayaSewa = useMemo(() => {
    return selectedSlots.reduce((sum, slot) => {
      return sum + Number(slot?.harga || 0);
    }, 0);
  }, [selectedSlots]);

  const biayaTambahan = useMemo(() => {
    return services.reduce((sum, item) => {
      const qty = selectedServices[item.id] || 0;
      const unitPrice = Number(item.harga_satuan || 0);
      return sum + qty * unitPrice;
    }, 0);
  }, [services, selectedServices]);

  const selectedTransferFee =
  paymentMethod === "transfer"
    ? Number(
        transferMethods.find((m) => m.kode === selectedTransferMethod)?.fee || 0
      )
    : 0;

  const subtotal = biayaSewa + biayaTambahan;
  const grandTotal = subtotal + selectedTransferFee;

  const toggleService = (id) => {
    setSelectedServices((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = 1;
      }
      return next;
    });
  };

  const increaseServiceQty = (id) => {
    setSelectedServices((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decreaseServiceQty = (id) => {
    setSelectedServices((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return {
        ...prev,
        [id]: current - 1,
      };
    });
  };

  const removeSlot = (slotIndex) => {
    setSelectedSlots((prev) =>
      prev.filter((_, index) => index !== slotIndex)
    );
  };
  const handleContinue = async () => {
    if (selectedSlots.length === 0) {
      setSubmitError("Pilih minimal 1 jadwal lapangan.");
      return;
    }
    if (!paymentMethod) {
      paymentSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

  const selectedPayment = paymentOptions.find(
    (item) => item.kode === paymentMethod
  );

  if (!selectedPayment) {
    setSubmitError("Metode pembayaran tidak valid.");
    return;
  }

  if (paymentMethod === "transfer" && !selectedTransferMethod) {
    setTransferSelectionError("Silakan pilih metode transfer terlebih dahulu");
    paymentSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    return;
  }

  const selectedTransfer = transferMethods.find(
    (item) => item.kode === selectedTransferMethod
  );

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const userId = currentUser?.id || currentUser?.user_id;

  if (!userId) {
    setSubmitError("User belum ditemukan. Pastikan data login tersimpan.");
    return;
  }

  if (!namaPemesan.trim() || !emailPemesan.trim() || !noWhatsapp.trim()) {
    setSubmitError("Lengkapi nama, email, dan nomor WhatsApp terlebih dahulu.");

    formSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    return;
  }

  const biayaAdmin = paymentMethod === "transfer" ? Number(selectedTransfer?.fee || 0) : 0;
  const totalBayar = subtotal + biayaAdmin;

  try {
    setSubmitLoading(true);
    setSubmitError("");

    const res = await fetch("http://localhost:5000/api/pemesanan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        lapangan_id: field?.id,
        metode_pembayaran_id: selectedPayment.dbId,
        nama_pemesan: namaPemesan,
        email: emailPemesan,
        no_whatsapp: noWhatsapp,
        subtotal_sewa: biayaSewa,
        subtotal_layanan: biayaTambahan,
        biaya_admin: biayaAdmin,
        total_bayar: totalBayar,
        total_durasi_menit: bookingDurationMinutes,
        status_pemesanan:
          paymentMethod === "cash"
            ? "menunggu_kedatangan"
            : "menunggu_pembayaran",
        catatan: "",
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result?.message || "Gagal menyimpan pemesanan");
    }

    const pemesananBaru = result.data;

if (paymentMethod === "transfer") {
  if (!selectedTransferMethod) {
    setTransferSelectionError("Silakan pilih bank tujuan transfer terlebih dahulu.");

    paymentSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    return;
  }

  const selectedTransfer = transferMethods.find(
    (item) => item.kode === selectedTransferMethod
  );

  if (!selectedTransfer) {
    setTransferSelectionError("Metode transfer tidak valid.");

    paymentSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    return;
  }

  // lanjut proses transfer di sini
  const biayaAdmin = Number(selectedTransfer?.fee || 0);
  const totalBayar = subtotal + biayaAdmin;

  try {
    setSubmitLoading(true);
    setSubmitError("");

    const res = await fetch("http://localhost:5000/api/pemesanan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        lapangan_id: field?.id,
        metode_pembayaran_id: selectedPayment.dbId,
        nama_pemesan: namaPemesan,
        email: emailPemesan,
        no_whatsapp: noWhatsapp,
        subtotal_sewa: biayaSewa,
        subtotal_layanan: biayaTambahan,
        biaya_admin: biayaAdmin,
        total_bayar: totalBayar,
        total_durasi_menit: bookingDurationMinutes,
        status_pemesanan: "menunggu_pembayaran",
        catatan: "",
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result?.message || "Gagal menyimpan pemesanan");
    }

    const pemesananBaru = result.data;

    navigate("/transfer", {
      state: {
        pemesananId: pemesananBaru.id,
        kodePemesanan: pemesananBaru.kode_pemesanan,
        field,
        selectedSlots,
        totalPrice: totalBayar,
        totalDurationMinutes: bookingDurationMinutes,
        selectedTransferMethod,
        selectedTransferFee: biayaAdmin,
      },
    });

    return;
  } catch (error) {
    console.error(error);
    setSubmitError(error.message || "Gagal membuat pemesanan");
  } finally {
    setSubmitLoading(false);
  }
}

    if (paymentMethod === "cash") {
      navigate("/pesanan", {
        state: {
          pemesananId: pemesananBaru.id,
          kodePemesanan: pemesananBaru.kode_pemesanan,
          field,
          selectedSlots,
          totalPrice: totalBayar,
          totalDurationMinutes: bookingDurationMinutes,
          paymentMethod: "cash",
        },
      });
    }
  } catch (error) {
    console.error(error);
    setSubmitError(error.message || "Gagal membuat pemesanan");
  } finally {
    setSubmitLoading(false);
  }
};


  

  const currentCardPrice =
    paymentMethod === "transfer" ? grandTotal : subtotal;

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#111]">
      <style>{`
        .booklap-scroll::-webkit-scrollbar{width:8px}
        .booklap-scroll::-webkit-scrollbar-thumb{background:#cfd8cf;border-radius:999px}
        .booklap-scroll::-webkit-scrollbar-track{background:transparent}
      `}</style>

      <div className="mx-auto max-w-[1300px] px-4">
        <header className="border-b border-[#d8d8d8] px-6 pb-5 pt-6">
          <div className="mb-6 text-[32px] font-extrabold tracking-tight">
            <span>Book</span>
            <span className="text-[#2e8a3a]">Lap</span>
          </div>

          <div className="flex items-center justify-center gap-4 pb-2">
            <Step number={1} label="Konfirmasi Identitas" />
            <div className="h-px w-16 bg-[#454545]" />
            <Step number={2} label="Review Order" active />
            <div className="h-px w-16 bg-[#454545]" />
            <Step number={3} label="Pembayaran" />
          </div>
        </header>

        <main className="px-6">
          <h1 className="mt-4 text-[24px] font-bold text-[#111]">
            Detail Pemesanan
          </h1>

          <div className="mt-3 grid grid-cols-[320px_minmax(0,1fr)] items-start gap-4">
            <aside className="self-start h-fit rounded-[14px] border border-[#cfcfcf] bg-white p-2 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
              <div className="flex gap-2 border-b border-[#ddd] pb-3">
                <div className="h-[120px] w-[100px] overflow-hidden rounded-[8px] bg-[#d8e6cf]">
                  <img
                    src={
                      field?.foto?.[0] ||
                      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={field?.nama || "Lapangan"}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="pt-1">
                  <div className="text-[14px] font-semibold leading-5 text-[#222]">
                    {field?.nama || "Nama Lapangan"}
                  </div>
                  <div className="mt-1 max-w-[145px] text-[11px] leading-4 text-[#888]">
                    {field?.alamat || "Alamat lapangan belum tersedia"}
                  </div>
                </div>
              </div>

              <div className="border-b border-[#ddd] py-2">
                <div className="text-[15px] font-semibold text-[#2a2a2a]">
                  Lapangan yang Dipilih
                </div>
                <div className="mt-1 text-[12px] text-[#555]">
                  {selectedSlots.length > 0
                    ? `Lapangan ${selectedSlots[0]?.court_no || ""}`
                    : "Lapangan"}
                </div>
              </div>

              <div className="space-y-2 border-b border-[#ddd] py-3">
                {selectedSlots.length > 0 ? (
                  selectedSlots.map((slot, idx) => {
                    const start = String(slot.jam_mulai || "").slice(0, 5);
                    const end = String(slot.jam_selesai || "").slice(0, 5);

                    return (
                      <div
                        key={`${slot.tanggal}-${slot.jam_mulai}-${slot.jam_selesai}-${idx}`}
                        className="flex items-center justify-between rounded-[10px] border border-[#d9d9d9] px-3 py-2"
                      >
                        <div className="leading-4">
                          <div className="text-[11px] text-[#555]">
                            {slot.tanggal
                              ? new Date(`${slot.tanggal}T00:00:00`).toLocaleDateString(
                                  "id-ID",
                                  {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  }
                                )
                              : "-"}
                          </div>
                          <div className="mt-1 text-[11px] text-[#222]">
                            {slot.court_no ? `Lapangan ${slot.court_no}` : "Lapangan"}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] text-[#555]">
                            {start} - {end}
                          </div>
                          <div className="mt-1 text-[13px] font-semibold text-[#2e8a3a]">
                            Rp {Number(slot.harga || 0).toLocaleString("id-ID")}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSlot(idx)}
                          className="ml-2 text-[#444] transition hover:text-red-600"
                        >
                          <Trash2 size={18} strokeWidth={2.3} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-[12px] text-[#777]">
                    Belum ada slot dipilih
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/lapangan/${field?.id}`, {
                      state: {
                        scrollToSlotGrid: true,
                        openBookingBox: true,
                        selectedSlots,
                      },
                    })
                  }
                  className="flex items-center gap-1 px-1 text-[12px] font-semibold text-[#2e6f2c]"
                >
                  <span className="text-[16px] leading-none">+</span> Tambah Jadwal
                </button>
              </div>

              <div className="flex items-center justify-center py-3">
                <div className="relative inline-block">
                  {showBackHint && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-3 py-1 text-[12px] text-white shadow-lg">
                      Semua Pesanan akan dibatalkan
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate(`/lapangan/${field?.id}`)}
                    onMouseEnter={() => setShowBackHint(true)}
                    onMouseLeave={() => setShowBackHint(false)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2e8a3a] px-7 py-1.5 text-[18px] font-medium text-white shadow-[0_2px_0_rgba(0,0,0,0.06)]"
                  >
                    <ChevronLeft size={22} />
                    <span>Kembali</span>
                  </button>
                </div>
              </div>
            </aside>

            <section className="space-y-4">
              <div
                ref={paymentSectionRef}
                className="rounded-[14px] border border-[#cfcfcf] bg-white p-3"
              >
                <h2 className="text-center text-[28px] font-bold text-[#111]">
                  Pilih Pembayaran
                </h2>

              <div className="mt-2 grid grid-cols-2 gap-4 px-2 pb-1">

                {paymentLoading ? (
                  <div className="col-span-2 py-6 text-center text-[14px] text-[#666]">
                    Memuat metode pembayaran...
                  </div>
                ) : paymentError ? (
                  <div className="col-span-2 py-6 text-center text-[14px] text-red-600">
                    {paymentError}
                  </div>
                ) : (
                  paymentOptions.map((item) => {
                  const cardPrice =
                    item.kode === "transfer"
                      ? subtotal + selectedTransferFee
                      : subtotal;

                    return (
                      <PaymentCard
                        key={item.id}
                        active={paymentMethod === item.kode}
                        title={item.title}
                        price={formatRupiah(cardPrice)}
                        onClick={() => {
                          setPaymentMethod(item.kode);

                          if (item.kode !== "transfer") {
                            setSelectedTransferMethod(method.kode);
                            setTransferSelectionError("");
                          }
                        }}
                      />
                    );
                  })
                )}
              </div>
              </div>

              {paymentMethod === "cash" && (
                <div className="rounded-[14px] border border-[#7f9f7f] bg-[#e4f0df] p-3">
                  <h3 className="text-[18px] font-bold text-[#111]">
                    Cara Pembayaran di Tempat
                  </h3>

                  <div className="mt-3 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-2">
                    {cashSteps.map((step, index) => {
                      const Icon = step.icon;

                      return (
                        <React.Fragment key={step.id}>
                          <div className="flex flex-col items-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-[12px] bg-[#76a976]">
                              <Icon
                                size={30}
                                strokeWidth={2}
                                className="text-[#111]"
                              />
                            </div>
                            <div className="mt-2 text-[12px] font-medium leading-4 text-[#444]">
                              <div>{step.title}</div>
                              <div>{step.desc}</div>
                            </div>
                          </div>

                          {index < cashSteps.length - 1 && (
                            <div className="px-1 text-[28px] font-light text-[#111]">
                              &gt;
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}

              <div
                ref={formSectionRef}
                className="rounded-[14px] border border-[#cfcfcf] bg-white p-3"
              >
                <h2 className="text-[20px] font-bold text-[#111]">
                  Data Pemesan / Data Orang yang Akan Bermain
                </h2>

                <p className="mt-1 text-[12px] text-[#666]">
                  Isi data orang yang akan menggunakan lapangan. Akun login tetap menjadi pembuat pesanan.
                </p>

                {submitError && (
                  <div className="rounded-[10px] bg-[#fff1f1] px-3 py-2 text-[13px] text-red-600">
                    {submitError}
                  </div>
                )}

                <div className="mt-3 space-y-3">
                  <Field
                    label="Nama Lengkap Pemesan"
                    placeholder="Nama orang yang akan bermain"
                    value={namaPemesan}
                    onChange={(e) => setNamaPemesan(e.target.value)}
                  />
                  <Field
                    label="Email Aktif"
                    placeholder="Email orang yang akan bermain"
                    value={emailPemesan}
                    onChange={(e) => setEmailPemesan(e.target.value)}
                  />
                  <Field
                    label="Nomor WhatsApp Aktif"
                    placeholder="Nomor WhatsApp orang yang akan bermain"
                    value={noWhatsapp}
                    onChange={(e) => setNoWhatsapp(e.target.value)}
                  />
                </div>
            
                <div className="my-4 border-t-4 border-[#efefef]" />

                <div className="rounded-[12px] border border-[#cfcfcf] bg-white p-3">
                  <button
                    type="button"
                    onClick={() => setIsServicesOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <div>
                      <div className="text-[20px] font-bold text-[#111]">
                        Lengkapi Kebutuhanmu
                      </div>
                      <div className="text-[12px] text-[#555]">
                        Pilih Layanan yang Anda Butuhkan
                      </div>
                    </div>

                    <ChevronDown
                      size={34}
                      strokeWidth={2.4}
                      className={[
                        "text-[#111] transition-transform",
                        isServicesOpen ? "rotate-180" : "rotate-0",
                      ].join(" ")}
                    />
                  </button>

                  <div className="mt-2 space-y-1">
                    {servicesLoading ? (
                      <div className="px-2 py-3 text-[12px] text-[#777]">
                        Memuat layanan tambahan...
                      </div>
                    ) : servicesError ? (
                      <div className="px-2 py-3 text-[12px] text-red-600">
                        {servicesError}
                      </div>
                    ) : (
                      services.map((item) => {
                        const qty = selectedServices[item.id] || 0;
                        const checked = qty > 0;
                        const unitPrice = Number(item.harga_satuan || 0);
                        const displayPrice = qty > 0 ? unitPrice * qty : unitPrice;

                        return (
                          <div
                            key={item.id}
                            className="grid grid-cols-[34px_1fr_auto_auto_28px] items-center gap-3 py-2"
                          >
                            <div className="flex items-center justify-center">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2e8a3a] text-[15px] font-bold text-white">
                                {item.id}
                              </div>
                            </div>

                            <div>
                              <div className="text-[16px] font-semibold text-[#222]">
                                {item.nama_layanan}
                              </div>
                              <div className="text-[11px] text-[#888]">
                                {item.deskripsi}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 rounded-[8px] border border-[#cfcfcf] bg-white px-2 py-1">
                              <button
                                type="button"
                                onClick={() => decreaseServiceQty(item.id)}
                                className="h-6 w-6 rounded-[6px] border border-[#ddd] text-[14px] font-bold text-[#222]"
                              >
                                -
                              </button>
                              <span className="min-w-4 text-center text-[13px] font-semibold text-[#111]">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => increaseServiceQty(item.id)}
                                className="h-6 w-6 rounded-[6px] border border-[#ddd] text-[14px] font-bold text-[#222]"
                              >
                                +
                              </button>
                            </div>

                            <div className="pr-2 text-[17px] font-semibold text-[#222]">
                              {formatRupiah(displayPrice)}
                            </div>

                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleService(item.id)}
                              className="h-5 w-5 accent-[#2e8a3a]"
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {paymentMethod === "transfer" && (
                  <div
                    ref={transferSectionRef}
                    className="rounded-[12px] border border-[#cfcfcf] bg-white p-3"
                  >
                    <h3 className="text-[20px] font-bold text-[#111]">
                      Metode Pembayaran
                    </h3>

                    {transferSelectionError && (
                        <div className="mt-3 rounded-[10px] bg-[#fff1f1] px-3 py-2 text-[13px] text-red-600">
                          {transferSelectionError}
                        </div>
                    )}

                    <div className="mt-3 space-y-2">
                      {transferMethods.map((method) => {
                        const active = selectedTransferMethod === method.kode;

                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setSelectedTransferMethod(method.kode)}
                            className={[
                              "flex w-full items-center gap-3 rounded-[10px] border px-3 py-2 text-left transition",
                              active
                                ? "border-[#2e8a3a] bg-[#f0fdf4]"
                                : "border-[#cfcfcf] bg-white",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "h-4 w-4 rounded-full border",
                                active
                                  ? "border-[#2e8a3a] bg-[#2e8a3a]"
                                  : "border-[#999] bg-white",
                              ].join(" ")}
                            />

                            <div className="flex flex-col">
                              <span className="text-[15px] font-medium text-[#111]">
                                {method.label}
                              </span>
                              <span className="mt-1 text-[12px] font-semibold text-[#2e8a3a]">
                                Rp {method.fee.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                      
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-[12px] border border-[#8ea07f] bg-[#e4f0df] p-2.5">
                  <div className="text-[19px] font-bold text-[#222]">
                    Rincian Biaya
                  </div>

                  <div className="mt-1 grid grid-cols-[1fr_auto] gap-y-1 text-[13px] text-[#787878]">
                    <div>Total Durasi:</div>
                    <div className="text-right font-medium text-[#767676]">
                      {selectedSlotCount} Jam
                    </div>

                    <div>Biaya Sewa (Total)</div>
                    <div className="text-right font-medium text-[#767676]">
                      Rp {biayaSewa.toLocaleString("id-ID")}
                    </div>

                    <div>Biaya Tambahan</div>
                    <div className="text-right font-medium text-[#767676]">
                      Rp {biayaTambahan.toLocaleString("id-ID")}
                    </div>

                    {paymentMethod === "transfer" && (
                      <>
                        <div>Biaya Transaksi</div>
                        <div className="text-right font-medium text-[#767676]">
                          Rp {selectedTransferFee.toLocaleString("id-ID")}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-1 flex items-end justify-between">
                    <div className="text-[20px] font-bold text-[#111]">
                      Total:
                    </div>
                    <div className="text-[22px] font-extrabold text-[#111]">
                      Rp {grandTotal.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center py-2">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={submitLoading}
                  className="rounded-[12px] bg-[#2e8a3a] px-10 py-3 text-[20px] font-semibold text-white shadow-[0_4px_0_rgba(0,0,0,0.06)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitLoading
                    ? "Memproses..."
                    : paymentMethod === "transfer"
                    ? "Bayar Sekarang"
                    : paymentMethod === "cash"
                    ? "Konfirmasi Sekarang"
                    : "Pilih Metode Pembayaran"}
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>

      <section className="mt-6 rounded-[10px] bg-[#eaf4df] px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Headset size={36} strokeWidth={2} className="text-[#111]" />
            <div>
              <div className="text-[16px] font-bold text-[#222]">
                Butuh Bantuan?
              </div>
              <div className="text-[13px] text-[#7a7a7a]">
                Hubungi Tim Kami Untuk Membantu Proses Pemesanan
              </div>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[4px] border border-[#c8d5c0] bg-white px-4 py-2 text-[14px] font-semibold text-[#3a7f2f]"
          >
            <Headset size={18} />
            <span>Hubungi Kami</span>
          </button>
        </div>
      </section>

      <section className="mt-3 rounded-[10px] bg-[#eaf4df] px-3 py-4">
        <div className="grid grid-cols-4 divide-x divide-[#cfcfcf]">
          {benefits.map((item) => (
            <BenefitItem key={item.title} {...item} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Field({ label, placeholder, value, onChange }) {
  return (
    <div>
      <div className="mb-1.5 text-[16px] text-[#222]">{label}</div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-[38px] w-full rounded-[18px] border border-[#7d7d7d] bg-[#fafafa] px-4 text-[13px] outline-none placeholder:text-[#9c9c9c] focus:border-[#2e8a3a]"
      />
    </div>
  );
}