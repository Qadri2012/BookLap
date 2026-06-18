const {
  Review,
  ReviewVote,
} = require("../models");

exports.voteReview = async (
  req,
  res
) => {
  try {
    const reviewId = req.params.id;

    const userId = req.user.id;

    const { tipe } = req.body;

    if (
      !["helpful", "unhelpful"].includes(
        tipe
      )
    ) {
      return res.status(400).json({
        message: "Vote tidak valid",
      });
    }

    const review =
      await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        message:
          "Review tidak ditemukan",
      });
    }

    const existing =
      await ReviewVote.findOne({
        where: {
          reviewid: reviewId,
          userid: userId,
        }
      });

    // ====================
    // UPDATE VOTE
    // ====================

    if (existing) {
      if (existing.tipe === tipe) {
        return res.json({
          message:
            "Vote sudah diberikan",
        });
      }

      // kurangi vote lama

      if (
        existing.tipe === "helpful"
      ) {
        review.total_membantu--;
      }

      if (
        existing.tipe ===
        "unhelpful"
      ) {
        review.total_tidak_membantu--;
      }

      // tambah vote baru

      if (tipe === "helpful") {
        review.total_membantu++;
      }

      if (tipe === "unhelpful") {
        review.total_tidak_membantu++;
      }

      existing.tipe = tipe;

      await existing.save();
      await review.save();

      return res.json({
        message:
          "Vote berhasil diperbarui",
      });
    }

    // ====================
    // VOTE BARU
    // ====================

    await ReviewVote.create({
      reviewid: reviewId,
      userid: userId,
      tipe,
    });

    if (tipe === "helpful") {
      review.total_membantu++;
    }

    if (tipe === "unhelpful") {
      review.total_tidak_membantu++;
    }

    await review.save();

    return res.json({
      message:
        "Vote berhasil ditambahkan",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};