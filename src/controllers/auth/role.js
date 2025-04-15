import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import validateInput from "../../utils/validateInput.js";

const module_name = "role";

//create role
export const createRole = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { name, price } = req.body;

      //validate input
      const inputValidation = validateInput([name], ["Name"]);

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      //check if role exists
      const role = await tx.role.findFirst({
        where: { name: name, isDeleted: false },
      });

      if (role)
        return res
          .status(409)
          .json(jsonResponse(false, "Role already exists", null));

      //create role
      const newRole = await tx.role.create({
        data: {
          name,
          price,
        },
      });

      if (newRole) {
        return res
          .status(200)
          .json(jsonResponse(true, "Role has been created", newRole));
      }
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(jsonResponse(false, "Something went wrong. Try again", null));
  }
};

//get all roles
export const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      where: {
        isDeleted: false,
        AND: [
          {
            name: {
              contains: req.query.name,
              mode: "insensitive",
            },
          },
        ],
      },
      include: { roleModules: true },
      skip:
        req.query.limit && req.query.page
          ? parseInt(req.query.limit * (req.query.page - 1))
          : parseInt(defaultLimit() * (defaultPage() - 1)),
      take: req.query.limit
        ? parseInt(req.query.limit)
        : parseInt(defaultLimit()),
    });

    if (roles.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No role is available", null));

    if (roles) {
      return res
        .status(200)
        .json(jsonResponse(true, `${roles.length} roles found`, roles));
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

//get single role
export const getRole = async (req, res) => {
  try {
    const role = await prisma.role.findFirst({
      where: { id: req.params.id, isDeleted: false },
      include: { roleModules: true },
    });

    if (role) {
      return res.status(200).json(jsonResponse(true, `1 role found`, role));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No role is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update role
export const updateRole = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { name, price, moduleIds } = req.body;

      //validate input
      const inputValidation = validateInput([name], ["Name"]);

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      //check if role exists
      const role = await tx.role.findFirst({
        where: { NOT: [{ id: req.params.id }], name: name, isDeleted: false },
      });

      if (role)
        return res
          .status(409)
          .json(jsonResponse(false, "Role already exists", null));

      if (!moduleIds) {
        return res
          .status(401)
          .json(jsonResponse(false, "Please select atleast one module", null));
      }

      const moduleIdsLength = moduleIds.length;

      if (moduleIdsLength === 0) {
        return res
          .status(401)
          .json(jsonResponse(false, "Module list cannot be empty", null));
      }

      const updateRole = await tx.role.update({
        where: { id: req.params.id },
        data: { name, price },
      });

      if (updateRole) {
        //first delete role-module
        const deleteRoleModule = await tx.roleModule.deleteMany({
          where: { roleId: req.params.id },
        });

        //update role-module
        let roleModuleList = [];
        for (let i = 0; i < moduleIdsLength; i++) {
          const newRoleModule = await tx.roleModule.create({
            data: {
              roleId: req.params.id,
              moduleId: moduleIds[i],
            },
          });

          if (!newRoleModule)
            return res
              .status(500)
              .json(
                jsonResponse(false, "Something went wrong. Try again", null)
              );

          roleModuleList.push(newRoleModule);
        }

        return res
          .status(200)
          .json(jsonResponse(true, `Role has been updated`, updateRole));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Role has not been updated", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//delete role
export const deleteRole = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const role = await tx.role.update({
        where: { id: req.params.id },
        data: { isDeleted: true },
      });

      if (role) {
        const role_module = await tx.roleModule.updateMany({
          where: { roleId: req.params.id },
          data: { isDeleted: true },
        });
        if (role_module) {
          return res
            .status(200)
            .json(jsonResponse(true, `Role has been deleted`, role));
        }
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Role has not been deleted", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
