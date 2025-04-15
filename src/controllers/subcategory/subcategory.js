import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import deleteFromCloudinary from "../../utils/deleteFromCloudinary.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import slugify from "../../utils/slugify.js";
import uploadToCLoudinary from "../../utils/uploadToCloudinary.js";
import validateInput from "../../utils/validateInput.js";
// import uploadImage from "../../utils/uploadImage.js";

const module_name = "subcategory";

//create subcategory
export const createSubcategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let { name, categoryId, isActive } = req.body;

      //   console.log(req.body);

      //validate input
      const inputValidation = validateInput(
        [name, categoryId],
        ["Name", "Category"]
      );

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      //   if (serviceManufacturerId) {
      //     if (serviceManufacturerId.trim() === "") {
      //       serviceManufacturerId = undefined;
      //     }
      //   } else {
      //     serviceManufacturerId = undefined;
      //   }

      //   if (serviceModelId) {
      //     if (serviceModelId.trim() === "") {
      //       serviceModelId = undefined;
      //     }
      //   } else {
      //     serviceModelId = undefined;
      //   }

      //get user name for slugify
      //   const user = await tx.inspectionUser.findFirst({
      //     where: { id: req.user.parentId ? req.user.parentId : req.user.id },
      //   });

      //   if (!user)
      //     return res
      //       .status(404)
      //       .json(jsonResponse(false, "This user does not exist", null));

      //check if subcategory exists
      const subcategory = await tx.subcategory.findFirst({
        where: {
          slug: slugify(name),
        },
      });

      if (subcategory && subcategory?.slug === slugify(name))
        return res
          .status(409)
          .json(
            jsonResponse(
              false,
              `${name} already exists. Please change it`,
              null
            )
          );

      //if there is no image selected
      if (!req.file) {
        // return res
        //   .status(400)
        //   .json(jsonResponse(false, "Please select an image", null));
        //create category
        const newSubcategory = await prisma.subcategory.create({
          data: {
            name,
            categoryId,
            isActive: isActive === "true" ? true : false,
            slug: `${slugify(name)}`,
          },
        });

        if (newSubcategory) {
          return res
            .status(200)
            .json(
              jsonResponse(true, "Subcategory has been created", newSubcategory)
            );
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

        //create subcategory
        const newSubcategory = await prisma.subcategory.create({
          data: {
            name,
            categoryId,
            isActive: isActive === "true" ? true : false,
            image: result.secure_url,
            slug: `${slugify(name)}`,
          },
        });

        if (newSubcategory) {
          return res
            .status(200)
            .json(
              jsonResponse(true, "Subcategory has been created", newSubcategory)
            );
        }
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all subcategories
export const getSubcategories = async (req, res) => {
  //   if (req.user.roleName !== "super-admin") {
  //     getCategoriesByUser(req, res);
  //   } else {
  try {
    const subcategories = await prisma.subcategory.findMany({
      where: {
        AND: [
          {
            name: {
              contains: req.query.name,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        category: true,
        //   serviceManufacturer: true,
        //   serviceModel: true,
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

    if (subcategories.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No subcategory is available", null));

    if (subcategories) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${subcategories.length} subcategories found`,
            subcategories
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
  //   }
};

//get all subcategories by category
export const getSubcategoriesByCategory = async (req, res) => {
  //   if (req.user.roleName !== "super-admin") {
  //     getCategoriesByUser(req, res);
  //   } else {
  try {
    const subcategories = await prisma.subcategory.findMany({
      where: { categoryId: req.params.id },
      //   where: { slug: req.params.id },
      include: {
        category: true,
        //   serviceManufacturer: true,
        //   serviceModel: true,
      },
    });

    console.log(subcategories);

    if (subcategories.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No subcategory is available", null));

    if (subcategories) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${subcategories.length} subcategories found`,
            subcategories
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
  //   }
};

//get all manufacturers by user
// export const getManufacturersByUser = async (req, res) => {
//   try {
//     const categories = await prisma.category.findMany({
//       where: {
//         userId: req.user.parentId ? req.user.parentId : req.user.id,
//         isDeleted: false,
//         AND: [
//           {
//             name: {
//               contains: req.query.name,
//               mode: "insensitive",
//             },
//           },
//         ],
//       },
//       include: { user: true },
//       orderBy: {
//         createdAt: "desc",
//       },
//       skip:
//         req.query.limit && req.query.page
//           ? parseInt(req.query.limit * (req.query.page - 1))
//           : parseInt(defaultLimit() * (defaultPage() - 1)),
//       take: req.query.limit
//         ? parseInt(req.query.limit)
//         : parseInt(defaultLimit()),
//     });

//     if (categories.length === 0)
//       return res
//         .status(200)
//         .json(jsonResponse(true, "No category is available", null));

//     if (categories) {
//       return res
//         .status(200)
//         .json(
//           jsonResponse(
//             true,
//             `${categories.length} categories found`,
//             categories
//           )
//         );
//     } else {
//       return res
//         .status(404)
//         .json(jsonResponse(false, "Something went wrong. Try again", null));
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json(jsonResponse(false, error, null));
//   }
// };

//get single subcategory
export const getSubcategory = async (req, res) => {
  try {
    const subcategory = await prisma.subcategory.findFirst({
      where: { slug: req.params.slug },
      //   where: { slug: req.params.id },
      include: {
        category: true,
        //   serviceManufacturer: true,
        //   serviceModel: true,
      },
    });

    if (subcategory) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 subcategory found`, subcategory));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No subcategory is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update subcategory
export const updateSubcategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let { name, categoryId, isActive } = req.body;

      //validate input
      const inputValidation = validateInput(
        [name, categoryId],
        ["Name", "Category"]
      );

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      //   if (serviceManufacturerId) {
      //     if (
      //       serviceManufacturerId.trim() === "" ||
      //       serviceManufacturerId === "null"
      //     ) {
      //       serviceManufacturerId = undefined;
      //     }
      //   } else {
      //     serviceManufacturerId = undefined;
      //   }

      //   if (serviceModelId) {
      //     if (serviceModelId.trim() === "" || serviceModelId === "null") {
      //       serviceModelId = undefined;
      //     }
      //   } else {
      //     serviceModelId = undefined;
      //   }

      //get user id from brand and user name from user for slugify
      const findSubcategory = await tx.subcategory.findFirst({
        where: { id: req.params.id },
      });

      if (!findSubcategory)
        return res
          .status(404)
          .json(jsonResponse(false, "This subcategory does not exist", null));

      //   const user = await tx.user.findFirst({
      //     where: { id: findCategory.userId },
      //   });

      //   if (!user)
      //     return res
      //       .status(404)
      //       .json(jsonResponse(false, "This user does not exist", null));

      //check if slug already exists
      if (name) {
        if (
          name?.toLowerCase()?.trim() !==
          findSubcategory?.name?.toLowerCase()?.trim()
        ) {
          const existingSubcategory = await tx.subcategory.findFirst({
            where: {
              id: req.params.id,
            },
          });

          //   if (existingBanner && existingBanner.slug === `${slugify(name)}`) {
          if (
            existingSubcategory &&
            existingSubcategory.name?.toLowerCase()?.trim() ===
              name?.toLowerCase()?.trim()
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

            //update subcategory
            const subcategory = await prisma.subcategory.update({
              where: { id: req.params.id },
              data: {
                name,
                categoryId,
                isActive: isActive === "true" ? true : false,
                image: result.secure_url,
                slug: name ? `${slugify(name)}` : findSubcategory.slug,
              },
            });

            //delete previous uploaded image
            await deleteFromCloudinary(
              findSubcategory.image,
              async (error, result) => {
                console.log("error", error);
                console.log("result", result);
              }
            );

            if (subcategory) {
              return res
                .status(200)
                .json(
                  jsonResponse(
                    true,
                    `Subcategory has been updated`,
                    subcategory
                  )
                );
            } else {
              return res
                .status(404)
                .json(
                  jsonResponse(false, "Subcategory has not been updated", null)
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
        const subcategory = await prisma.subcategory.update({
          where: { id: req.params.id },
          data: {
            name,
            categoryId,
            isActive: isActive === "true" ? true : false,
            image: findSubcategory.image,
            slug: name ? `${slugify(name)}` : findSubcategory.slug,
          },
        });

        if (subcategory) {
          return res
            .status(200)
            .json(
              jsonResponse(true, `Subcategory has been updated`, subcategory)
            );
        } else {
          return res
            .status(404)
            .json(
              jsonResponse(false, "Subcategory has not been updated", null)
            );
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//ban category
// export const banCategory = async (req, res) => {
//   try {
//     return await prisma.$transaction(async (tx) => {
//       //ban category
//       const getCategory = await tx.category.findFirst({
//         where: { id: req.params.id },
//       });

//       const category = await tx.category.update({
//         where: { id: req.params.id },
//         data: {
//           isActive: getCategory.isActive === true ? false : true,
//         },
//       });

//       if (category) {
//         return res
//           .status(200)
//           .json(jsonResponse(true, `Category has been banned`, category));
//       } else {
//         return res
//           .status(404)
//           .json(jsonResponse(false, "Category has not been banned", null));
//       }
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json(jsonResponse(false, error, null));
//   }
// };

//delete subcategory
export const deleteSubcategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const subcategory = await tx.subcategory.delete({
        where: { id: req.params.id },
      });

      if (subcategory) {
        // fs.unlinkSync(
        //   `public\\images\\${module_name}\\${category.image.split("/")[2]}`
        // );
        await deleteFromCloudinary(subcategory.image, async (error, result) => {
          console.log("error", error);
          console.log("result", result);
        });

        return res
          .status(200)
          .json(
            jsonResponse(true, `Subcategory has been deleted`, subcategory)
          );
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Subcategory has not been deleted", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//For Customer

//get all subcategories for customer
export const getSubcategoriesForCustomer = async (req, res) => {
  try {
    const subcategories = await prisma.subcategory.findMany({
      where: {
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
      //   include: {
      //     serviceItem: true,
      //     serviceManufacturer: true,
      //     serviceModel: true,
      //   },
      //   select: {
      //     user: { select: { name: true, image: true } },
      //     id: true,
      //     name: true,
      //     image: true,
      //     slug: true,
      //     createdAt: true,
      //   },
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

    if (subcategories.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No subcategory is available", null));

    if (subcategories) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${subcategories.length} subcategories found`,
            subcategories
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

//get single subcategory for customer
export const getSubcategoryForCustomer = async (req, res) => {
  try {
    const subcategory = await prisma.subcategory.findFirst({
      where: {
        // slug: req.params.slug,
        id: req.params.id,
      },
      //   include: {
      //     serviceItem: true,
      //     serviceManufacturer: true,
      //     serviceModel: true,
      //   },
      //   select: {
      //     user: { select: { name: true, image: true } },
      //     id: true,
      //     name: true,
      //     image: true,
      //     slug: true,
      //     createdAt: true,
      //   },
    });

    if (subcategory) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 subcategory found`, subcategory));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No subcategory is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
