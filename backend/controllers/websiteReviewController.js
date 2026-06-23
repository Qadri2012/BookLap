const WebsiteReview = require("../models/websiteReview");


// ====================================================
// USER
// ====================================================

// POST REVIEW
exports.createReview = async (req, res) => {
  try {
    const { user_id, nama, rating, ulasan } = req.body;

    // cek apakah user sudah pernah review
    const existingReview = await WebsiteReview.findOne({
      where: {
        user_id,
      },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message:
          "Anda sudah pernah memberikan ulasan. Setiap akun hanya dapat memberikan 1 ulasan.",
      });
    }

    const review = await WebsiteReview.create({
      user_id,
      nama,
      rating,
      ulasan,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Ulasan berhasil dikirim",
      data: review,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengirim ulasan",
    });
  }
};

exports.checkUserReview = async (req, res) => {
  try {
    const { userId } = req.params;

    const review = await WebsiteReview.findOne({
      where: {
        user_id: userId,
      },
    });

    return res.json({
      hasReview: !!review,
    });
  } catch (error) {
    return res.status(500).json({
      hasReview: false,
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await WebsiteReview.findByPk(
      req.params.id
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review tidak ditemukan",
      });
    }

    await review.destroy();

    return res.json({
      success: true,
      message: "Review berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ====================================================
// ADMIN
// ====================================================

// REVIEW BARU
exports.getPendingReviews = async (req, res) => {
  try {
    const reviews = await WebsiteReview.findAll({
      where: {
        status: "pending",
      },
      order: [["created_at", "DESC"]],
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil review",
    });
  }
};


// REVIEW DITERIMA
exports.getApprovedReviews = async (req, res) => {
  try {
    const reviews = await WebsiteReview.findAll({
      where: {
        status: "approved",
      },
      order: [["created_at", "DESC"]],
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil review",
    });
  }
};


// REVIEW DITOLAK
exports.getRejectedReviews = async (req, res) => {
  try {
    const reviews = await WebsiteReview.findAll({
      where: {
        status: "rejected",
      },
      order: [["created_at", "DESC"]],
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil review",
    });
  }
};


// APPROVE
exports.approveReview = async (req, res) => {
  try {
    const review = await WebsiteReview.findByPk(
      req.params.id
    );

    if (!review) {
      return res.status(404).json({
        message: "Review tidak ditemukan",
      });
    }

    review.status = "approved";

    await review.save();

    res.json({
      message: "Review diterima",
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal approve review",
    });
  }
};


// REJECT
exports.rejectReview = async (req, res) => {
  try {
    const review = await WebsiteReview.findByPk(
      req.params.id
    );

    if (!review) {
      return res.status(404).json({
        message: "Review tidak ditemukan",
      });
    }

    review.status = "rejected";

    await review.save();

    res.json({
      message: "Review ditolak",
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal reject review",
    });
  }
};


// HOME TESTIMONI
exports.getHomepageReviews = async (req, res) => {
  try {
    const reviews = await WebsiteReview.findAll({
      where: {
        status: "approved",
      },
      order: [["created_at", "DESC"]],
      limit: 20,
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil testimoni",
    });
  }
};