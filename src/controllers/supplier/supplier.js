import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import slugify from "../../utils/slugify.js";
import validateInput from "../../utils/validateInput.js";

const module_name = "supplier";

//create supplier
export const createSupplier = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { userId, name, address, phone, email } = req.body;

      //validate input
      const inputValidation = validateInput([name], ["Name"]);

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      //check if supplier exists
      const supplier = await tx.supplier.findFirst({
        where: {
          userId: req.user.parentId ? req.user.parentId : req.user.id,
          phone: phone,
          isDeleted: false,
        },
      });

      if (supplier)
        return res
          .status(409)
          .json(jsonResponse(false, "Supplier already exists", null));

      const newSupplier = await tx.supplier.create({
        data: {
          userId: req.user.parentId ? req.user.parentId : req.user.id,
          name,
          address,
          phone,
          email,
          createdBy: req.user.id,
        },
      });

      if (newSupplier) {
        return res
          .status(200)
          .json(jsonResponse(true, "Supplier has been created", newSupplier));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all supplier
export const getSuppliers = async (req, res) => {
  if (req.user.roleName !== "super-admin") {
    getSuppliersByUser(req, res);
  } else {
    try {
      const suppliers = await prisma.supplier.findMany({
        where: {
          isDeleted: false,
          AND: [
            {
              name: {
                contains: req.query.name,
                mode: "insensitive",
              },
              address: {
                contains: req.query.address,
                mode: "insensitive",
              },
              phone: {
                contains: req.query.phone,
                mode: "insensitive",
              },
              email: {
                contains: req.query.email,
                mode: "insensitive",
              },
            },
          ],
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

      if (suppliers.length === 0)
        return res
          .status(200)
          .json(jsonResponse(true, "No supplier is available", null));

      if (suppliers) {
        return res
          .status(200)
          .json(
            jsonResponse(true, `${suppliers.length} suppliers found`, suppliers)
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

//get all suppliers by user
export const getSuppliersByUser = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: {
        userId: req.user.parentId ? req.user.parentId : req.user.id,
        isDeleted: false,
        AND: [
          {
            name: {
              contains: req.query.name,
              mode: "insensitive",
            },
            address: {
              contains: req.query.address,
              mode: "insensitive",
            },
            phone: {
              contains: req.query.phone,
              mode: "insensitive",
            },
            email: {
              contains: req.query.email,
              mode: "insensitive",
            },
          },
        ],
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

    if (suppliers.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No supplier is available", null));

    if (suppliers) {
      return res
        .status(200)
        .json(
          jsonResponse(true, `${suppliers.length} suppliers found`, suppliers)
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

//get single supplier
export const getSupplier = async (req, res) => {
  try {
    const supplier = await prisma.supplier.findFirst({
      where: { id: req.params.id, isDeleted: false },
    });

    if (supplier) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 supplier found`, supplier));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No supplier is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update supplier
export const updateSupplier = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { userId, name, address, phone, email } = req.body;

      //validate input
      const inputValidation = validateInput([name], ["Name"]);

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      //get user id from supplier and user name from user for slugify
      const findSupplier = await tx.supplier.findFirst({
        where: { id: req.params.id },
      });

      if (!findSupplier)
        return res
          .status(404)
          .json(jsonResponse(false, "This supplier does not exist", null));

      const user = await tx.user.findFirst({
        where: { id: findSupplier.userId },
      });

      if (!user)
        return res
          .status(404)
          .json(jsonResponse(false, "This user does not exist", null));

      //check if supplier exists
      const supplier = await tx.supplier.findFirst({
        where: {
          NOT: [{ id: req.params.id }],
          userId: req.user.parentId ? req.user.parentId : req.user.id,
          phone: phone,
          isDeleted: false,
        },
      });

      if (supplier)
        return res
          .status(409)
          .json(jsonResponse(false, "Supplier already exists", null));

      //update supplier
      const updateSupplier = await tx.supplier.update({
        where: { id: req.params.id },
        data: {
          userId: req.user.parentId ? req.user.parentId : req.user.id,
          name,
          address,
          phone,
          email,
          updatedBy: req.user.id,
        },
      });

      if (updateSupplier) {
        return res
          .status(200)
          .json(
            jsonResponse(true, `Supplier has been updated`, updateSupplier)
          );
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Supplier has not been updated", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//delete supplier
export const deleteSupplier = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.update({
        where: { id: req.params.id },
        data: { deletedBy: req.user.id, isDeleted: true },
      });

      if (supplier) {
        return res
          .status(200)
          .json(jsonResponse(true, `Supplier has been deleted`, supplier));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Supplier has not been deleted", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
