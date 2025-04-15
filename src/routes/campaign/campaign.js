import express from "express";
import {
  createCampaign,
  getCampaigns,
  getCampaignsByUser,
  getCampaign,
  updateCampaign,
  increaseCampaignViewCount,
  deleteCampaign,
  banCampaign,
  getCampaignsForCustomer,
  getCampaignForCustomer,
} from "../../controllers/campaign/campaign.js";
import verify from "../../utils/verifyToken.js";
import multer from "multer";
import {
  campaignBan,
  campaignCreate,
  campaignEdit,
  campaignList,
  campaignRemove,
  campaignSingle,
  campaignUserList,
} from "../../utils/modules.js";

// const upload = multer({ dest: "public/images/campaign" });
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post(
  "/v1/campaigns",
  campaignCreate,
  verify,
  upload.single("image"),
  createCampaign
);
router.get("/v1/campaigns", campaignList, verify, getCampaigns);
router.get("/v1/user/campaigns", campaignUserList, verify, getCampaignsByUser);
router.get("/v1/campaigns/:slug", campaignSingle, verify, getCampaign);
router.put(
  "/v1/campaigns/:id",
  campaignEdit,
  verify,
  upload.single("image"),
  updateCampaign
);
router.put("/v1/campaigns/:id/viewCount", increaseCampaignViewCount);
router.put("/v1/campaigns/:id/ban", campaignBan, verify, banCampaign);
router.delete("/v1/campaigns/:id", campaignRemove, verify, deleteCampaign);

// For Customer
router.get("/v1/customer/campaigns", getCampaignsForCustomer);
router.get("/v1/customer/campaigns/:slug", getCampaignForCustomer);

export default router;
