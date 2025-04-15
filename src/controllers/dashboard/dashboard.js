import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";

const module_name = "dashboard";

//get all total category by user
export const getTotalCategory = async (req, res) => {
  try {
    const totalCategory = await prisma.category.count({
      where: {
        // userId: req.user.parentId ? req.user.parentId : req.user.id,
        isDeleted: false,
        isActive: true,
      },
    });

    return res
      .status(200)
      .json(
        jsonResponse(true, `${totalCategory} categories found`, totalCategory)
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all total campaign by user
export const getTotalCampaign = async (req, res) => {
  try {
    const totalCampaign = await prisma.campaign.count({
      where: {
        // userId: req.user.parentId ? req.user.parentId : req.user.id,
        isDeleted: false,
        isActive: true,
      },
    });

    return res
      .status(200)
      .json(
        jsonResponse(true, `${totalCampaign} campaigns found`, totalCampaign)
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all total product by user
export const getTotalProduct = async (req, res) => {
  try {
    const totalProduct = await prisma.product.count({
      where: {
        // userId: req.user.parentId ? req.user.parentId : req.user.id,
        isDeleted: false,
        isActive: true,
      },
    });

    return res
      .status(200)
      .json(jsonResponse(true, `${totalProduct} products found`, totalProduct));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all total order by user
export const getTotalOrder = async (req, res) => {
  try {
    const totalOrder = await prisma.order.count({
      where: {
        // userId: req.user.parentId ? req.user.parentId : req.user.id,
      },
    });

    return res
      .status(200)
      .json(jsonResponse(true, `${totalOrder} orders found`, totalOrder));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all total pending order by user
export const getPendingOrder = async (req, res) => {
  try {
    const pendingOrder = await prisma.order.count({
      where: {
        // userId: req.user.parentId ? req.user.parentId : req.user.id,
        status: "PENDING",
      },
    });

    return res
      .status(200)
      .json(
        jsonResponse(true, `${pendingOrder} pending orders found`, pendingOrder)
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all total canceled order by user
export const getCanceledOrder = async (req, res) => {
  try {
    const canceledOrder = await prisma.order.count({
      where: {
        // userId: req.user.parentId ? req.user.parentId : req.user.id,
        status: "CANCELED",
      },
    });

    return res
      .status(200)
      .json(
        jsonResponse(
          true,
          `${canceledOrder} canceled orders found`,
          canceledOrder
        )
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all total delivered order by user
export const getDeliveredOrder = async (req, res) => {
  try {
    const deliveredOrder = await prisma.order.count({
      where: {
        // userId: req.user.parentId ? req.user.parentId : req.user.id,
        status: "DELIVERED",
      },
    });

    return res
      .status(200)
      .json(
        jsonResponse(
          true,
          `${deliveredOrder} delivered orders found`,
          deliveredOrder
        )
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all total inprogress order by user
export const getInProgressOrder = async (req, res) => {
  try {
    const inProgressOrder = await prisma.order.count({
      where: {
        // userId: req.user.parentId ? req.user.parentId : req.user.id,
        status: "SHIPPED",
      },
    });

    return res
      .status(200)
      .json(
        jsonResponse(
          true,
          `${inProgressOrder} in progress orders found`,
          inProgressOrder
        )
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all total revenue by user
export const getTotalRevenue = async (req, res) => {
  try {
    const subtotal = await prisma.order.aggregate({
      // where: { userId: req.user.parentId ? req.user.parentId : req.user.id },
      _sum: {
        subtotal: true,
        subtotalCost: true,
      },
    });

    const totalRevenue = subtotal._sum.subtotal - subtotal._sum.subtotalCost;

    return res
      .status(200)
      .json(
        jsonResponse(true, `Total revenue is ${totalRevenue}`, totalRevenue)
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all total revenue year wise by user
export const getTotalRevenueYearWise = async (req, res) => {
  try {
    const currentYear = req.params.year
      ? Number(req.params.year)
      : new Date().getFullYear();

    const monthlyRevenues = await prisma.$queryRaw`
  SELECT 
    EXTRACT(MONTH FROM "createdAt") AS month,
    SUM("subtotal") AS total_subtotal,
    SUM("subtotalCost") AS total_subtotalCost
  FROM "Order"
  WHERE "createdAt" >= ${new Date(`${currentYear}-01-01`)}
    AND "createdAt" < ${new Date(`${currentYear + 1}-01-01`)}
  GROUP BY EXTRACT(MONTH FROM "createdAt")
  ORDER BY month ASC;
`;

    // WHERE "userId" = ${req.user.parentId ? req.user.parentId : req.user.id}

    console.log({ monthlyRevenues });

    const revenues = monthlyRevenues.map((row) => ({
      month: row.month,
      revenue: row.total_subtotal - row.total_subtotalcost,
    }));

    return res
      .status(200)
      .json(jsonResponse(true, `Revenue generated`, revenues));
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
