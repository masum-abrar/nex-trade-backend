import express from "express";
import {
  createSupplier,
  getSuppliers,
  getSuppliersByUser,
  getSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../controllers/supplier/supplier.js";
import {
  supplierCreate,
  supplierEdit,
  supplierList,
  supplierRemove,
  supplierSingle,
  supplierUserList,
} from "../../utils/modules.js";
import verify from "../../utils/verifyToken.js";

const router = express.Router();

router.post("/v1/suppliers", supplierCreate, verify, createSupplier);
router.get("/v1/suppliers", supplierList, verify, getSuppliers);
router.get("/v1/user/suppliers", supplierUserList, verify, getSuppliersByUser);
router.get("/v1/suppliers/:id", supplierSingle, verify, getSupplier);
router.put("/v1/suppliers/:id", supplierEdit, verify, updateSupplier);
router.delete("/v1/suppliers/:id", supplierRemove, verify, deleteSupplier);

export default router;
