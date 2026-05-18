const { Review, Lapangan } = require("../models");

// CREATE REVIEW
exports.create = async (req, res) => {
  try {
    const { lapanganId, rating, komentar } = req.body;

    const review = await Review.create({
      userId: req.user.id,
      lapanganId,
      rating,
      komentar,
    });

    // 🔥 HITUNG ULANG RATING
    const reviews = await Review.findAll({
      where: { lapanganId },
    });

    const total = reviews.length;

    const avg =
      total === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / total;

    await Lapangan.update(
      { rating: avg.toFixed(1) },
      { where: { id: lapanganId } }
    );

    res.status(201).json({ msg: "Review berhasil", review });

  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
};

// GET REVIEW BY LAPANGAN
exports.getByLapangan = async (req, res) => {
  try {
    const data = await Review.findAll({
      where: { lapanganId: req.params.id },
      include: ["user"],
      order: [["createdAt", "DESC"]],
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Error", error: err.message });
  }
};