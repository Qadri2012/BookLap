import { useEffect, useState } from "react";
import {
  getAdminLapangan,
  getJadwal,
} from "../../services/api";

export default function AdminJadwal() {
  const [lapangan, setLapangan] = useState([]);

  const [lapanganId, setLapanganId] = useState("");
  const [tanggal, setTanggal] =
  useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );

  const [jadwal, setJadwal] = useState([]);

  useEffect(() => {
    loadLapangan();
  }, []);

  const loadLapangan = async () => {
    try {
      const data = await getAdminLapangan();
      setLapangan(data);
    } catch (err) {
      console.error(err);
    }
  };

 const loadJadwal = async () => {
  if (!lapanganId) return;

  const data = await getJadwal({
    lapangan_id: lapanganId,
  });

  setJadwal(data);
};

  useEffect(() => {
  loadJadwal();
}, [lapanganId]);

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">
          Manajemen Jadwal
        </h1>

        <p className="text-sm text-slate-500">
          Generate jadwal lapangan.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border">

        <div className="grid md:grid-cols-4 gap-4">

          <select
            value={lapanganId}
            onChange={(e) =>
              setLapanganId(e.target.value)
            }
            className="border rounded-xl p-3"
          >
            <option value="">
              Pilih Lapangan
            </option>

            {lapangan.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.nama}
              </option>
            ))}
          </select>

        </div>

      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border">

        <h2 className="font-bold mb-4">
          Slot Jadwal
        </h2>

        <table className="w-full text-sm">
          <thead>
            <tr>
                <th>Jam Mulai</th>
                <th>Jam Selesai</th>
                <th>Harga</th>
                <th>Status</th>
                <th>Pemesan</th>
                <th>Kode Pesanan</th>
            </tr>
            </thead>

          <tbody>
            {jadwal.map((item) => (
              <tr key={item.id}>
                <td>{item.jam_mulai}</td>
                <td>{item.jam_selesai}</td>
                <td>
                  Rp{" "}
                  {Number(item.harga).toLocaleString(
                    "id-ID"
                  )}
                </td>
                <td>
                <span
                    className={
                    item.status === "booking"
                        ? "text-red-600 font-semibold"
                        : "text-green-600 font-semibold"
                    }
                >
                    {item.status}
                </span>
                </td>

                <td>{item.pemesan}</td>

                <td>{item.kodePemesanan}</td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}