import express from "express";
import {
  createReview,
  deleteReview,
  getReview,
  getReviewForCustomer,
  getReviews,
  getReviewsForCustomer,
  updateReview,
} from "../../controllers/review/review.js";
import verify from "../../utils/verifyToken.js";

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

const router = express.Router();

router.post("/v1/reviews", verify, createReview);
router.get("/v1/reviews", verify, getReviews);
router.get("/v1/reviews/:id", verify, getReview);
router.put("/v1/reviews/:id", verify, updateReview);
router.delete("/v1/reviews/:id", verify, deleteReview);

//For customer
router.get("/v1/customer/reviewsByProduct/:id", getReviewsForCustomer);
router.get("/v1/customer/reviews/:id", getReviewForCustomer);

export default router;
