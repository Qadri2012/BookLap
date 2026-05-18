import { Link } from "react-router-dom";

const OPTIONS = [
  {
    title: "Login Sebagai Pengguna",
    desc: "Temukan dan pesan lapangan olahraga favorit Anda dengan mudah.",
    benefits: [
      "Akses ke berbagai lapangan",
      "Booking cepat tanpa ribet",
      "Jadwal real-time",
      "Pembayaran fleksibel",
    ],
    to: "/login/user",
  },
  {
    title: "Login Sebagai Mitra",
    desc: "Kelola bisnis lapangan Anda dan tingkatkan pendapatan.",
    benefits: [
      "Manajemen booking digital",
      "Jangkauan pasar luas",
      "Laporan otomatis",
      "Kontrol penuh bisnis",
    ],
    to: "/login/mitra",
  },
  {
    title: "Login Admin Komunitas",
    desc: "Kelola komunitas olahraga dengan mudah.",
    benefits: [
      "Dashboard komunitas",
      "Kelola event & jadwal",
      "Pantau anggota",
      "Integrasi lapangan",
    ],
    to: "/login/admin",
  },
];

export default function LoginSelect() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* 🔥 CONTENT TURUN SEDIKIT */}
      <div className="flex-1 flex items-start pt-28 max-w-6xl mx-auto px-6">

        <div className="grid md:grid-cols-3 gap-8 w-full items-stretch">

          {OPTIONS.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm
              flex flex-col h-full"
            >
              {/* ICON */}
              <div className="w-12 h-12 bg-[#186d22] rounded-xl flex items-center justify-center text-white text-xl mb-4">
                👤
              </div>

              {/* TITLE */}
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {item.title}
              </h3>

              {/* DESC */}
              <p className="text-sm text-gray-500 mb-4">
                {item.desc}
              </p>

              {/* BENEFITS */}
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                {item.benefits.map((b, idx) => (
                  <li key={idx}>✔ {b}</li>
                ))}
              </ul>

              {/* 🔥 BUTTON SELALU DI BAWAH */}
              <Link
                to={item.to}
                className="mt-auto block w-full text-center
                bg-[#186d22] hover:bg-[#186d22]
                text-white py-3 rounded-xl font-semibold transition"
              >
                {item.title}
              </Link>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}