import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import validateInput from "../../utils/validateInput.js";

const module_name = "role-module";

//create role-module
export const createRoleModule = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { roleId, moduleIds } = req.body;

      //validate input
      const inputValidation = validateInput(
        [roleId, moduleIds],
        ["Role", "Module"]
      );

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

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

      //check if module and role exists
      for (let i = 0; i < moduleIdsLength; i++) {
        const module_id = await tx.module.findFirst({
          where: { id: moduleIds[i], isDeleted: false },
        });

        if (!module_id) {
          return res
            .status(401)
            .json(jsonResponse(false, "Some modules do not exist", null));
        }
      }

      const role_id = await tx.role.findFirst({
        where: { id: roleId, isDeleted: false },
      });

      if (!role_id)
        return res
          .status(401)
          .json(jsonResponse(false, "Role does not exist", null));

      //create module
      let roleModuleList = [];
      for (let i = 0; i < moduleIdsLength; i++) {
        const newRoleModule = await tx.roleModule.create({
          data: {
            roleId: roleId,
            moduleId: moduleIds[i],
          },
        });

        if (!newRoleModule)
          return res
            .status(500)
            .json(jsonResponse(false, "Something went wrong. Try again", null));

        roleModuleList.push(newRoleModule);
      }

      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            "Modules have been assigned to the role",
            roleModuleList
          )
        );
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all role-modules
export const getRoleModules = async (req, res) => {
  try {
    const role_modules = await prisma.roleModule.findMany({
      where: { isDeleted: false },
      include: { role: true, module: true },
      skip:
        req.query.limit && req.query.page
          ? parseInt(req.query.limit * (req.query.page - 1))
          : parseInt(defaultLimit() * (defaultPage() - 1)),
      take: req.query.limit
        ? parseInt(req.query.limit)
        : parseInt(defaultLimit()),
    });

    if (role_modules.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No role-module is available", null));

    if (role_modules) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${role_modules.length} role-modules found`,
            role_modules
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

//get single role-module
export const getRoleModule = async (req, res) => {
  try {
    const role_module = await prisma.roleModule.findFirst({
      where: { id: req.params.id, isDeleted: false },
    });

    if (role_module) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 module found`, role_module));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No role-module is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//delete role-module
export const deleteRoleModule = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const role_module = await tx.roleModule.update({
        where: { id: req.params.id },
        data: { isDeleted: true },
      });

      if (role_module) {
        return res
          .status(200)
          .json(jsonResponse(true, `Role-module has been deleted`, module));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Role-module has not been deleted", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
