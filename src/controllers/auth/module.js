import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import validateInput from "../../utils/validateInput.js";

const module_name = "module";

//create module
export const createModule = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { name } = req.body;

      //validate input
      const inputValidation = validateInput([name], ["Name"]);

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      //check if module exists
      const module = await tx.module.findFirst({
        where: { name: name, isDeleted: false },
      });

      if (module)
        return res
          .status(409)
          .json(jsonResponse(false, "Module already exists", null));

      //create module
      const newModule = await tx.module.create({
        data: {
          name,
        },
      });

      if (newModule) {
        return res
          .status(200)
          .json(jsonResponse(true, "Module has been created", newModule));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all modules
export const getModules = async (req, res) => {
  try {
    const modules = await prisma.module.findMany({
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
      skip:
        req.query.limit && req.query.page
          ? parseInt(req.query.limit * (req.query.page - 1))
          : parseInt(defaultLimit() * (defaultPage() - 1)),
      take: req.query.limit
        ? parseInt(req.query.limit)
        : parseInt(defaultLimit()),
    });

    if (modules.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No module is available", null));

    if (modules) {
      return res
        .status(200)
        .json(jsonResponse(true, `${modules.length} modules found`, modules));
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

//get single module
export const getModule = async (req, res) => {
  try {
    const module = await prisma.module.findFirst({
      where: { id: req.params.id, isDeleted: false },
    });

    if (module) {
      return res.status(200).json(jsonResponse(true, `1 module found`, module));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No module is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update module
export const updateModule = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { name } = req.body;

      //validate input
      const inputValidation = validateInput([name], ["Name"]);

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      //check if module exists
      const module = await tx.module.findFirst({
        where: { name: name, isDeleted: false },
      });

      if (module)
        return res
          .status(409)
          .json(jsonResponse(false, "Module already exists", null));

      const updateModule = await tx.module.update({
        where: { id: req.params.id },
        data: { name },
      });

      if (updateModule) {
        return res
          .status(200)
          .json(jsonResponse(true, `Module has been updated`, updateModule));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Module has not been updated", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//delete module
export const deleteModule = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const module = await tx.module.update({
        where: { id: req.params.id },
        data: { isDeleted: true },
      });

      if (module) {
        const role_module = await tx.roleModule.updateMany({
          where: { moduleId: req.params.id },
          data: { isDeleted: true },
        });

        if (role_module) {
          return res
            .status(200)
            .json(jsonResponse(true, `Module has been deleted`, module));
        }
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Module has not been deleted", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
