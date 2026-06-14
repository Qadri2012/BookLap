import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAdminLapangan,
  deleteLapangan,
} from "../../services/api";

export default function AdminLapangan() {
  const [lapangan, setLapangan] = useState([]);
  const [search, setSearch] = useState("");
  const [filterTipe, setFilterTipe] = useState("semua");

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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus lapangan?"
    );

    if (!confirmDelete) return;

    try {
      await deleteLapangan(id);
      loadLapangan();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus lapangan");
    }
  };

  const filteredData = lapangan.filter((item) => {
    const matchSearch =
      item.nama
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchTipe =
      filterTipe === "semua"
        ? true
        : item.tipe === filterTipe;

    return matchSearch && matchTipe;
  });

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Manajemen Lapangan
          </h1>

          <p className="text-sm text-slate-600">
            Lihat dan atur semua lapangan.
          </p>
        </div>

        <Link
          to="/admin/lapangan/tambah"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Tambah Lapangan
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Cari lapangan..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
          />

          <select
            value={filterTipe}
            onChange={(e) =>
              setFilterTipe(e.target.value)
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
          >
            <option value="semua">
              Semua Tipe
            </option>

            <option value="futsal">
              Futsal
            </option>

            <option value="minisoccer">
              Mini Soccer
            </option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">

            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3">Nama</th>
                <th>Tipe</th>
                <th>Harga</th>
                <th>Rating</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100"
                >
                  <td className="py-4 font-medium">
                    {item.nama}
                  </td>

                  <td>{item.tipe}</td>

                  <td>
                    Rp{" "}
                    {Number(
                      item.harga || 0
                    ).toLocaleString("id-ID")}
                  </td>

                  <td>
                    ⭐ {item.rating || 0}
                  </td>

                  <td className="space-x-2 py-4">

                    <Link
                      to={`/admin/lapangan/edit/${item.id}`}
                      className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Hapus
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}