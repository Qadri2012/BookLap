const {
  Review,
  Lapangan,
  User,
  ReviewVote,
} = require("../models");
const Pemesanan = require("../models/pemesanan");

// =====================================
// CREATE REVIEW
// =====================================

exports.create = async (req, res) => {
  try {
    const {
      lapanganId,
      pemesananId,
      rating,
      komentar,
    } = req.body;

    const pemesanan =
      await Pemesanan.findByPk(
        pemesananId
      );

    if (!pemesanan) {
      return res.status(404).json({
        msg: "Pemesanan tidak ditemukan",
      });
    }

    if (
      pemesanan.status_pemesanan !==
      "selesai"
    ) {
      return res.status(400).json({
        msg:
          "Review hanya bisa diberikan setelah selesai bermain",
      });
    }

    const existing =
      await Review.findOne({
        where: {
          pemesananId,
        },
      });

    if (existing) {
      return res.status(400).json({
        msg:
          "Review sudah pernah diberikan",
      });
    }

    const user = await User.findByPk(
  req.user.id
      );

      if (!user) {
        return res.status(404).json({
          msg: "User tidak ditemukan",
        });
      }

      const review =
        await Review.create({
          userId: req.user.id,

          nama_user:
            user.nama,

          lapanganId,

          pemesananId,

          rating,

          komentar,

          total_membantu: 0,

          total_tidak_membantu: 0,
        });

    const reviews =
      await Review.findAll({
        where: {
          lapanganId,
        },
      });

    const avg =
      reviews.reduce(
        (sum, r) =>
          sum + r.rating,
        0
      ) / reviews.length;

    await Lapangan.update(
      {
        rating: Number(
          avg.toFixed(1)
        ),
      },
      {
        where: {
          id: lapanganId,
        },
      }
    );

    return res.status(201).json({
      msg: "Review berhasil",
      review,
    });

  } catch (err) {

    console.error(
      "CREATE REVIEW ERROR:",
      err
    );

    return res.status(500).json({
      msg: "Error",
      error: err.message,
    });
  }
};

// =====================================
// GET REVIEW BY LAPANGAN
// =====================================

exports.getByLapangan =
  async (req, res) => {
    try {

      const data =
      await Review.findAll({
        where: {
          lapanganId:
            req.params.id,
        },

        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: ReviewVote,
            as: "votes",
            required: false,
          },
        ],

        order: [
          ["createdAt", "DESC"],
        ],
      });

      const result = data.map(
        (review) => ({
          ...review.toJSON(),

          total_membantu:
            review.total_membantu || 0,

          total_tidak_membantu:
            review.total_tidak_membantu || 0,
        })
      );

      return res.json(result);

    } catch (err) {

      console.error(
        "GET REVIEW ERROR:",
        err
      );

      return res.status(500).json({
        msg: "Error",
        error: err.message,
      });
    }
  };