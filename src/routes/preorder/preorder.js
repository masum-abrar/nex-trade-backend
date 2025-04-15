import express from "express";
import {
  createPreorder,
  deletePreorder,
  getPreorder,
  getPreorderForCustomer,
  getPreorders,
  getPreordersForCustomer,
  updatePreorder,
} from "../../controllers/preorder/preorder.js";
import verify from "../../utils/verifyToken.js";

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

const router = express.Router();

router.post("/v1/preorders", verify, createPreorder);
router.get("/v1/preorders", verify, getPreorders);
router.get("/v1/preorders/:id", verify, getPreorder);
router.put("/v1/preorders/:id", verify, updatePreorder);
router.delete("/v1/preorders/:id", verify, deletePreorder);

//For customer
router.get("/v1/customer/preorders", getPreordersForCustomer);
router.get("/v1/customer/preorders/:id", getPreorderForCustomer);

export default router;
