import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import deleteFromCloudinary from "../../utils/deleteFromCloudinary.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import slugify from "../../utils/slugify.js";
import uploadToCLoudinary from "../../utils/uploadToCloudinary.js";
import validateInput from "../../utils/validateInput.js";
// import uploadImage from "../../utils/uploadImage.js";

const module_name = "category";

//create category
export const createCategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { name } = req.body;

      //validate input
      const inputValidation = validateInput([name], ["Name"]);

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      //get user name for slugify
      const user = await tx.user.findFirst({
        where: { id: req.user.parentId ? req.user.parentId : req.user.id },
      });

      if (!user)
        return res
          .status(404)
          .json(jsonResponse(false, "This user does not exist", null));

      //check if category exists
      const category = await tx.category.findFirst({
        where: {
          userId: req.user.parentId ? req.user.parentId : req.user.id,
          name: name,
          isDeleted: false,
        },
      });

      if (
        category &&
        category.slug === `${slugify(user.name)}-${slugify(name)}`
      )
        return res
          .status(409)
          .json(
            jsonResponse(
              false,
              `${name} already exists. Change its name.`,
              null
            )
          );

      //if there is no image selected
      if (!req.file) {
        //create category
        const newCategory = await prisma.category.create({
          data: {
            userId: req.user.parentId ? req.user.parentId : req.user.id,
            name,
            createdBy: req.user.id,
            slug: `${slugify(user.name)}-${slugify(name)}`,
          },
        });

        if (newCategory) {
          return res
            .status(200)
            .json(jsonResponse(true, "Category has been created", newCategory));
        }
      }

      //upload image
      // const imageUpload = await uploadImage(req.file);
      await uploadToCLoudinary(req.file, module_name, async (error, result) => {
        if (error) {
          console.error("error", error);
          return res.status(404).json(jsonResponse(false, error, null));
        }

        if (!result.secure_url) {
          return res
            .status(404)
            .json(
              jsonResponse(
                false,
                "Something went wrong while uploading image. Try again",
                null
              )
            );
        }

        //create category
        const newCategory = await prisma.category.create({
          data: {
            userId: req.user.parentId ? req.user.parentId : req.user.id,
            name,
            image: result.secure_url,
            createdBy: req.user.id,
            slug: `${slugify(user.name)}-${slugify(name)}`,
          },
        });

        if (newCategory) {
          return res
            .status(200)
            .json(jsonResponse(true, "Category has been created", newCategory));
        }
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all categories
export const getCategories = async (req, res) => {
  if (req.user.roleName !== "super-admin") {
    getCategoriesByUser(req, res);
  } else {
    try {
      const categories = await prisma.category.findMany({
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

      if (categories.length === 0)
        return res
          .status(200)
          .json(jsonResponse(true, "No category is available", null));

      if (categories) {
        return res
          .status(200)
          .json(
            jsonResponse(
              true,
              `${categories.length} categories found`,
              categories
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

//get all categories by user
export const getCategoriesByUser = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        userId: req.user.parentId ? req.user.parentId : req.user.id,
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

    if (categories.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No category is available", null));

    if (categories) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${categories.length} categories found`,
            categories
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

//get single category
export const getCategory = async (req, res) => {
  try {
    const category = await prisma.category.findFirst({
      where: { slug: req.params.slug, isDeleted: false },
    });

    if (category) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 category found`, category));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No category is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update category
export const updateCategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { userId, name } = req.body;

      //validate input
      const inputValidation = validateInput([name], ["Name"]);

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      //get user id from category and user name from user for slugify
      const findCategory = await tx.category.findFirst({
        where: { id: req.params.id },
      });

      if (!findCategory)
        return res
          .status(404)
          .json(jsonResponse(false, "This category does not exist", null));

      const user = await tx.user.findFirst({
        where: { id: findCategory.userId },
      });

      if (!user)
        return res
          .status(404)
          .json(jsonResponse(false, "This user does not exist", null));

      //check if slug already exists
      if (name) {
        if (name !== findCategory.name) {
          const existingCategory = await tx.category.findFirst({
            where: {
              userId: req.user.parentId ? req.user.parentId : req.user.id,
              name: name,
              isDeleted: false,
            },
          });

          if (
            existingCategory &&
            existingCategory.slug === `${slugify(user.name)}-${slugify(name)}`
          ) {
            return res
              .status(409)
              .json(
                jsonResponse(
                  false,
                  `${name} already exists. Change its name.`,
                  null
                )
              );
          }
        }
      }

      //upload image
      // let imageUpload;
      if (req.file) {
        // imageUpload = await uploadImage(req.file);
        await uploadToCLoudinary(
          req.file,
          module_name,
          async (error, result) => {
            if (error) {
              console.error("error", error);
              return res.status(404).json(jsonResponse(false, error, null));
            }

            if (!result.secure_url) {
              return res
                .status(404)
                .json(
                  jsonResponse(
                    false,
                    "Something went wrong while uploading image. Try again",
                    null
                  )
                );
            }

            //update category
            const category = await prisma.category.update({
              where: { id: req.params.id },
              data: {
                userId: req.user.parentId ? req.user.parentId : req.user.id,
                name,
                image: result.secure_url,
                updatedBy: req.user.id,
                slug: name
                  ? `${slugify(user.name)}-${slugify(name)}`
                  : findCategory.slug,
              },
            });

            //delete previous uploaded image
            await deleteFromCloudinary(
              findCategory.image,
              async (error, result) => {
                console.log("error", error);
                console.log("result", result);
              }
            );

            if (category) {
              return res
                .status(200)
                .json(
                  jsonResponse(true, `Category has been updated`, category)
                );
            } else {
              return res
                .status(404)
                .json(
                  jsonResponse(false, "Category has not been updated", null)
                );
            }
          }
        );

        // fs.unlinkSync(
        //   `public\\images\\${module_name}\\${findCategory.image.split("/")[2]}`
        // );
      } else {
        //if there is no image selected
        //update category
        const category = await prisma.category.update({
          where: { id: req.params.id },
          data: {
            userId: req.user.parentId ? req.user.parentId : req.user.id,
            name,
            image: findCategory.image,
            updatedBy: req.user.id,
            slug: name
              ? `${slugify(user.name)}-${slugify(name)}`
              : findCategory.slug,
          },
        });

        if (category) {
          return res
            .status(200)
            .json(jsonResponse(true, `Category has been updated`, category));
        } else {
          return res
            .status(404)
            .json(jsonResponse(false, "Category has not been updated", null));
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//ban category
export const banCategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      //ban category
      const getCategory = await tx.category.findFirst({
        where: { id: req.params.id },
      });

      const category = await tx.category.update({
        where: { id: req.params.id },
        data: {
          isActive: getCategory.isActive === true ? false : true,
        },
      });

      if (category) {
        return res
          .status(200)
          .json(jsonResponse(true, `Category has been banned`, category));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Category has not been banned", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//delete category
export const deleteCategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const category = await tx.category.update({
        where: { id: req.params.id },
        data: { deletedBy: req.user.id, isDeleted: true },
      });

      if (category) {
        // fs.unlinkSync(
        //   `public\\images\\${module_name}\\${category.image.split("/")[2]}`
        // );
        await deleteFromCloudinary(category.image, async (error, result) => {
          console.log("error", error);
          console.log("result", result);
        });

        return res
          .status(200)
          .json(jsonResponse(true, `Category has been deleted`, category));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Category has not been deleted", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//For Customer

//get all categories for customer
export const getCategoriesForCustomer = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        AND: [
          {
            name: {
              contains: req.query.name,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        user: { select: { name: true, image: true } },
        id: true,
        name: true,
        image: true,
        slug: true,
        createdAt: true,
        subcategory: true,
        subsubcategory: true,
      },
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

    if (categories.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No category is available", null));

    if (categories) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${categories.length} categories found`,
            categories
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

//get single category for customer
export const getCategoryForCustomer = async (req, res) => {
  try {
    const category = await prisma.category.findFirst({
      where: {
        slug: req.params.slug,
        isDeleted: false,
        isActive: true,
      },
      select: {
        user: { select: { name: true, image: true } },
        id: true,
        name: true,
        image: true,
        slug: true,
        createdAt: true,
        subcategory: true,
        subsubcategory: true,
      },
    });

    if (category) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 category found`, category));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No category is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
