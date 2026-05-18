import { useParams } from "react-router-dom";
// import { FUTSAL_FIELDS, MINI_FIELDS } from "../Data/datalapangan";

function TempatLapangan() {
  const { id } = useParams();

  // 🔥 Gabungkan semua data
  const semuaLapangan = [...FUTSAL_FIELDS, ...MINI_FIELDS];

  // 🔥 Cari berdasarkan ID
  const lapangan = semuaLapangan.find(
    (item) => item.id === Number(id)
  );

  if (!lapangan) {
    return (
      <h2 className="p-6 text-center text-red-500">
        Lapangan tidak ditemukan
      </h2>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e0c] text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* 🔥 Gambar */}
        <img
          src={lapangan.img}
          alt={lapangan.name}
          className="w-full h-[350px] object-cover rounded-2xl mb-6"
        />

        {/* 🔥 Info */}
        <h1 className="text-3xl font-bold mb-2">
          {lapangan.name}
        </h1>

        <p className="text-gray-400 mb-2">
          📍 {lapangan.addr}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-yellow-400">
            {"★".repeat(lapangan.stars)}
          </span>
          <span>{lapangan.rating}</span>
          <span className="text-gray-500">
            ({lapangan.reviews} ulasan)
          </span>
        </div>

        <h3 className="text-green-400 text-xl font-semibold mb-2">
          Rp {lapangan.price} / jam
        </h3>

        <p className="text-gray-300 mb-4">
          🕒 {lapangan.buka}
        </p>

        {/* 🔥 Fasilitas */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Fasilitas:</h4>
          <div className="flex flex-wrap gap-2">
            {lapangan.fasilitas.map((f, i) => (
              <span
                key={i}
                className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* 🔥 Deskripsi */}
        <p className="text-gray-300 mb-6">
          {lapangan.deskripsi}
        </p>

        {/* 🔥 Button */}
        <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold">
          Booking Sekarang
        </button>
      </div>
    </div>
  );
}

export default TempatLapangan;