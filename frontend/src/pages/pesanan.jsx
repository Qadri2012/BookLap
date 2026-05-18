// pesanan

import Footer from "../components/Footer";

export default function Pesanan() {
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
        <div className="text-center py-20 relative">

          {/* BACKGROUND LOGO */}
          <img
            src="/logo.png"
            alt="bg"
            className="absolute left-1/2 -translate-x-1/2 top-10 w-[500px] opacity-10 pointer-events-none"
          />

          <h2 className="text-3xl font-bold mb-2 relative z-10">
            Belum Ada Pesanan
          </h2>

          <p className="text-gray-600 mb-6 relative z-10">
            Anda belum memiliki pesanan apapun yuk,<br />
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
  <Footer />
}