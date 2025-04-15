import express from "express";
import {
  createContact,
  deleteContact,
  getContact,
  getContacts,
  updateContact,
} from "../../controllers/contact/contact.js";
import verify from "../../utils/verifyToken.js";

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

const router = express.Router();

router.post("/v1/contacts", createContact);
router.get("/v1/contacts", verify, getContacts);
router.get("/v1/contacts/:id", verify, getContact);
router.put("/v1/contacts/:id", verify, updateContact);
router.delete("/v1/contacts/:id", verify, deleteContact);

//For customer
// router.get("/v1/customer/coupons", getCouponsForCustomer);
// router.get("/v1/customer/coupons/:id", getCouponForCustomer);

export default router;
