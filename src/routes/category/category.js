import express from "express";
import {
  createCategory,
  getCategories,
  getCategoriesByUser,
  getCategory,
  updateCategory,
  deleteCategory,
  banCategory,
  getCategoriesForCustomer,
  getCategoryForCustomer,
} from "../../controllers/category/category.js";
import verify from "../../utils/verifyToken.js";
import multer from "multer";
import {
  categoryBan,
  categoryCreate,
  categoryEdit,
  categoryList,
  categoryRemove,
  categorySingle,
  categoryUserList,
} from "../../utils/modules.js";

// const upload = multer({ dest: "public/images/category" });
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post(
  "/v1/categories",
  categoryCreate,
  verify,
  upload.single("image"),
  createCategory
);
router.get("/v1/categories", categoryList, verify, getCategories);
router.get(
  "/v1/user/categories",
  categoryUserList,
  verify,
  getCategoriesByUser
);
router.get("/v1/categories/:slug", categorySingle, verify, getCategory);
router.put(
  "/v1/categories/:id",
  categoryEdit,
  verify,
  upload.single("image"),
  updateCategory
);
router.put("/v1/categories/:id/ban", categoryBan, verify, banCategory);
router.delete("/v1/categories/:id", categoryRemove, verify, deleteCategory);

//For customer
router.get("/v1/customer/categories", getCategoriesForCustomer);
router.get("/v1/customer/categories/:slug", getCategoryForCustomer);

export default router;
