import express from "express";
import multer from "multer";
import {
  createBrand,
  deleteBrand,
  getBrand,
  getBrandForCustomer,
  getBrands,
  getBrandsForCustomer,
  updateBrand,
} from "../../controllers/brand/brand.js";
import verify from "../../utils/verifyToken.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/v1/brands", verify, upload.single("image"), createBrand);
router.get("/v1/brands", verify, getBrands);
router.get("/v1/brands/:id", verify, getBrand);
router.put("/v1/brands/:id", verify, upload.single("image"), updateBrand);
router.delete("/v1/brands/:id", verify, deleteBrand);

//For customer
router.get("/v1/customer/brands", getBrandsForCustomer);
router.get("/v1/customer/brands/:id", getBrandForCustomer);

export default router;
