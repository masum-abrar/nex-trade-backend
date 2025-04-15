import express from "express";
import verify from "../../utils/verifyToken.js";
import {
  createRoleModule,
  deleteRoleModule,
  getRoleModule,
  getRoleModules,
} from "../../controllers/auth/role-module.js";

const router = express.Router();

router.post("/v1/auth/role-module", verify, createRoleModule);
router.get("/v1/auth/role-module", verify, getRoleModules);
router.get("/v1/auth/role-module/:id", verify, getRoleModule);
router.delete("/v1/auth/role-module/:id", verify, deleteRoleModule);

export default router;
