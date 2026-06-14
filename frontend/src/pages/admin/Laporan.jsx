// NEW: src/pages/admin/Laporan.jsx
const reportCards = [
  { label: "Pendapatan Bulan Ini", value: "Rp 28.500.000" },
  { label: "Booking Terbanyak", value: "Sabtu" },
  { label: "Lapangan Paling Populer", value: "Galaxy Futsal" },
];

export default function AdminLaporan() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Laporan & Statistik</h1>
        <p className="text-sm text-slate-600">Ringkasan performa sistem.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {reportCards.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Grafik Pendapatan</h2>
        <div className="mt-5 flex h-64 items-end gap-3 rounded-2xl bg-slate-50 p-4">
          {[40, 55, 68, 52, 75, 88, 62].map((h, i) => (
            <div key={i} className="flex-1">
              <div
                className="w-full rounded-t-xl bg-slate-900"
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}