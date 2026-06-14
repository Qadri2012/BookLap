import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import {
  getLapanganById,
  createLapangan,
  updateLapangan,
} from "../../services/api";

const fasilitasList = [
  "Food Court",
  "Cafe R57",
  "Coffee Area",
  "Mushollah",
  "Ruang Ganti",
  "Kamar Mandi",
  "Toilet",
  "Parkiran Motor",
  "Parkiran Mobil",
  "Tribun",
  "Lampu LED",
];

export default function AdminLapanganForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    tipe: "futsal",
    alamat: "",
    harga: "",
    kapasitas: "",
    ukuran: "",
    permukaan: "",
    deskripsi: "",
    foto: "",
    jam_buka: "",
    jam_tutup: "",
    latitude: "",
    longitude: "",
    courts: 1,
    fasilitas: [],
  });

  useEffect(() => {
    if (isEdit) {
      loadLapangan();
    }
  }, [id]);

  const loadLapangan = async () => {
    try {
      setLoading(true);

      const data = await getLapanganById(id);

      setForm({
        nama: data.nama || "",
        tipe: data.tipe || "futsal",
        alamat: data.alamat || "",
        harga: data.harga || "",
        kapasitas: data.kapasitas || "",
        ukuran: data.ukuran || "",
        permukaan: data.permukaan || "",
        deskripsi: data.deskripsi || "",
        foto: data.foto?.[0] || "",
        jam_buka: data.jam_buka || "",
        jam_tutup: data.jam_tutup || "",
        latitude: data.latitude || "",
        longitude: data.longitude || "",
        courts: data.courts?.length || 1,
        fasilitas: data.fasilitas || [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFacilityChange = (item) => {
    const exists = form.fasilitas.includes(item);

    if (exists) {
      setForm({
        ...form,
        fasilitas: form.fasilitas.filter((x) => x !== item),
      });
    } else {
      setForm({
        ...form,
        fasilitas: [...form.fasilitas, item],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const courtsArray = Array.from(
        { length: Number(form.courts) },
        (_, i) => `Lapangan ${i + 1}`
      );

      const payload = {
        nama: form.nama,
        tipe: form.tipe,
        alamat: form.alamat,
        harga: Number(form.harga),
        kapasitas: Number(form.kapasitas),
        ukuran: form.ukuran,
        permukaan: form.permukaan,
        deskripsi: form.deskripsi,
        foto: form.foto ? [form.foto] : [],
        fasilitas: form.fasilitas,
        jam_buka: form.jam_buka,
        jam_tutup: form.jam_tutup,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        courts: courtsArray,
      };

      if (isEdit) {
        await updateLapangan(id, payload);
        alert("Lapangan berhasil diperbarui");
      } else {
        await createLapangan(payload);
        alert("Lapangan berhasil ditambahkan");
      }

      navigate("/admin/lapangan");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan lapangan");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit Lapangan" : "Tambah Lapangan"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">

          <input
            name="nama"
            value={form.nama}
            onChange={handleChange}
            placeholder="Nama Lapangan"
            className="rounded-xl border px-4 py-3"
          />

          <select
            name="tipe"
            value={form.tipe}
            onChange={handleChange}
            className="rounded-xl border px-4 py-3"
          >
            <option value="futsal">Futsal</option>
            <option value="minisoccer">Mini Soccer</option>
          </select>

          <input
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            placeholder="Alamat"
            className="rounded-xl border px-4 py-3"
          />

          <input
            name="harga"
            value={form.harga}
            onChange={handleChange}
            placeholder="Harga"
            className="rounded-xl border px-4 py-3"
          />

          <input
            name="kapasitas"
            value={form.kapasitas}
            onChange={handleChange}
            placeholder="Kapasitas"
            className="rounded-xl border px-4 py-3"
          />

          <input
            name="ukuran"
            value={form.ukuran}
            onChange={handleChange}
            placeholder="Ukuran"
            className="rounded-xl border px-4 py-3"
          />

          <input
            name="permukaan"
            value={form.permukaan}
            onChange={handleChange}
            placeholder="Permukaan"
            className="rounded-xl border px-4 py-3"
          />

          <input
            name="courts"
            value={form.courts}
            onChange={handleChange}
            placeholder="Jumlah Lapangan"
            className="rounded-xl border px-4 py-3"
          />

          <input
            name="jam_buka"
            value={form.jam_buka}
            onChange={handleChange}
            placeholder="Jam Buka"
            className="rounded-xl border px-4 py-3"
          />

          <input
            name="jam_tutup"
            value={form.jam_tutup}
            onChange={handleChange}
            placeholder="Jam Tutup"
            className="rounded-xl border px-4 py-3"
          />

          <input
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            placeholder="Latitude"
            className="rounded-xl border px-4 py-3"
          />

          <input
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            placeholder="Longitude"
            className="rounded-xl border px-4 py-3"
          />

          <input
            name="foto"
            value={form.foto}
            onChange={handleChange}
            placeholder="URL Foto"
            className="rounded-xl border px-4 py-3 md:col-span-2"
          />

        </div>

        <textarea
          name="deskripsi"
          value={form.deskripsi}
          onChange={handleChange}
          rows="5"
          placeholder="Deskripsi"
          className="mt-4 w-full rounded-xl border px-4 py-3"
        />

        <div className="mt-6">
          <h3 className="font-semibold mb-3">
            Fasilitas
          </h3>

          <div className="grid md:grid-cols-3 gap-2">
            {fasilitasList.map((item) => (
              <label
                key={item}
                className="flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  checked={form.fasilitas.includes(item)}
                  onChange={() =>
                    handleFacilityChange(item)
                  }
                />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white"
          >
            {isEdit
              ? "Simpan Perubahan"
              : "Simpan Lapangan"}
          </button>

          <Link
            to="/admin/lapangan"
            className="rounded-xl border px-5 py-3 font-semibold"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}