// jadwalController.js

const Lapangan = require("../models/lapangan");
const Jadwal = require("../models/jadwal");

function normalizeDate(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10);
}

function toNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

async function cloneTemplateToDate({ lapanganId, tanggal, courtNo = null }) {
  // ambil template dari tanggal paling awal
  const templateWhere = {
    lapangan_id: lapanganId,
  };

  if (courtNo !== null) {
    templateWhere.court_no = courtNo;
  }

  // ambil semua template dari tanggal pertama
  const templateRows = await Jadwal.findAll({
    where: templateWhere,
    order: [
      ["tanggal", "ASC"],
      ["court_no", "ASC"],
      ["jam_mulai", "ASC"],
    ],
  });

  if (!templateRows.length) {
    return [];
  }

  // clone ke tanggal baru
  const payload = templateRows.map((row) => ({
    lapangan_id: row.lapangan_id,
    court_no: row.court_no,
    tanggal: tanggal, // tanggal baru
    jam_mulai: row.jam_mulai,
    jam_selesai: row.jam_selesai,
    harga: row.harga,
    status: "tersedia",
  }));

  // insert jadwal baru
  await Jadwal.bulkCreate(payload);

  // ambil ulang hasil clone
  return Jadwal.findAll({
    where: {
      lapangan_id: lapanganId,
      tanggal,
      ...(courtNo !== null ? { court_no: courtNo } : {}),
    },
    order: [
      ["court_no", "ASC"],
      ["jam_mulai", "ASC"],
    ],
  });
}

exports.getJadwal = async (req, res) => {
  try {
    const lapanganId = toNumber(req.query.lapangan_id);
    const courtNo = toNumber(req.query.court_no);
    const tanggal = normalizeDate(req.query.tanggal);

    if (!lapanganId) {
      return res.status(400).json({
        message: "lapangan_id wajib diisi",
      });
    }

    const where = { lapangan_id: lapanganId };

    if (tanggal) {
      where.tanggal = tanggal;
    }

    if (courtNo !== null) {
      where.court_no = courtNo;
    }

    let jadwal = await Jadwal.findAll({
      where,
      order: [
        ["court_no", "ASC"],
        ["jam_mulai", "ASC"],
      ],
    });

    if (jadwal.length === 0 && tanggal) {
      jadwal = await cloneTemplateToDate({
        lapanganId,
        tanggal,
        courtNo,
      });
    }

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