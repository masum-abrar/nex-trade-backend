import express from "express";
import {
  createNewsletter,
  deleteNewsletter,
  getNewsletter,
  getNewsletters,
  updateNewsletter,
} from "../../controllers/newsletter/newsletter.js";
import verify from "../../utils/verifyToken.js";

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

const router = express.Router();

router.post("/v1/newsletters", createNewsletter);
router.get("/v1/newsletters", verify, getNewsletters);
router.get("/v1/newsletters/:id", verify, getNewsletter);
router.put("/v1/newsletters/:id", verify, updateNewsletter);
router.delete("/v1/newsletters/:id", verify, deleteNewsletter);

//For customer
// router.get("/v1/customer/coupons", getCouponsForCustomer);
// router.get("/v1/customer/coupons/:id", getCouponForCustomer);

export default router;
