import { matchYearMonth } from "../../utils/dateTime.js";
import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import { filterByMonth } from "../../utils/filter.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";

const module_name = "monthly-payment";

//create monthly payment
export const createMonthlyPayment = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { userId, date, amount, due } = req.body;

      //check if monthly payment exists
      const monthlyPayment = await tx.payment.findFirst({
        where: { userId, isDeleted: false },
      });

      if (monthlyPayment) {
        if (matchYearMonth(monthlyPayment.date, date)) {
          return res
            .status(409)
            .json(
              jsonResponse(
                false,
                "This user has already paid for this month",
                null
              )
            );
        }
      }

      //create monthly payment
      const newPayment = await tx.payment.create({
        data: {
          userId,
          date,
          amount,
          due,
        },
      });

      if (newPayment) {
        return res
          .status(200)
          .json(
            jsonResponse(true, "Monthly payment has been added", newPayment)
          );
      }
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(jsonResponse(false, "Something went wrong. Try again", null));
  }
};

//get all monthly payments
export const getMonthlyPayments = async (req, res) => {
  if (req.user.roleName !== "super-admin") {
    getMonthlyPaymentsByUser(req, res);
  } else {
    const month = req.query.month;
    try {
      let monthlyPayment;

      monthlyPayment = await prisma.payment.findMany({
        where: {
          isDeleted: false,
        },
        include: { user: true },
        orderBy: {
          createdAt: "desc",
        },
        skip:
          req.query.limit && req.query.page
            ? parseInt(req.query.limit * (req.query.page - 1))
            : parseInt(defaultLimit() * (defaultPage() - 1)),
        take: req.query.limit
          ? parseInt(req.query.limit)
          : parseInt(defaultLimit()),
      });

      //filter month wise payment
      if (month) {
        monthlyPayment = filterByMonth([], monthlyPayment, month);
      }

      if (monthlyPayment.length === 0)
        return res
          .status(200)
          .json(jsonResponse(true, "No monthly payment is available", null));

      if (monthlyPayment) {
        return res
          .status(200)
          .json(
            jsonResponse(
              true,
              `${monthlyPayment.length} monthly payments found`,
              monthlyPayment
            )
          );
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Something went wrong. Try again", null));
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json(jsonResponse(false, error, null));
    }
  }
};

//get all monthly payments by particular user
export const getMonthlyPaymentsByUser = async (req, res) => {
  const month = req.query.month;
  try {
    let monthlyPayment;

    monthlyPayment = await prisma.payment.findMany({
      where: {
        userId: req.params.id,
        isDeleted: false,
      },
      include: { user: true },
      orderBy: {
        createdAt: "desc",
      },
      skip:
        req.query.limit && req.query.page
          ? parseInt(req.query.limit * (req.query.page - 1))
          : parseInt(defaultLimit() * (defaultPage() - 1)),
      take: req.query.limit
        ? parseInt(req.query.limit)
        : parseInt(defaultLimit()),
    });

    //filter month wise payment
    if (month) {
      monthlyPayment = filterByMonth([], monthlyPayment, month);
    }

    if (monthlyPayment.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No monthly payment is available", null));

    if (monthlyPayment) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${monthlyPayment.length} monthly payments found`,
            monthlyPayment
          )
        );
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "Something went wrong. Try again", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get single monthly payment
export const getMonthlyPayment = async (req, res) => {
  try {
    const monthlyPayment = await prisma.payment.findFirst({
      where: { id: req.params.id, isDeleted: false },
    });

    if (monthlyPayment) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 monthly payment found`, monthlyPayment));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No monthly payment is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update monthly payment
export const updateMonthlyPayment = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { userId, date, amount, due } = req.body;

      const monthlyPayment = await tx.payment.update({
        where: { id: req.params.id },
        data: { userId, date, amount, due },
      });

      if (monthlyPayment) {
        return res
          .status(200)
          .json(
            jsonResponse(
              true,
              `Monthly payment has been updated`,
              monthlyPayment
            )
          );
      } else {
        return res
          .status(404)
          .json(
            jsonResponse(false, "Monthly payment has not been updated", null)
          );
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//delete monthly payment
export const deleteMonthlyPayment = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const monthlyPayment = await tx.payment.update({
        where: { id: req.params.id },
        data: { isDeleted: true },
      });

      if (monthlyPayment) {
        return res
          .status(200)
          .json(
            jsonResponse(
              true,
              `Monthly payment has been deleted`,
              monthlyPayment
            )
          );
      } else {
        return res
          .status(404)
          .json(
            jsonResponse(false, "Monthly payment has not been deleted", null)
          );
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
