const express = require("express");

const router = express.Router();

const {
  createReview,
  checkUserReview,
  getPendingReviews,
  getApprovedReviews,
  getRejectedReviews,
  approveReview,
  rejectReview,
  getHomepageReviews,
  deleteReview,
} = require("../../controllers/websiteReviewController");


// USER
router.post("/", createReview);


// ADMIN
router.get("/pending", getPendingReviews);

router.get("/approved", getApprovedReviews);

router.get("/rejected", getRejectedReviews);

router.put("/:id/approve", approveReview);

router.put("/:id/reject", rejectReview);
router.get(
  "/check/:userId",
  checkUserReview
);
router.delete("/:id", deleteReview);

// HOME
router.get("/homepage", getHomepageReviews);

module.exports = router;