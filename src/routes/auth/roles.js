import express from "express";
import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  updateRole,
} from "../../controllers/auth/role.js";
import {
  roleCreate,
  roleEdit,
  roleList,
  roleRemove,
  roleSingle,
} from "../../utils/modules.js";
import verify from "../../utils/verifyToken.js";

const router = express.Router();

router.post("/v1/auth/roles", roleCreate, verify, createRole);
router.get("/v1/auth/roles", roleList, verify, getRoles);
router.get("/v1/auth/roles/:id", roleSingle, verify, getRole);
router.put("/v1/auth/roles/:id", roleEdit, verify, updateRole);
router.delete("/v1/auth/roles/:id", roleRemove, verify, deleteRole);

export default router;
