// controllers/lapanganController.js
const { Lapangan, Review } = require("../models");
const Jadwal = require("../models/jadwal");
const { Op } = require("sequelize");

// ✅ NEW: ambil semua lapangan
exports.getAll = async (req, res) => {
  try {
    const { tipe, lokasi } = req.query;
    const where = {};

    if (tipe) where.tipe = tipe;
    if (lokasi) where.alamat = { [Op.iLike]: `%${lokasi}%` };

    const lapangan = await Lapangan.findAll({
      where,
      order: [["id", "DESC"]],
    });

    const result = await Promise.all(
      lapangan.map(async (lap) => {
        const reviews = await Review.findAll({
          where: { lapanganId: lap.id },
        });

        const total = reviews.length;

        const avg =
          total === 0
            ? lap.rating
            : reviews.reduce((sum, r) => sum + r.rating, 0) / total;

        return {
          ...lap.toJSON(),
          rating: Number(avg.toFixed(1)),
          reviews: total,
        };
      })
    );

    return res.json(result);
  } catch (err) {
    return res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};

// ✅ NEW: ambil lapangan by id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Lapangan.findByPk(id);

    if (!data) {
      return res.status(404).json({
        message: "Lapangan tidak ditemukan",
      });
    }

    const courtRows = await Jadwal.findAll({
      where: {
        lapangan_id: id,
      },
      attributes: ["court_no"],
      group: ["court_no"],
      order: [["court_no", "ASC"]],
    });

    const courts = courtRows.length
      ? courtRows.map(
          (row) => `Lapangan ${row.court_no}`
        )
      : ["Lapangan 1"];

    // ==========================
    // HITUNG REVIEW
    // ==========================

    const reviews = await Review.findAll({
      where: {
        lapanganId: id,
      },
    });

    const total_review =
      reviews.length;

    const rating_rata_rata =
      total_review === 0
        ? 0
        : Number(
            (
              reviews.reduce(
                (sum, item) =>
                  sum +
                  Number(item.rating || 0),
                0
              ) / total_review
            ).toFixed(1)
          );

    return res.json({
      ...data.toJSON(),

      courts,

      rating_rata_rata,

      total_review,
    });
  } catch (err) {
    return res.status(500).json({
      message:
        "Gagal mengambil detail lapangan",
      error: err.message,
    });
  }
};

// ✅ NEW: create lapangan
exports.create = async (req, res) => {
  try {
    const data = await Lapangan.create(req.body);

    return res.status(201).json({
      message: "Lapangan berhasil ditambahkan",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal menambah lapangan",
      error: err.message,
    });
  }
};

// ✅ NEW: update lapangan
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Lapangan.findByPk(id);
    if (!data) {
      return res.status(404).json({
        message: "Lapangan tidak ditemukan",
      });
    }

    await data.update(req.body);

    return res.json({
      message: "Lapangan berhasil diperbarui",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal memperbarui lapangan",
      error: err.message,
    });
  }
};

// ✅ NEW: hapus lapangan
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Lapangan.findByPk(id);
    if (!data) {
      return res.status(404).json({
        message: "Lapangan tidak ditemukan",
      });
    }

    await data.destroy();

    return res.json({
      message: "Lapangan berhasil dihapus",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal menghapus lapangan",
      error: err.message,
    });
  }
};