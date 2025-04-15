import express from "express";
import {
  createMonthlyPayment,
  getMonthlyPayments,
  getMonthlyPaymentsByUser,
  getMonthlyPayment,
  updateMonthlyPayment,
  deleteMonthlyPayment,
} from "../../controllers/payment/monthly-payment.js";
import {
  monthlyPaymentCreate,
  monthlyPaymentEdit,
  monthlyPaymentList,
  monthlyPaymentRemove,
  monthlyPaymentSingle,
  monthlyPaymentUserList,
} from "../../utils/modules.js";
import verify from "../../utils/verifyToken.js";

const router = express.Router();

router.post(
  "/v1/payments/monthly",
  monthlyPaymentCreate,
  verify,
  createMonthlyPayment
);
router.get(
  "/v1/payments/monthly",
  monthlyPaymentList,
  verify,
  getMonthlyPayments
);
router.get(
  "/v1/payments/monthly/user/:id",
  monthlyPaymentUserList,
  verify,
  getMonthlyPaymentsByUser
);
router.get(
  "/v1/payments/:id/monthly",
  monthlyPaymentSingle,
  verify,
  getMonthlyPayment
);
router.put(
  "/v1/payments/:id/monthly",
  monthlyPaymentEdit,
  verify,
  updateMonthlyPayment
);
router.delete(
  "/v1/payments/:id/monthly",
  monthlyPaymentRemove,
  verify,
  deleteMonthlyPayment
);

export default router;
