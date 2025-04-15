import express from "express";
import {
  getCanceledOrder,
  getDeliveredOrder,
  getInProgressOrder,
  getPendingOrder,
  getTotalCampaign,
  getTotalCategory,
  getTotalOrder,
  getTotalProduct,
  getTotalRevenue,
  getTotalRevenueYearWise,
} from "../../controllers/dashboard/dashboard.js";
import {} from "../../utils/modules.js";
import verify from "../../utils/verifyToken.js";

const router = express.Router();

router.get(
  "/v1/dashboard/user/total-category",
  // categoryTotal,
  verify,
  getTotalCategory
);
router.get(
  "/v1/dashboard/user/total-campaign",
  // campaignTotal,
  verify,
  getTotalCampaign
);
router.get(
  "/v1/dashboard/user/total-product",
  // productTotal,
  verify,
  getTotalProduct
);
router.get(
  "/v1/dashboard/user/total-order",
  // orderTotal,
  verify,
  getTotalOrder
);
router.get(
  "/v1/dashboard/user/total-pending-order",
  // orderStatusTotal,
  verify,
  getPendingOrder
);
router.get(
  "/v1/dashboard/user/total-canceled-order",
  // orderStatusTotal,
  verify,
  getCanceledOrder
);
router.get(
  "/v1/dashboard/user/total-in-progress-order",
  // orderStatusTotal,
  verify,
  getInProgressOrder
);
router.get(
  "/v1/dashboard/user/total-delivered-order",
  // orderStatusTotal,
  verify,
  getDeliveredOrder
);
router.get(
  "/v1/dashboard/user/total-revenue",
  // revenueTotal,
  verify,
  getTotalRevenue
);
router.get(
  "/v1/dashboard/user/total-revenue-year-wise/:year",
  verify,
  getTotalRevenueYearWise
);

export default router;
