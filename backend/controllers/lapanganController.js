// controllers/lapanganController.js
const { Lapangan, Review } = require("../models");
const Jadwal = require("../models/jadwal");
const { Op } = require("sequelize");

exports.searchLapangan = async (req, res) => {
  try {
    const {
      lokasi,
      tipe,
      tanggal,
      jam,
    } = req.query;

    const kataLokasi = lokasi
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const lapangan =
      await Lapangan.findAll({
        where: {
          tipe: String(tipe)
            .toLowerCase()
            .replace(/\s/g, ""),

          [Op.and]: kataLokasi.map((kata) => ({
            alamat: {
              [Op.iLike]: `%${kata}%`,
            },
          })),
        },
      });

    const result = await Promise.all(
      lapangan.map(async (lap) => {

        const jadwal =
          await Jadwal.findAll({
            where: {
              lapangan_id: lap.id,
              tanggal,
              jam_mulai: jam,
              status: "tersedia",
            },
          });

        return {
          ...lap.toJSON(),

          tersedia:
            jadwal.length > 0,

          courts_tersedia:
            jadwal.map(
              (j) =>
                `Lapangan ${j.court_no}`
            ),
        };
      })
    );

    return res.json(result);

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      message: "Gagal mencari lapangan",
    });

  }
};
exports.searchAvailableLapangan = async (req, res) => {
  try {
    const {
      tanggal,
      jam,
      lokasi,
      tipe,
    } = req.query;

    if (
      !tanggal ||
      !jam ||
      !lokasi ||
      !tipe
    ) {
      return res.status(400).json({
        message:
          "tanggal, jam, lokasi dan tipe wajib diisi",
      });
    }

const jadwalTersedia =
  await Jadwal.findAll({
    where: {
      tanggal,
      jam_mulai: jam,
      status: "tersedia",
    },
  });

    console.log(
      "jadwal ditemukan:",
      jadwalTersedia.length
    );

    if (jadwalTersedia.length === 0) {
      return res.json([]);
    }

    const lapanganIds = [
      ...new Set(
        jadwalTersedia.map(
          (j) => j.lapangan_id
        )
      ),
    ];

    const kataLokasi = lokasi
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

const lokasiUtama = kataLokasi[0];

const lapangan = await Lapangan.findAll({
  where: {
    id: {
      [Op.in]: lapanganIds,
    },

    tipe: String(tipe)
      .toLowerCase()
      .replace(/\s/g, ""),

    alamat: {
      [Op.iLike]: `%${lokasiUtama}%`,
    },
  },
});

      console.log("lapangan ids =", lapanganIds);

      console.log(
        "lapangan hasil filter =",
        lapangan.map((x) => ({
          id: x.id,
          nama: x.nama,
          alamat: x.alamat,
          tipe: x.tipe,
        }))
      );

    const result = lapangan.map((lap) => ({
      ...lap.toJSON(),
      tanggal_pencarian: tanggal,
      jam_pencarian: jam,
    }));

return res.json(result);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Gagal mencari lapangan",
      error: error.message,
    });
  }
};

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