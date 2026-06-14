import { useEffect, useMemo, useState } from "react";

import {
  getAllPemesanan,
  updateStatusPemesanan,
  setujuiPembatalan,
} from "../../services/api";

export default function AdminBooking() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedBooking, setSelectedBooking] =
  useState(null);
  useEffect(() => {
  console.log("SELECTED BOOKING =");
  console.log(selectedBooking);
}, [selectedBooking]);

  const loadData = async () => {
    try {
      setLoading(true);

      const data =
        await getAllPemesanan();

      setBookings(data || []);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil data booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    return bookings.filter((item) => {
      const text = `
        ${item.kode_pemesanan || ""}
        ${item.nama_pemesan || ""}
        ${item.email || ""}
      `.toLowerCase();

      return text.includes(
        keyword.toLowerCase()
      );
    });
  }, [bookings, keyword]);

  const handleKonfirmasiPembayaran =
    async (id) => {
      try {
        await updateStatusPemesanan(
          id,
          "booking"
        );

        await loadData();

        alert(
          "Pembayaran berhasil dikonfirmasi"
        );
      } catch (err) {
        console.error(err);
      }
    };

  const handleSetujuiPembatalan =
    async (id) => {
      try {
        await setujuiPembatalan(id);

        await loadData();

        alert(
          "Pembatalan berhasil disetujui"
        );
      } catch (err) {
        console.error(err);
      }
    };

  const renderStatus = (status) => {
    switch (status) {
      case "menunggu_pembayaran":
        return (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            Menunggu Pembayaran
          </span>
        );

      case "menunggu_kedatangan":
        return (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Menunggu Kedatangan
          </span>
        );

      case "booking":
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Sedang Bermain
          </span>
        );

      case
        "menunggu_persetujuan_pembatalan":
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            Menunggu Pembatalan
          </span>
        );

      case "dibatalkan":
        return (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            Dibatalkan
          </span>
        );

      case "expired":
        return (
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            Expired
          </span>
        );

      case "selesai":
        return (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Selesai
          </span>
        );

      default:
        return status;
    }
  };
const getPaymentLabel = (item) => {
  if (item.payment_channel === "cash") {
    return "💵 CASH";
  }

  const va = String(item.va_number || "");

  if (va.startsWith("451")) {
    return "🏦 TRANSFER BSI";
  }

  if (va.startsWith("009")) {
    return "🏦 TRANSFER BNI";
  }

  if (va.startsWith("002")) {
    return "🏦 TRANSFER BRI";
  }

  if (va.startsWith("008")) {
    return "🏦 TRANSFER MANDIRI";
  }

  if (item.payment_channel === "ewallet") {
    return "📱 E-WALLET";
  }

  if (item.payment_channel === "minimarket") {
    return "🏪 INDOMARET";
  }

  return "🏦 TRANSFER";
};

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">
          Manajemen Booking
        </h1>

        <p className="text-sm text-slate-500">
          Kelola seluruh booking
          pelanggan
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">

        <input
          type="text"
          placeholder="Cari nama / email / kode booking..."
          value={keyword}
          onChange={(e) =>
            setKeyword(e.target.value)
          }
          className="w-full rounded-xl border px-4 py-3"
        />

      </div>
      <div className="grid gap-4">

  {!loading &&
    filteredData.map((item) => (

      <div
        key={item.id}
        onClick={() =>
          setSelectedBooking(item)
        }
        className="
          cursor-pointer
          rounded-2xl
          bg-white
          p-5
          shadow-sm
          border
          hover:border-green-500
          hover:shadow-lg
          transition-all
        "
      >

        <div className="flex items-start justify-between">

          <div>

            <h3 className="font-bold text-lg">
              {item.kode_pemesanan ||
                item.va_number ||
                item.payment_reference ||
                `#${item.id}`}
            </h3>

            <div className="mt-2 flex items-center gap-2">

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  item.payment_channel === "cash"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {getPaymentLabel(item)}
              </span>

            </div>

            <p className="mt-2 text-slate-500">
              {item.nama_pemesan}
            </p>

            <p className="text-slate-500 text-sm">
              {item.email}
            </p>

          </div>

          <div>
            {renderStatus(
              item.status_pemesanan
            )}
          </div>

        </div>

        <div className="mt-4 flex items-center justify-between">

          <div>

            <p className="text-xs text-slate-400">
              Total Pembayaran
            </p>

            <p className="font-bold text-green-600">
              Rp{" "}
              {Number(
                item.total_bayar || 0
              ).toLocaleString("id-ID")}
            </p>

          </div>

          <button
            className="
              rounded-lg
              bg-green-600
              px-4
              py-2
              text-white
              text-sm
              font-semibold
            "
          >
            Lihat Detail
          </button>

        </div>

      </div>

    ))}

</div>
{selectedBooking && (

  <div
    className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/50
      p-5
    "
  >

    <div
      className="
        max-h-[90vh]
        w-full
        max-w-4xl
        overflow-y-auto
        rounded-3xl
        bg-white
        p-6
      "
    >

      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-2xl font-bold">
          Detail Booking
        </h2>

        <button
          onClick={() =>
            setSelectedBooking(null)
          }
          className="
            rounded-lg
            bg-red-500
            px-4
            py-2
            text-white
          "
        >
          Tutup
        </button>

      </div>

    <div className="space-y-6">

  {/* INFORMASI PEMBAYARAN */}
  <div className="rounded-2xl border p-5">
    <h3 className="mb-4 text-lg font-bold">
      Informasi Pembayaran
    </h3>

    <div className="grid gap-4 md:grid-cols-3">

      <div>
        <p className="text-xs text-slate-400">
          Metode Pembayaran
        </p>

        <p className="font-semibold">
          {selectedBooking.payment_channel}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-400">
          Nomor VA / Kode Bayar
        </p>

        <p className="font-semibold break-all">
          {selectedBooking.va_number ||
            selectedBooking.payment_reference ||
            selectedBooking.kode_pemesanan}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-400">
          Total Bayar
        </p>

        <p className="font-bold text-green-600">
          Rp{" "}
          {Number(
            selectedBooking.total_bayar || 0
          ).toLocaleString("id-ID")}
        </p>
      </div>

    </div>
  </div>


  {/* INFORMASI PEMESAN */}
  <div className="rounded-2xl border p-5">
    <h3 className="mb-4 text-lg font-bold">
      Informasi Pemesan
    </h3>

    <div className="grid gap-4 md:grid-cols-2">

      <div>
        <p className="text-xs text-slate-400">
          Nama Pemesan
        </p>

        <p className="font-semibold">
          {selectedBooking.nama_pemesan}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-400">
          Email
        </p>

        <p className="font-semibold">
          {selectedBooking.email}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-400">
          WhatsApp
        </p>

        <p className="font-semibold">
          {selectedBooking.no_whatsapp}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-400">
          Status
        </p>

        {renderStatus(
          selectedBooking.status_pemesanan
        )}
      </div>

    </div>
  </div>

  {/* INFORMASI BOOKING */}
  <div className="rounded-2xl border p-5">
    <h3 className="mb-4 text-lg font-bold">
      Informasi Booking
    </h3>

    {selectedBooking.detail_pemesanan?.map(
      (slot, index) => (
        <div
          key={index}
          className="mb-3 rounded-xl bg-slate-50 p-4"
        >

          <div className="grid gap-3 md:grid-cols-2">

            <div>
              <p className="text-xs text-slate-400">
                Lapangan
              </p>

              <p className="font-semibold">
                {slot.nama_lapangan}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Nomor Lapangan
              </p>

              <p className="font-semibold">
                {slot.nomor_lapangan}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Tanggal
              </p>

              <p className="font-semibold">
                {slot.tanggal}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Jam
              </p>

              <p className="font-semibold">
                {slot.jam_mulai} -
                {slot.jam_selesai}
              </p>
            </div>

          </div>

        </div>
      )
    )}

    <div className="mt-4">

      <p className="text-xs text-slate-400">
        Lokasi
      </p>

      <p className="font-semibold">
        {selectedBooking.lapangan?.alamat}
      </p>

    </div>

  </div>

  {/* LAYANAN TAMBAHAN */}
  {selectedBooking.detail_layanan
    ?.length > 0 && (
    <div className="rounded-2xl border p-5">

      <h3 className="mb-4 text-lg font-bold">
        Layanan Tambahan
      </h3>

      <div className="space-y-3">

        {selectedBooking.detail_layanan.map(
          (item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
            >
              <div>
                <p className="font-semibold">
                  {
                    item.layanan
                      ?.nama_layanan
                  }
                </p>

                <p className="text-xs text-slate-500">
                  Qty : {item.qty}
                </p>
              </div>

              <p className="font-bold text-green-600">
                Rp{" "}
                {Number(
                  item.subtotal
                ).toLocaleString("id-ID")}
              </p>
            </div>
          )
        )}

      </div>

      <div className="mt-4 flex justify-between border-t pt-4">

        <span className="font-semibold">
          Total Layanan
        </span>

        <span className="font-bold text-green-600">
          Rp{" "}
          {Number(
            selectedBooking.subtotal_layanan || 0
          ).toLocaleString("id-ID")}
        </span>

      </div>
      {/* ALASAN PEMBATALAN */}
{selectedBooking.alasan_batal && (
  <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

    <h3 className="mb-3 text-lg font-bold text-red-700">
      Alasan Pembatalan
    </h3>

    <p className="rounded-xl bg-white p-4 text-slate-700">
      {selectedBooking.alasan_batal}
    </p>

  </div>
)}

    </div>
  )}

</div>

      <div className="mt-8 flex gap-3">

        {selectedBooking.status_pemesanan ===
          "menunggu_pembayaran" && (

          <button
            onClick={() =>
              handleKonfirmasiPembayaran(
                selectedBooking.id
              )
            }
            className="
              rounded-xl
              bg-green-600
              px-5
              py-3
              font-semibold
              text-white
            "
          >
            Konfirmasi Pembayaran
          </button>
        )}

        {selectedBooking.status_pemesanan ===
          "menunggu_kedatangan" && (

          <button
            onClick={() =>
              handleKonfirmasiPembayaran(
                selectedBooking.id
              )
            }
            className="
              rounded-xl
              bg-blue-600
              px-5
              py-3
              font-semibold
              text-white
            "
          >
            Sudah Dibayar
          </button>
        )}

        {selectedBooking.status_pemesanan ===
          "menunggu_persetujuan_pembatalan" && (

          <button
            onClick={() =>
              handleSetujuiPembatalan(
                selectedBooking.id
              )
            }
            className="
              rounded-xl
              bg-red-600
              px-5
              py-3
              font-semibold
              text-white
            "
          >
            Setujui Pembatalan
          </button>
        )}

      </div>

    </div>

  </div>

)}
   
    </div>
  );
}