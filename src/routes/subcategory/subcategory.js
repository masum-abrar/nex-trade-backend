import express from "express";
import multer from "multer";
import {
  createSubcategory,
  deleteSubcategory,
  getSubcategories,
  getSubcategoriesByCategory,
  getSubcategoriesForCustomer,
  getSubcategory,
  getSubcategoryForCustomer,
  updateSubcategory,
} from "../../controllers/subcategory/subcategory.js";
import verify from "../../utils/verifyToken.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post(
  "/v1/subcategories",
  verify,
  upload.single("image"),
  createSubcategory
);
router.get("/v1/subcategories", verify, getSubcategories);
router.get(
  "/v1/subcategoriesByCategory/:id",
  verify,
  getSubcategoriesByCategory
);
router.get("/v1/subcategories/:id", verify, getSubcategory);
router.put(
  "/v1/subcategories/:id",
  verify,
  upload.single("image"),
  updateSubcategory
);
router.delete("/v1/subcategories/:id", verify, deleteSubcategory);

//For customer
router.get("/v1/customer/subcategories", getSubcategoriesForCustomer);
router.get("/v1/customer/subcategories/:id", getSubcategoryForCustomer);

export default router;
