import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import deleteFromCloudinary from "../../utils/deleteFromCloudinary.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import uploadToCLoudinary from "../../utils/uploadToCloudinary.js";
import validateInput from "../../utils/validateInput.js";
// import uploadImage from "../../utils/uploadImage.js";

const module_name = "banner";

//create banner
export const createBanner = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let { title, subtitle, url, isActive } = req.body;

      //   console.log(req.body);

      //validate input
      const inputValidation = validateInput(
        [title, subtitle, url],
        ["Title", "Subtitle", "URL"]
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

      //check if banner exists
      const banner = await tx.banner.findFirst({
        where: {
          title: title,
        },
      });

      if (
        banner &&
        banner?.title?.toLowerCase()?.trim() === title?.toLowerCase()?.trim()
      )
        return res
          .status(409)
          .json(jsonResponse(false, `${title} already exists.`, null));

      //if there is no image selected
      if (!req.file) {
        // return res
        //   .status(400)
        //   .json(jsonResponse(false, "Please select an image", null));
        //create brand
        const newBanner = await prisma.banner.create({
          data: {
            title,
            subtitle,
            url,
            isActive: isActive === "true" ? true : false,
            // slug: `${slugify(name)}`,
          },
        });

        if (newBanner) {
          return res
            .status(200)
            .json(jsonResponse(true, "Banner has been created", newBanner));
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

        //create banner
        const newBanner = await prisma.banner.create({
          data: {
            title,
            subtitle,
            url,
            isActive: isActive === "true" ? true : false,
            image: result.secure_url,
            // slug: `${slugify(name)}`,
          },
        });

        if (newBanner) {
          return res
            .status(200)
            .json(jsonResponse(true, "Banner has been created", newBanner));
        }
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all banners
export const getBanners = async (req, res) => {
  //   if (req.user.roleName !== "super-admin") {
  //     getCategoriesByUser(req, res);
  //   } else {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        AND: [
          {
            title: {
              contains: req.query.title,
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

    if (banners.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No banner is available", null));

    if (banners) {
      return res
        .status(200)
        .json(jsonResponse(true, `${banners.length} banners found`, banners));
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

//get single banner
export const getBanner = async (req, res) => {
  try {
    const banner = await prisma.banner.findFirst({
      //   where: { slug: req.params.slug },
      where: { id: req.params.id },
      //   include: {
      //     serviceItem: true,
      //     serviceManufacturer: true,
      //     serviceModel: true,
      //   },
    });

    if (banner) {
      return res.status(200).json(jsonResponse(true, `1 banner found`, banner));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No banner is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update banner
export const updateBanner = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let { title, subtitle, url, isActive } = req.body;

      //validate input
      const inputValidation = validateInput(
        [title, subtitle, url],
        ["Title", "Subtitle", "URL"]
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
      const findBanner = await tx.banner.findFirst({
        where: { id: req.params.id },
      });

      if (!findBanner)
        return res
          .status(404)
          .json(jsonResponse(false, "This banner does not exist", null));

      //   const user = await tx.user.findFirst({
      //     where: { id: findCategory.userId },
      //   });

      //   if (!user)
      //     return res
      //       .status(404)
      //       .json(jsonResponse(false, "This user does not exist", null));

      //check if slug already exists
      if (title) {
        if (
          title?.toLowerCase()?.trim() !==
          findBanner?.title?.toLowerCase()?.trim()
        ) {
          const existingBanner = await tx.banner.findFirst({
            where: {
              id: req.params.id,
            },
          });

          //   if (existingBanner && existingBanner.slug === `${slugify(name)}`) {
          if (
            existingBanner &&
            existingBanner.title?.toLowerCase()?.trim() ===
              title?.toLowerCase()?.trim()
          ) {
            return res
              .status(409)
              .json(
                jsonResponse(
                  false,
                  `${title} already exists. Change its name.`,
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

            //update banner
            const banner = await prisma.banner.update({
              where: { id: req.params.id },
              data: {
                title,
                subtitle,
                url,
                isActive: isActive === "true" ? true : false,
                image: result.secure_url,
                // slug: name ? `${slugify(name)}` : findBrand.slug,
              },
            });

            //delete previous uploaded image
            await deleteFromCloudinary(
              findBanner.image,
              async (error, result) => {
                console.log("error", error);
                console.log("result", result);
              }
            );

            if (banner) {
              return res
                .status(200)
                .json(jsonResponse(true, `Banner has been updated`, banner));
            } else {
              return res
                .status(404)
                .json(jsonResponse(false, "Banner has not been updated", null));
            }
          }
        );

        // fs.unlinkSync(
        //   `public\\images\\${module_name}\\${findCategory.image.split("/")[2]}`
        // );
      } else {
        //if there is no image selected
        //update category
        const banner = await prisma.banner.update({
          where: { id: req.params.id },
          data: {
            title,
            subtitle,
            url,
            isActive: isActive === "true" ? true : false,
            image: findBanner.image,
            // slug: name ? `${slugify(name)}` : findBrand.slug,
          },
        });

        if (banner) {
          return res
            .status(200)
            .json(jsonResponse(true, `Banner has been updated`, banner));
        } else {
          return res
            .status(404)
            .json(jsonResponse(false, "Banner has not been updated", null));
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

//delete banner
export const deleteBanner = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const banner = await tx.banner.delete({
        where: { id: req.params.id },
      });

      if (banner) {
        // fs.unlinkSync(
        //   `public\\images\\${module_name}\\${category.image.split("/")[2]}`
        // );
        await deleteFromCloudinary(banner.image, async (error, result) => {
          console.log("error", error);
          console.log("result", result);
        });

        return res
          .status(200)
          .json(jsonResponse(true, `Banner has been deleted`, banner));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Banner has not been deleted", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//For Customer

//get all banners for customer
export const getBannersForCustomer = async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        AND: [
          {
            title: {
              contains: req.query.title,
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

    if (banners.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No banner is available", null));

    if (banners) {
      return res
        .status(200)
        .json(jsonResponse(true, `${banners.length} banners found`, banners));
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

//get single banner for customer
export const getBannerForCustomer = async (req, res) => {
  try {
    const banner = await prisma.banner.findFirst({
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

    if (banner) {
      return res.status(200).json(jsonResponse(true, `1 banner found`, banner));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No banner is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
