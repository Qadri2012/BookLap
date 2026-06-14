import { useEffect, useState } from "react";
import {
  approveAdmin,
  rejectAdmin,
  getPendingAdmins,
} from "../../services/api";

export default function AdminApproval() {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPendingAdmins = async () => {
    try {
      setLoading(true);

      const data = await getPendingAdmins();

      setPendingAdmins(data?.data || []);
    } catch (err) {
      console.error("LOAD PENDING ADMINS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingAdmins();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveAdmin(id);

      alert("Admin berhasil disetujui");

      await loadPendingAdmins();
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "Gagal menyetujui admin"
      );
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectAdmin(id);

      alert("Admin berhasil ditolak");

      await loadPendingAdmins();
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          "Gagal menolak admin"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Approval Admin
        </h1>

        <p className="text-sm text-slate-600">
          Halaman ini digunakan oleh Super Admin untuk
          menyetujui atau menolak akun admin yang masih
          berstatus pending.
        </p>
      </div>

      {/* CARD */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">
            Memuat data admin...
          </p>
        ) : pendingAdmins.length === 0 ? (
          <p className="text-sm text-slate-500">
            Tidak ada admin yang menunggu persetujuan.
          </p>
        ) : (
          <div className="space-y-4">
            {pendingAdmins.map((admin) => (
              <div
                key={admin.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {admin.nama}
                  </p>

                  <p className="text-sm text-slate-500">
                    {admin.email}
                  </p>

                  <p className="text-sm text-slate-500">
                    NIP :{" "}
                    {admin.nomor_identitas || "-"}
                  </p>

                  <p className="text-sm text-slate-500">
                    Level Akses :{" "}
                    {admin.level_akses || "-"}
                  </p>

                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 mt-2">
                    {admin.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleApprove(admin.id)
                    }
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      handleReject(admin.id)
                    }
                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}