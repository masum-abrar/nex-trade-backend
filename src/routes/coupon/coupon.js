import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getCoupon,
  getCouponForCustomer,
  getCoupons,
  getCouponsForCustomer,
  sendCouponEmail,
  updateCoupon,
} from "../../controllers/coupon/coupon.js";
import verify from "../../utils/verifyToken.js";

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

const router = express.Router();

router.post("/v1/coupons", verify, createCoupon);
router.get("/v1/coupons", verify, getCoupons);
router.get("/v1/coupons/:id", verify, getCoupon);
router.put("/v1/coupons/:id", verify, updateCoupon);
router.delete("/v1/coupons/:id", verify, deleteCoupon);
router.get("/v1/coupons-email/:id", verify, sendCouponEmail);

//For customer
router.get("/v1/customer/coupons", getCouponsForCustomer);
router.get("/v1/customer/coupons/:id", getCouponForCustomer);

export default router;
