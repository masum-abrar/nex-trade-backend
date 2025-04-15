import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import deleteFromCloudinary from "../../utils/deleteFromCloudinary.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import slugify from "../../utils/slugify.js";
import uploadToCLoudinary from "../../utils/uploadToCloudinary.js";
import validateInput from "../../utils/validateInput.js";
// import uploadImage from "../../utils/uploadImage.js";

const module_name = "subsubcategory";

//create subsubcategory
export const createSubsubcategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let { name, categoryId, subcategoryId, isActive } = req.body;

      //   console.log(req.body);

      //validate input
      const inputValidation = validateInput(
        [name, categoryId, subcategoryId],
        ["Name", "Category", "Subcategory"]
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
      const subsubcategory = await tx.subsubcategory.findFirst({
        where: {
          slug: slugify(name),
        },
      });

      if (subsubcategory && subsubcategory?.slug === slugify(name))
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
        //create subcategory
        const newSubsubcategory = await prisma.subsubcategory.create({
          data: {
            name,
            categoryId,
            subcategoryId,
            isActive: isActive === "true" ? true : false,
            slug: `${slugify(name)}`,
          },
        });

        if (newSubsubcategory) {
          return res
            .status(200)
            .json(
              jsonResponse(
                true,
                "Subsubcategory has been created",
                newSubsubcategory
              )
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

        //create subsubcategory
        const newSubsubcategory = await prisma.subsubcategory.create({
          data: {
            name,
            categoryId,
            subcategoryId,
            isActive: isActive === "true" ? true : false,
            image: result.secure_url,
            slug: `${slugify(name)}`,
          },
        });

        if (newSubsubcategory) {
          return res
            .status(200)
            .json(
              jsonResponse(
                true,
                "Subsubcategory has been created",
                newSubsubcategory
              )
            );
        }
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all subsubcategories
export const getSubsubcategories = async (req, res) => {
  //   if (req.user.roleName !== "super-admin") {
  //     getCategoriesByUser(req, res);
  //   } else {
  try {
    const subsubcategories = await prisma.subsubcategory.findMany({
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
        subcategory: true,
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

    if (subsubcategories.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No subsubcategory is available", null));

    if (subsubcategories) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${subsubcategories.length} subsubcategories found`,
            subsubcategories
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

//get all subsubcategories by subcategory
export const getSubsubcategoriesBySubcategory = async (req, res) => {
  //   if (req.user.roleName !== "super-admin") {
  //     getCategoriesByUser(req, res);
  //   } else {
  try {
    const subcategories = await prisma.subsubcategory.findMany({
      where: { subcategoryId: req.params.id },
      //   where: { slug: req.params.id },
      include: {
        subcategory: true,
        //   serviceManufacturer: true,
        //   serviceModel: true,
      },
    });

    //   console.log(subcategories);

    if (subcategories.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No subsubcategory is available", null));

    if (subcategories) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${subcategories.length} subsubcategories found`,
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

//get single subsubcategory
export const getSubsubcategory = async (req, res) => {
  try {
    const subsubcategory = await prisma.subsubcategory.findFirst({
      where: { slug: req.params.slug },
      //   where: { slug: req.params.id },
      include: {
        subcategory: true,
        category: true,
        //   serviceManufacturer: true,
        //   serviceModel: true,
      },
    });

    if (subsubcategory) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 subsubcategory found`, subsubcategory));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No subsubcategory is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update subsubcategory
export const updateSubsubcategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let { name, categoryId, subcategoryId, isActive } = req.body;

      //validate input
      const inputValidation = validateInput(
        [name, categoryId, subcategoryId],
        ["Name", "Category", "Subcategory"]
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
      const findSubsubcategory = await tx.subsubcategory.findFirst({
        where: { id: req.params.id },
      });

      if (!findSubsubcategory)
        return res
          .status(404)
          .json(
            jsonResponse(false, "This subsubcategory does not exist", null)
          );

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
          findSubsubcategory?.name?.toLowerCase()?.trim()
        ) {
          const existingSubsubcategory = await tx.subsubcategory.findFirst({
            where: {
              id: req.params.id,
            },
          });

          //   if (existingBanner && existingBanner.slug === `${slugify(name)}`) {
          if (
            existingSubsubcategory &&
            existingSubsubcategory.name?.toLowerCase()?.trim() ===
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

            //update subsubcategory
            const subsubcategory = await prisma.subsubcategory.update({
              where: { id: req.params.id },
              data: {
                name,
                categoryId,
                subcategoryId,
                isActive: isActive === "true" ? true : false,
                image: result.secure_url,
                slug: name ? `${slugify(name)}` : findSubsubcategory.slug,
              },
            });

            //delete previous uploaded image
            await deleteFromCloudinary(
              findSubsubcategory.image,
              async (error, result) => {
                console.log("error", error);
                console.log("result", result);
              }
            );

            if (subsubcategory) {
              return res
                .status(200)
                .json(
                  jsonResponse(
                    true,
                    `Subsubcategory has been updated`,
                    subsubcategory
                  )
                );
            } else {
              return res
                .status(404)
                .json(
                  jsonResponse(
                    false,
                    "Subsubcategory has not been updated",
                    null
                  )
                );
            }
          }
        );

        // fs.unlinkSync(
        //   `public\\images\\${module_name}\\${findCategory.image.split("/")[2]}`
        // );
      } else {
        //if there is no image selected
        //update subcategory
        const subsubcategory = await prisma.subsubcategory.update({
          where: { id: req.params.id },
          data: {
            name,
            categoryId,
            subcategoryId,
            isActive: isActive === "true" ? true : false,
            image: findSubsubcategory.image,
            slug: name ? `${slugify(name)}` : findSubsubcategory.slug,
          },
        });

        if (subsubcategory) {
          return res
            .status(200)
            .json(
              jsonResponse(
                true,
                `Subsubcategory has been updated`,
                subsubcategory
              )
            );
        } else {
          return res
            .status(404)
            .json(
              jsonResponse(false, "Subsubcategory has not been updated", null)
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

//delete subsubcategory
export const deleteSubsubcategory = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const subsubcategory = await tx.subsubcategory.delete({
        where: { id: req.params.id },
      });

      if (subsubcategory) {
        // fs.unlinkSync(
        //   `public\\images\\${module_name}\\${category.image.split("/")[2]}`
        // );
        await deleteFromCloudinary(
          subsubcategory.image,
          async (error, result) => {
            console.log("error", error);
            console.log("result", result);
          }
        );

        return res
          .status(200)
          .json(
            jsonResponse(
              true,
              `Subsubcategory has been deleted`,
              subsubcategory
            )
          );
      } else {
        return res
          .status(404)
          .json(
            jsonResponse(false, "Subsubcategory has not been deleted", null)
          );
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//For Customer

//get all subcategories for customer
export const getSubsubcategoriesForCustomer = async (req, res) => {
  try {
    const subsubcategories = await prisma.subsubcategory.findMany({
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

    if (subsubcategories.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No subsubcategory is available", null));

    if (subsubcategories) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${subsubcategories.length} subsubcategories found`,
            subsubcategories
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

//get single subsubcategory for customer
export const getSubsubcategoryForCustomer = async (req, res) => {
  try {
    const subsubcategory = await prisma.subsubcategory.findFirst({
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

    if (subsubcategory) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 subsubcategory found`, subsubcategory));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No subsubcategory is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
