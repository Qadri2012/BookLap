// controllers/lapanganController.js

const { Lapangan, Review } = require("../models");
const { Op } = require("sequelize");

exports.getAll = async (req, res) => {
  try {
    const { tipe, lokasi } = req.query;
    const where = {};

    if (tipe) where.tipe = tipe;
    if (lokasi) where.alamat = { [Op.iLike]: `%${lokasi}%` };

    const lapangan = await Lapangan.findAll({
      where,
      order: [["createdAt", "DESC"]],
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

    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};