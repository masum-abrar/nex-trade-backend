import express from "express";
import {
  createModule,
  deleteModule,
  getModule,
  getModules,
  updateModule,
} from "../../controllers/auth/module.js";
import {
  moduleCreate,
  moduleEdit,
  moduleList,
  moduleRemove,
  moduleSingle,
} from "../../utils/modules.js";
import verify from "../../utils/verifyToken.js";

const router = express.Router();

router.post("/v1/auth/modules", moduleCreate, verify, createModule);
router.get("/v1/auth/modules", moduleList, verify, getModules);
router.get("/v1/auth/modules/:id", moduleSingle, verify, getModule);
router.put("/v1/auth/modules/:id", moduleEdit, verify, updateModule);
router.delete("/v1/auth/modules/:id", moduleRemove, verify, deleteModule);

export default router;
