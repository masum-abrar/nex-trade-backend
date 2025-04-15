import express from "express";
import {
  createOrder,
  createOrderFail,
  createOrderSsl,
  createOrderSuccess,
  deleteOrder,
  getOrder,
  getOrders,
  getOrdersByUser,
  updateOrder,
} from "../../controllers/order/order.js";
// import {
//   orderEdit,
//   orderList,
//   orderRemove,
//   orderSingle,
//   orderUserList,
// } from "../../utils/modules.js";
import verify from "../../utils/verifyToken.js";

const router = express.Router();

router.post("/v1/orders", verify, createOrder);
router.post("/v1/orders-init", createOrderSsl);
router.post("/v1/orders-success", createOrderSuccess);
router.post("/v1/orders-fail", createOrderFail);
// router.get("/v1/orders", orderList, verify, getOrders);
router.get("/v1/orders", verify, getOrders);
// router.get("/v1/orders/user/:id", orderUserList, verify, getOrdersByUser);
router.get("/v1/orders/user/:id", verify, getOrdersByUser);
// router.get("/v1/orders/:id", orderSingle, verify, getOrder);
router.get("/v1/orders/:id", verify, getOrder);
// router.put("/v1/orders/:id", orderEdit, verify, updateOrder);
router.put("/v1/orders/:id", verify, updateOrder);
// router.delete("/v1/orders/:id", orderRemove, verify, deleteOrder);
router.delete("/v1/orders/:id", verify, deleteOrder);

export default router;
