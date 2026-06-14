// jadwalController.js

const Lapangan = require("../models/lapangan");
const Jadwal = require("../models/jadwal");



function toNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

exports.getJadwal = async (req, res) => {
  try {
    const lapanganId = toNumber(req.query.lapangan_id);
    const tanggal = req.query.tanggal;
    const courtNo = toNumber(req.query.court_no);


    if (!lapanganId) {
      return res.status(400).json({
        message: "lapangan_id wajib diisi",
      });
    }

    const where = {
      lapangan_id: lapanganId,
    };

    if (tanggal) {
      where.tanggal = tanggal;
    }

    // ✅ FILTER NOMOR LAPANGAN
    if (courtNo) {
      where.court_no = courtNo;
    }
    console.log("FILTER JADWAL:", where);
    let jadwal = await Jadwal.findAll({
  where,
  order: [
    ["court_no", "ASC"],
    ["jam_mulai", "ASC"],
  ],
});


const Pemesanan = require("../models/pemesanan");
const DetailPemesanan = require("../models/detailPemesanan");

const result = [];

for (const slot of jadwal) {
  const detail = await DetailPemesanan.findOne({
    where: {
      tanggal: slot.tanggal,
      nomor_lapangan: slot.court_no,
      jam_mulai: slot.jam_mulai,
      jam_selesai: slot.jam_selesai,
    },
  });

  let pemesan = "-";
  let kodePemesanan = "-";

  if (detail) {
    const pesanan =
      await Pemesanan.findByPk(
        detail.pemesanan_id
      );

    if (pesanan) {
      pemesan =
        pesanan.nama_pemesan || "-";

      kodePemesanan =
        pesanan.kode_pemesanan ||
        pesanan.id;
    }
  }

  result.push({
    ...slot.toJSON(),
    pemesan,
    kodePemesanan,
  });
}

return res.json(result);

   

    return res.json(jadwal);
  } catch (err) {
    return res.status(500).json({
      message: "Gagal ambil jadwal",
      error: err.message,
    });
  }
};

exports.createJadwal = async (req, res) => {
  try {
    const {
      lapangan_id,
      court_no,
      tanggal,
      jam_mulai,
      jam_selesai,
      harga,
      status,
    } = req.body;

    if (
      !lapangan_id ||
      !court_no ||
      !tanggal ||
      !jam_mulai ||
      !jam_selesai ||
      !harga
    ) {
      return res.status(400).json({
        message: "Data jadwal belum lengkap",
      });
    }

    const data = await Jadwal.create({
      lapangan_id,
      court_no,
      tanggal,
      jam_mulai,
      jam_selesai,
      harga,
      status: status || "tersedia",
    });

    return res.status(201).json({
      message: "Jadwal berhasil ditambahkan",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal tambah jadwal",
      error: err.message,
    });
  }
};