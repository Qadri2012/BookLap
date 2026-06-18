// src/pages/transfer.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // ✅ NEW
import briLogo from "../assets/bank/bri.png";
import bniLogo from "../assets/bank/bni.png";
import bsiLogo from "../assets/bank/bsi.png";
import mandiriLogo from "../assets/bank/mandiri.png";
import indomaretLogo from "../assets/bank/indomaret.png";
import gopayLogo from "../assets/bank/gopay.png";
import ovoLogo from "../assets/bank/ovo.png";
import danaLogo from "../assets/bank/dana.png";
import shopeepayLogo from "../assets/bank/shopeepay.png";
import { api } from "../services/api";
import {
  Check,
  Clock3,
  Copy,
  CalendarDays,
  MapPin,
  ChevronDown,
  ShieldCheck,
  Building2,
  Smartphone,
  Landmark,
  Banknote,
} from "lucide-react";

const paymentLogoMap = {
  bni: bniLogo,
  bri: briLogo,
  bsi: bsiLogo,
  mandiri: mandiriLogo,
  indomaret: indomaretLogo,
  gopay: gopayLogo,
  ovo: ovoLogo,
  dana: danaLogo,
  shopeepay: shopeepayLogo,
};

const bankLabelMap = {
  bni: "BNI",
  bri: "BRI",
  bsi: "BSI",
  mandiri: "Mandiri",
  indomaret: "Indomaret",
  gopay: "GoPay",
  ovo: "OVO",
  dana: "DANA",
  shopeepay: "ShopeePay",
};

const rupiah = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

export default function Transfer() {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ NEW
const [copied, setCopied] = useState(false);

  const stateData = location.state || {};

  const pemesananId =
    stateData?.pemesananId ||
    localStorage.getItem("pemesananId");

  // ✅ STATE DULU sebelum dipakai di bawah
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60 * 60 * 1000);

  // ✅ selectedTransferMethod pakai useMemo agar reaktif setelah paymentData terisi
  const selectedTransferMethod = useMemo(() => {
    if (stateData.selectedTransferMethod) return stateData.selectedTransferMethod;
    const va = paymentData?.va_number || "";
    if (va.startsWith("009")) return "bni";
    if (va.startsWith("002")) return "bri";
    if (va.startsWith("008")) return "mandiri";
    if (va.startsWith("451")) return "bsi";
    return "";
  }, [stateData.selectedTransferMethod, paymentData?.va_number]);

  const totalPrice = stateData.totalPrice || 0;
  const selectedSlots = stateData.selectedSlots || [];
  const field = stateData.field || {};
  const totalDurationMinutes = stateData.totalDurationMinutes || 0;

  // ✅ selectedServiceDetails
  const selectedServiceDetails = useMemo(() => {
    return Array.isArray(paymentData?.detail_layanan)
      ? paymentData.detail_layanan
      : [];
  }, [paymentData]);

// ===== NEW CODE FETCH PEMESANAN =====
const fetchPemesanan = async () => {
  try {
    if (!pemesananId) return;

    const res = await api.get(
      `/pemesanan/${pemesananId}`
    );

    const data = res.data;

    if (!data) return;

    setPaymentData(data);

    // Jika admin sudah konfirmasi pembayaran
    if (
      data.status_pemesanan !==
      "menunggu_pembayaran"
    ) {
      setTimeLeft(0);
      return;
    }

    if (
      data.payment_expires_at
    ) {
      const deadline =
        new Date(
          data.payment_expires_at
        ).getTime();

      setTimeLeft(
        Math.max(
          deadline - Date.now(),
          0
        )
      );
    }
  } catch (err) {
    console.error(err);
  }
};
// ===== END NEW CODE =====

// ===== NEW CODE LOAD AWAL =====
useEffect(() => {
  fetchPemesanan();
}, [pemesananId]);
// ===== END NEW CODE =====
// ===== CEK STATUS PEMBAYARAN DARI ADMIN =====
useEffect(() => {
  if (!pemesananId) return;

  const interval =
    setInterval(() => {
      fetchPemesanan();
    }, 5000);

  return () =>
    clearInterval(interval);
}, [pemesananId]);

useEffect(() => {
  if (
    paymentData?.status_pemesanan !==
    "menunggu_pembayaran"
  ) {
    setTimeLeft(0);
    return;
  }

  if (!paymentData?.payment_expires_at)
    return;

  const deadline = new Date(
    paymentData.payment_expires_at
  ).getTime();

  if (isNaN(deadline))
    return;

  const updateTimer = () => {
    const remaining =
      deadline - Date.now();

    setTimeLeft(
      remaining > 0
        ? remaining
        : 0
    );
  };

  updateTimer();

  const interval = setInterval(
    updateTimer,
    1000
  );

  return () =>
    clearInterval(interval);
}, [
  paymentData?.payment_expires_at,
]);


  const isBankMethod = ["bni", "bri", "bsi", "mandiri"].includes(
    selectedTransferMethod
  );

  const paymentKind =
    paymentData?.payment_channel ||
    (isBankMethod
      ? "bank"
      : selectedTransferMethod === "indomaret"
      ? "minimarket"
      : "ewallet");

  const paymentCode = paymentData?.va_number || paymentData?.payment_reference || "-";
  const bankLabel = bankLabelMap[selectedTransferMethod] || "Pembayaran";
  const paymentLogo = paymentLogoMap[selectedTransferMethod] || null;
  const totalPayment = rupiah(
  paymentData?.total_bayar ||
  totalPrice
);

  const paymentLabel =
    paymentKind === "bank"
      ? "Nomor Virtual Account"
      : paymentKind === "minimarket"
      ? "Kode Pembayaran Indomaret"
      : "Kode Pembayaran E-Wallet";

  const paymentGuideTitle =
    paymentKind === "minimarket"
      ? "Petunjuk Pembayaran Indomaret"
      : "Petunjuk Pembayaran E-Wallet";

  const paymentGuideIcon = paymentKind === "minimarket" ? Landmark : Smartphone;

  // ✅ NEW: prefix VA asli per bank
  const BANK_PREFIX = {
    bni: "009",
    bri: "002",
    mandiri: "008",
    bsi: "451",
  };

  // ✅ NEW: ubah nomor WhatsApp jadi angka saja
  const normalizePhone = (value = "") =>
    String(value).replace(/\D/g, "").replace(/^0+/, "");

  const [openSection, setOpenSection] = useState(
    paymentKind === "bank" ? "mbanking" : "bayar"
  );

  useEffect(() => {
    setOpenSection(paymentKind === "bank" ? "mbanking" : "bayar");
  }, [paymentKind]);

// const [timeLeft, setTimeLeft] = useState(
//   60 * 60 * 1000
// );


 
  const pad2 = (num) => String(num).padStart(2, "0");
  const hours = pad2(Math.floor(timeLeft / 3600000));
  const minutes = pad2(Math.floor((timeLeft % 3600000) / 60000));
  const seconds = pad2(Math.floor((timeLeft % 60000) / 1000));
 


  const detailList =
  paymentData?.detail_pemesanan || [];

const firstDetail = detailList[0];

const lastDetail =
  detailList[detailList.length - 1];

const detailItems = useMemo(
  () => [
    {
      icon: CalendarDays,
      title: "Tanggal & Waktu",
      value: firstDetail?.tanggal
        ? new Date(`${firstDetail.tanggal}T00:00:00`)
            .toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })
        : "-",

      subvalue:
        firstDetail?.jam_mulai &&
        lastDetail?.jam_selesai
          ? `${String(firstDetail.jam_mulai).slice(0, 5)}
            - ${String(lastDetail.jam_selesai).slice(0, 5)}`
          : "",
    },

    {
      icon: Building2,
      title: "Lapangan",
      value: firstDetail?.nomor_lapangan
        ? `Lapangan ${firstDetail.nomor_lapangan}`
        : "Lapangan",
      subvalue: "",
    },

    {
      icon: Clock3,
      title: "Durasi Bermain",
      value: paymentData?.total_durasi_menit
        ? `${Math.ceil(
            paymentData.total_durasi_menit / 60
          )} Jam`
        : "-",
      subvalue: "",
    },

    {
      icon: MapPin,
      title: "Lokasi",
      value:
        paymentData?.lapangan?.alamat
          ?.split(",")?.[0] || "Lokasi",

      subvalue:
        paymentData?.lapangan?.alamat
          ?.split(",")
          ?.slice(1)
          .join(",") || "",
    },
  ],
  [paymentData, firstDetail]
);

  const instructions = useMemo(() => {
    if (paymentKind === "bank") {
      return {
        mbanking: [
          {
            num: 1,
            text: (
              <>
                Masuk ke menu <b>Mobile Banking {bankLabel}</b>. Kemudian,
                pilih <b>Pembayaran / Virtual Account</b>
              </>
            ),
          },
          {
            num: 2,
            text: (
              <>
                Masukkan <b>Nomor Virtual Account</b>{" "}
                <span className="font-semibold text-red-500">
                  {paymentCode}
                </span>
              </>
            ),
          },
          {
            num: 3,
            text: (
              <>
                Masukkan <b>PIN Anda</b> kemudian lanjutkan transaksi. Status
                pembayaran akan diperbarui setelah transfer berhasil
              </>
            ),
          },
        ],
        atm: [
          {
            num: 1,
            text: (
              <>
                Masukkan kartu ATM, lalu pilih <b>Transaksi Lain</b> /{" "}
                <b>Pembayaran</b>
              </>
            ),
          },
          {
            num: 2,
            text: (
              <>
                Pilih menu <b>Virtual Account</b>, lalu masukkan{" "}
                <b>{paymentCode}</b>
              </>
            ),
          },
          {
            num: 3,
            text: (
              <>
                Ikuti instruksi pada layar sampai transaksi berhasil, lalu simpan
                bukti pembayaran
              </>
            ),
          },
        ],
        mini: [
          {
            num: 1,
            text: (
              <>
                Datangi <b>Mini ATM / EDC</b> terdekat dan pilih menu{" "}
                <b>Pembayaran</b>
              </>
            ),
          },
          {
            num: 2,
            text: (
              <>
                Masukkan <b>Nomor Virtual Account</b>{" "}
                <span className="font-semibold text-red-500">
                  {paymentCode}
                </span>
              </>
            ),
          },
          {
            num: 3,
            text: (
              <>
                Konfirmasi total pembayaran, lalu selesaikan transaksi sesuai
                petunjuk pada mesin
              </>
            ),
          },
        ],
        setor: [
          {
            num: 1,
            text: (
              <>
                Kunjungi teller <b>{bankLabel}</b> dan informasikan bahwa Anda
                ingin melakukan pembayaran <b>Virtual Account</b>
              </>
            ),
          },
          {
            num: 2,
            text: (
              <>
                Berikan <b>Nomor Virtual Account</b>{" "}
                <span className="font-semibold text-red-500">
                  {paymentCode}
                </span>
              </>
            ),
          },
          {
            num: 3,
            text: (
              <>
                Lakukan pembayaran sejumlah <b>{totalPayment}</b> dan simpan
                struk sebagai bukti
              </>
            ),
          },
        ],
      };
    }

    if (paymentKind === "minimarket") {
      return {
        bayar: [
          {
            num: 1,
            text: (
              <>
                Datangi gerai <b>Indomaret</b> terdekat.
              </>
            ),
          },
          {
            num: 2,
            text: (
              <>
                Berikan <b>kode pembayaran</b>{" "}
                <span className="font-semibold text-red-500">
                  {paymentCode}
                </span>
              </>
            ),
          },
          {
            num: 3,
            text: (
              <>
                Lakukan pembayaran sesuai nominal, lalu simpan struk sebagai
                bukti.
              </>
            ),
          },
        ],
      };
    }

    return {
      bayar: [
        {
          num: 1,
          text: (
            <>
              Buka aplikasi <b>{bankLabel}</b> yang dipilih.
            </>
          ),
        },
        {
          num: 2,
          text: (
            <>
              Masukkan atau scan <b>kode pembayaran</b>{" "}
              <span className="font-semibold text-red-500">
                {paymentCode}
              </span>
            </>
          ),
        },
        {
          num: 3,
          text: (
            <>
              Selesaikan pembayaran lalu simpan bukti transaksi.
            </>
          ),
        },
      ],
    };
  }, [bankLabel, paymentCode, paymentKind, totalPayment]);

  const copyVA = async () => {
    try {
      if (!paymentCode || paymentCode === "-") return;
      await navigator.clipboard.writeText(paymentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const Section = ({ id, title, icon: Icon, items }) => {
    const isOpen = openSection === id;

    return (
      <div className="border-t border-gray-300 bg-white">
        <button
          type="button"
          onClick={() => setOpenSection(isOpen ? "" : id)}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-black" />
            <span className="text-[21px] font-medium leading-tight text-[#111]">
              {title}
            </span>
          </div>

          <ChevronDown
            className={`h-6 w-6 text-black transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {isOpen && (
          <div className="px-5 pb-5 pt-0">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.num}
                  className="flex gap-3 text-[18px] leading-snug text-[#7a7a7a]"
                >
                  <div className="mt-[2px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#257d35] text-[15px] font-semibold text-white">
                    {item.num}
                  </div>
                  <div className="flex-1">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#111]">
      <div className="mx-auto max-w-[1400px] px-6 py-8 md:py-10">
        <div className="-mt-3 mb-7 flex items-center gap-[1px] text-[32px] font-extrabold leading-none tracking-tight">
          <span>Book</span>
          <span className="text-[#2f8a3d]">Lap</span>
        </div>

        <div className="rounded-[22px] border border-[#b7c6b6] bg-[#edf4ea] px-5 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_270px]">
            <div className="flex min-w-0 items-center gap-6">
              <div className="flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-full bg-[#2a8b33]">
                <Check className="h-[54px] w-[54px] text-white stroke-[3.5]" />
              </div>

              <div className="min-w-0">
                <h1 className="text-[28px] font-semibold leading-none text-[#21883a]">
                  {paymentData?.status_pemesanan === "expired"
                    ? "Pembayaran Expired"
                    : paymentData?.status_pemesanan === "dibatalkan"
                    ? "Pesanan Dibatalkan"
                    : [
                        "sudah_bayar",
                        "sedang_dimainkan",
                        "selesai",
                      ].includes(paymentData?.status_pemesanan)
                    ? "Pembayaran Berhasil"
                    : "Pesanan Menunggu Pembayaran"}
                </h1>

                <p className="mt-4 max-w-full text-[14px] leading-none text-[#111]">
                  Terima Kasih! Pesanan Anda Telah Berhasil Dibuat.
                  <span className="mx-3 text-[#111]">|</span>

                  {[
                    "sudah_bayar",
                    "sedang_dimainkan",
                    "selesai",
                  ].includes(paymentData?.status_pemesanan)
                    ? "Pembayaran berhasil dikonfirmasi oleh admin."
                    : "Silahkan lakukan pembayaran sebelum batas waktu berakhir."}
                </p>
              </div>
            </div>

            <div className="w-[270px] shrink-0 rounded-[14px] border border-[#b8c1b8] bg-[#eef3ec] px-4 py-3 shadow-sm">
              <div className="text-[14px] font-semibold text-[#7f7f7f]">
                Status Pesanan
              </div>

              <div className="mt-3 flex items-center gap-3">
                <Clock3 className="mt-[2px] h-8 w-8 shrink-0 self-start text-[#d97706]" />

                <div className="flex-1">
                  <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center text-center text-[30px] font-extrabold leading-none text-[#d97706]">
                    <span>{hours}</span>
                    <span className="px-1">:</span>
                    <span>{minutes}</span>
                    <span className="px-1">:</span>
                    <span>{seconds}</span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 text-center text-[15px] text-[#000]">
                    <span>Jam</span>
                    <span>Menit</span>
                    <span>Detik</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[2.2fr_1fr] lg:gap-3.5">
          <div className="overflow-hidden rounded-[24px] border border-[#e8e8e8] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
            <div className="px-8 pb-6 pt-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#9a9a9a]">
                    {paymentLabel}
                  </p>
                  <div className="text-[26px] font-extrabold leading-tight tracking-[0.04em] text-[#2d7e39]">
                    {paymentCode}
                  </div>
                  <div className="mt-3 inline-flex items-center rounded-full border border-[#f5b8b3] bg-[#fff5f4] px-3.5 py-1 text-[12px] font-semibold tracking-wide text-[#d63a31]">
                    ● Belum Bayar
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyVA}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] border border-[#e0e0e0] bg-[#f7f7f5] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all hover:bg-[#ececec] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] active:scale-95"
                  aria-label="Copy payment code"
                >
                  <Copy className="h-5 w-5 text-[#27275f]" />
                </button>
              </div>

              <div className="my-6 h-px bg-[#f0f0f0]" />

              <div className="flex items-center justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#9a9a9a]">
                    Total Pembayaran
                  </p>
                  <div className="mt-7 text-[31px] font-extrabold text-[#2d7e39]">
                    {totalPayment}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[12.5px] text-[#9a9a9a]">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    Selesaikan sebelum batas waktu berakhir
                  </div>
                </div>

                <div className="hidden min-w-[150px] items-center justify-center rounded-[16px] bg-white px-6 py-5 shadow-none sm:flex">
                  {paymentLogo ? (
                    <img
                      src={paymentLogo}
                      alt={bankLabel}
                      className="h-[130px] w-auto max-w-[170px] object-contain"
                    />
                  ) : null}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-[14px] border border-[#c5ddc6] bg-[#f0f8f0] px-4 py-3.5">
                <div className="flex-shrink-0 rounded-full bg-[#2a7c39]/10 p-1.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#2a7c39]" />
                </div>
                <div className="min-w-0">
                  <p className="mb-0.5 text-[13px] font-semibold leading-none text-[#1e6b2b]">
                    Pembayaran Aman
                  </p>
                  <p className="text-[12px] leading-snug text-[#5a7d5e]">
                    Data Anda aman · Diverifikasi otomatis setelah pembayaran
                    berhasil
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-8 h-px bg-[#efefef]" />
            <div className="py-1" />

            <div className="divide-y divide-[#f0f0f0] px-2 pb-2">
              {paymentKind === "bank" ? (
                <>
                  <Section
                    id="mbanking"
                    title="Petunjuk Transfer mBanking"
                    icon={Smartphone}
                    items={instructions.mbanking}
                  />
                  <Section
                    id="atm"
                    title="Petunjuk Transfer ATM"
                    icon={Landmark}
                    items={instructions.atm}
                  />
                  <Section
                    id="mini"
                    title="Petunjuk Transfer Mini ATM / EDC"
                    icon={Building2}
                    items={instructions.mini}
                  />
                  <Section
                    id="setor"
                    title="Petunjuk Transfer Setor Tunai"
                    icon={Banknote}
                    items={instructions.setor}
                  />
                </>
              ) : (
                <Section
                  id="bayar"
                  title={paymentGuideTitle}
                  icon={paymentGuideIcon}
                  items={instructions.bayar}
                />
              )}
            </div>
          </div>

          <div className="rounded-[22px] border border-[#d5d5d5] bg-[#eef4ec] px-6 py-4 shadow-[0_8px_18px_rgba(0,0,0,0.06)]">
            <h3 className="text-[31px] font-medium leading-none">Detail Pesanan</h3>

            <div className="mt-5 space-y-8">
              {detailItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex gap-4">
                    <Icon
                      className="mt-1 h-9 w-9 shrink-0 text-black"
                      strokeWidth={2.2}
                    />
                    <div className="min-w-0">
                      <div className="text-[19px] font-semibold leading-tight text-[#1d1d1d]">
                        {item.title}
                      </div>
                      <div className="mt-1 text-[18px] leading-tight text-[#7d7d7d]">
                        {item.value}
                      </div>
                      {item.subvalue ? (
                        <div className="text-[18px] leading-tight text-[#7d7d7d]">
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
                  <div className="mb-3 text-[18px] font-semibold text-[#111]">
                    Layanan Tambahan
                  </div>

                  <div className="space-y-2">
                    {selectedServiceDetails.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-[15px]"
                      >
                        <span>
                          {item.layanan?.nama_layanan || "-"} x {item.qty}
                        </span>

                        <span className="font-medium">
                          Rp {Number(
                            item.subtotal || 0
                          ).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 border-t border-[#d7d7d7] pt-3 flex items-center justify-between">
                    <span className="font-semibold">
                      Total Layanan
                    </span>

                    <span className="font-bold text-[#2a7f30]">
                      Rp{" "}
                      {Number(
                        paymentData?.subtotal_layanan || 0
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {/* ✅ NEW: tombol ke halaman pesanan */}
            <button
              type="button"
              onClick={() => navigate("/pesanan")}
              className="mt-8 flex w-full items-center justify-center rounded-[16px] bg-[#2a7f30] px-4 py-3 text-[15px] font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.08)] transition hover:brightness-95 active:scale-[0.99] md:text-[16px]"
            >
              CEK DETAIL PESANAN ANDA
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1f7f2f] px-5 py-3 text-white shadow-lg transition-all duration-300 ${
          copied
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        Kode pembayaran berhasil disalin
      </div>
    </div>
  );
}