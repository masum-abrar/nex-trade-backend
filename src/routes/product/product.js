import express from "express";
import multer from "multer";
import {
  banProduct,
  createProduct,
  createProductAttribute,
  createProductImage,
  deleteProduct,
  deleteProductAttribute,
  deleteProductImage,
  getFeaturedProductsForCustomer,
  getProduct,
  getProductAttributes,
  getProductForCustomer,
  getProductImages,
  getProducts,
  getProductsByUser,
  getProductsForCustomer,
  getTrendingProductsForCustomer,
  increaseProductViewCount,
  sendProductEmail,
  updateProduct,
  updateProductAttribute,
  updateProductImage,
} from "../../controllers/product/product.js";
import {
  productBan,
  productCreate,
  productEdit,
  productList,
  productRemove,
  productSingle,
  productUserList,
} from "../../utils/modules.js";
import verify from "../../utils/verifyToken.js";

// const upload = multer({ dest: "public/images/product" });
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post(
  "/v1/products",
  productCreate,
  verify,
  upload.array("images"),
  createProduct
);
router.get("/v1/products-email/:id", verify, sendProductEmail);
router.get("/v1/products", productList, verify, getProducts);
router.get("/v1/user/products/", productUserList, verify, getProductsByUser);
router.get("/v1/products/:slug", productSingle, verify, getProduct);
router.put(
  "/v1/products/:id",
  productEdit,
  verify,
  upload.array("images"),
  updateProduct
);
router.put("/v1/products/attributes/:id", verify, updateProductAttribute);
router.put(
  "/v1/products/images/:id",
  productEdit,
  verify,
  upload.single("image"),
  updateProductImage
);
router.put("/v1/products/:id/viewCount", increaseProductViewCount);
router.put("/v1/products/:id/ban", productBan, verify, banProduct);
router.delete(
  "/v1/products/images/:id",
  productRemove,
  verify,
  deleteProductImage
);
router.delete("/v1/products/:id", productRemove, verify, deleteProduct);

//attributes
router.post("/v1/products-attributes", verify, createProductAttribute);
router.get("/v1/products-attributes/:id", verify, getProductAttributes);
router.put("/v1/products-attributes/:id", verify, updateProductAttribute);
router.delete("/v1/products-attributes/:id", verify, deleteProductAttribute);

//images
router.get("/v1/products-images/:id", verify, getProductImages);
router.post(
  "/v1/products-images",
  verify,
  upload.single("image"),
  createProductImage
);
router.delete("/v1/products-images/:id", verify, deleteProductImage);

// For Customer
router.get("/v1/customer/products", getProductsForCustomer);
router.get("/v1/customer/products/:slug", getProductForCustomer);
router.get("/v1/customer/trending-products", getTrendingProductsForCustomer);
router.get("/v1/customer/featured-products", getFeaturedProductsForCustomer);

export default router;
