import express from "express";
import multer from "multer";
import {
  createSubsubcategory,
  deleteSubsubcategory,
  getSubsubcategories,
  getSubsubcategoriesBySubcategory,
  getSubsubcategoriesForCustomer,
  getSubsubcategory,
  getSubsubcategoryForCustomer,
  updateSubsubcategory,
} from "../../controllers/subsubcategory/subsubcategory.js";
import verify from "../../utils/verifyToken.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post(
  "/v1/subsubcategories",
  verify,
  upload.single("image"),
  createSubsubcategory
);
router.get("/v1/subsubcategories", verify, getSubsubcategories);
router.get(
  "/v1/subsubcategoriesBySubcategory/:id",
  verify,
  getSubsubcategoriesBySubcategory
);
router.get("/v1/subsubcategories/:id", verify, getSubsubcategory);
router.put(
  "/v1/subsubcategories/:id",
  verify,
  upload.single("image"),
  updateSubsubcategory
);
router.delete("/v1/subsubcategories/:id", verify, deleteSubsubcategory);

//For customer
router.get("/v1/customer/subsubcategories", getSubsubcategoriesForCustomer);
router.get("/v1/customer/subsubcategories/:id", getSubsubcategoryForCustomer);

export default router;
