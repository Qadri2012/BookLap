// src/pages/transfer.jsx
import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import briLogo from "../assets/bank/bri.png";
import bniLogo from "../assets/bank/bni.png";
import bsiLogo from "../assets/bank/bsi.png";
import mandiriLogo from "../assets/bank/mandiri.png";
import indomaretLogo from "../assets/bank/indomaret.png";
import ewalletLogo from "../assets/bank/ewallet.png";
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

const bankLabelMap = {
  bni: "BNI",
  bri: "BRI",
  bsi: "BSI",
  mandiri: "Mandiri",
  indomaret: "Indomaret",
  ewallet: "E-Wallet",
};

const bankLogoMap = {
  bni: bniLogo,
  bri: briLogo,
  bsi: bsiLogo,
  mandiri: mandiriLogo,
  indomaret: indomaretLogo,
  ewallet: ewalletLogo,
};

const rupiah = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

export default function Transfer() {
  const location = useLocation();
  const [openSection, setOpenSection] = useState("mbanking");
  const [copied, setCopied] = useState(false);

  const {
    field,
    selectedSlots = [],
    totalPrice = 0,
    totalDurationMinutes = 0,
    selectedTransferMethod = "bri",
  } = location.state || {};

  const bankLabel = bankLabelMap[selectedTransferMethod] || "BRI";
  const bankLogo = bankLogoMap[selectedTransferMethod] || briLogo;
  const totalPayment = rupiah(totalPrice);

  const vaNumber = "112 0893 4175 08745";

  const detailItems = useMemo(
    () => [
      {
        icon: CalendarDays,
        title: "Tanggal & Waktu",
        value: selectedSlots?.[0]
          ? new Date(`${selectedSlots[0].tanggal}T00:00:00`).toLocaleDateString(
              "id-ID",
              {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )
          : "-",
        subvalue: selectedSlots?.[0]
          ? `${selectedSlots[0].jam_mulai.slice(0, 5)} - ${selectedSlots[0].jam_selesai.slice(0, 5)}`
          : "",
      },
      {
        icon: Building2,
        title: "Lapangan",
        value: selectedSlots?.[0]?.court_no
          ? `Lapangan ${selectedSlots[0].court_no}`
          : "Lapangan",
        subvalue: "",
      },
      {
        icon: Clock3,
        title: "Durasi Bermain",
        value: totalDurationMinutes
          ? `${totalDurationMinutes / 60} Jam`
          : "-",
        subvalue: "",
      },
      {
        icon: MapPin,
        title: "Lokasi",
        value: field?.alamat?.split(",")?.[0] || "Lokasi",
        subvalue: field?.alamat?.split(",")?.slice(1).join(",") || "",
      },
    ],
    [field, selectedSlots, totalDurationMinutes]
  );

  const instructions = {
    mbanking: [
      {
        num: 1,
        text: (
          <>
            masuk ke menu <b>Mobile Banking BRI</b>. Kemudian, pilih{" "}
            <b>Pembayaran &gt; BRIVA</b>
          </>
        ),
      },
      {
        num: 2,
        text: (
          <>
            Masukkan <b>Nomor BRIVA</b>{" "}
            <span className="font-semibold text-red-500">{vaNumber}</span>
          </>
        ),
      },
      {
        num: 3,
        text: (
          <>
            Masukkan <b>PIN Anda</b> kemudian pilih <b>Send</b>. Apabila pesan
            konfirmasi untuk transaksi menggunakan SMS muncul, pilih <b>OK</b>.
            Status transaksi akan dikirimkan melalui SMS dan dapat digunakan
            sebagai bukti pembayaran
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
            Pilih menu <b>BRIVA</b>, lalu masukkan <b>{vaNumber}</b>
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
            Datangi <b>Mini ATM / EDC BRI</b> terdekat dan pilih menu{" "}
            <b>Pembayaran</b>
          </>
        ),
      },
      {
        num: 2,
        text: (
          <>
            Masukkan <b>Nomor BRIVA</b>{" "}
            <span className="font-semibold text-red-500">{vaNumber}</span>
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
            Kunjungi teller <b>BRI</b> dan informasikan bahwa Anda ingin
            melakukan pembayaran <b>BRIVA</b>
          </>
        ),
      },
      {
        num: 2,
        text: (
          <>
            Berikan <b>Nomor BRIVA</b>{" "}
            <span className="font-semibold text-red-500">{vaNumber}</span>
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

  const copyVA = async () => {
    try {
      await navigator.clipboard.writeText("1120893417508745");
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
                  Pesanan Menunggu Pembayaran
                </h1>

                <p className="mt-4 max-w-full text-[14px] leading-none text-[#111]">
                  Terima Kasih! Pesanan Anda Telah Berhasil Dibuat.
                  <span className="mx-3 text-[#111]">|</span>
                  Silahkan Lakukan Pembayaran Sebelum Batas Waktu Berakhir
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
                    <span>00</span>
                    <span className="px-1">:</span>
                    <span>00</span>
                    <span className="px-1">:</span>
                    <span>00</span>
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
                    Nomor Virtual Account
                  </p>
                  <div className="text-[26px] font-extrabold leading-tight tracking-[0.04em] text-[#2d7e39]">
                    {vaNumber}
                  </div>
                  <div className="mt-3 inline-flex items-center rounded-full border border-[#f5b8b3] bg-[#fff5f4] px-3.5 py-1 text-[12px] font-semibold tracking-wide text-[#d63a31]">
                    ● Belum Bayar
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyVA}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] border border-[#e0e0e0] bg-[#f7f7f5] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all hover:bg-[#ececec] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] active:scale-95"
                  aria-label="Copy virtual account"
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
                  <img
                    src={bankLogo}
                    alt={bankLabel}
                    className="h-[130px] w-auto max-w-[170px] object-contain"
                  />
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
                    Data Anda aman · Diverifikasi otomatis setelah transfer berhasil
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-8 h-px bg-[#efefef]" />
            <div className="py-1" />

            <div className="divide-y divide-[#f0f0f0] px-2 pb-2">
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
            </div>
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
        Nomor VA berhasil disalin
      </div>
    </div>
  );
}