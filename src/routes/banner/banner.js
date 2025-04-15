import express from "express";
import multer from "multer";
import {
  createBanner,
  deleteBanner,
  getBanner,
  getBannerForCustomer,
  getBanners,
  getBannersForCustomer,
  updateBanner,
} from "../../controllers/banner/banner.js";
import verify from "../../utils/verifyToken.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/v1/banners", verify, upload.single("image"), createBanner);
router.get("/v1/banners", verify, getBanners);
router.get("/v1/banners/:id", verify, getBanner);
router.put("/v1/banners/:id", verify, upload.single("image"), updateBanner);
router.delete("/v1/banners/:id", verify, deleteBanner);

//For customer
router.get("/v1/customer/banners", getBannersForCustomer);
router.get("/v1/customer/banners/:id", getBannerForCustomer);

export default router;
