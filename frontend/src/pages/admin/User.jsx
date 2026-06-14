// NEW: src/pages/admin/User.jsx
const users = [
  { id: 1, nama: "Andi", email: "andi@mail.com", status: "Aktif" },
  { id: 2, nama: "Sinta", email: "sinta@mail.com", status: "Diblokir" },
  { id: 3, nama: "Rizky", email: "rizky@mail.com", status: "Aktif" },
];

export default function AdminUser() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manajemen User</h1>
        <p className="text-sm text-slate-600">Kelola akun pengguna sistem.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-5 py-4">Nama</th>
              <th>Email</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="px-5 py-4 font-medium text-slate-900">{item.nama}</td>
                <td>{item.email}</td>
                <td>{item.status}</td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
                      Riwayat
                    </button>
                    <button className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white">
                      Blokir / Unblokir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}