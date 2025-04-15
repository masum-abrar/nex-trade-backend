import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import validateInput from "../../utils/validateInput.js";
// import uploadImage from "../../utils/uploadImage.js";

const module_name = "preorder";

//create preorder
export const createPreorder = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let { productId, userId, productAttributeId } = req.body;

      //   console.log(req.body);

      //validate input
      const inputValidation = validateInput(
        [productId, productAttributeId, userId],
        ["Product", "Variant", "User"]
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

      //check if preorder exists
      const preorder = await tx.preorder.findFirst({
        where: {
          productId: productId,
          productAttributeId: productAttributeId,
          userId: userId,
        },
      });

      //   if (
      //     preorder &&
      //     preorder?.code?.toLowerCase()?.trim() === code?.toLowerCase()?.trim()
      //   )
      //     return res
      //       .status(409)
      //       .json(jsonResponse(false, `${code} already exists.`, null));

      const newPreorder = await prisma.preorder.create({
        data: {
          productId,
          productAttributeId,
          userId,
        },
      });

      if (newPreorder) {
        return res
          .status(200)
          .json(jsonResponse(true, "Thank you for your preorder", newPreorder));
      }

      //if there is no image selected
      //   if (!req.file) {
      //     // return res
      //     //   .status(400)
      //     //   .json(jsonResponse(false, "Please select an image", null));
      //     //create brand
      //     const newCoupon = await prisma.coupon.create({
      //       data: {
      //         name,
      //         code,
      //         discountAmount,
      //         orderPriceLimit,
      //         isActive: isActive === "true" ? true : false,
      //         // slug: `${slugify(name)}`,
      //       },
      //     });

      //     if (newCoupon) {
      //       return res
      //         .status(200)
      //         .json(jsonResponse(true, "Coupon has been created", newCoupon));
      //     }
      //   }

      //upload image
      // const imageUpload = await uploadImage(req.file);
      //   await uploadToCLoudinary(req.file, module_name, async (error, result) => {
      //     if (error) {
      //       console.error("error", error);
      //       return res.status(404).json(jsonResponse(false, error, null));
      //     }

      //     if (!result.secure_url) {
      //       return res
      //         .status(404)
      //         .json(
      //           jsonResponse(
      //             false,
      //             "Something went wrong while uploading image. Try again",
      //             null
      //           )
      //         );
      //     }

      //     //create banner
      //     const newBanner = await prisma.banner.create({
      //       data: {
      //         title,
      //         subtitle,
      //         isActive: isActive === "true" ? true : false,
      //         image: result.secure_url,
      //         // slug: `${slugify(name)}`,
      //       },
      //     });

      //     if (newBanner) {
      //       return res
      //         .status(200)
      //         .json(jsonResponse(true, "Banner has been created", newBanner));
      //     }
      //   });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all preorders
export const getPreorders = async (req, res) => {
  //   if (req.user.roleName !== "super-admin") {
  //     getCategoriesByUser(req, res);
  //   } else {
  try {
    const preorders = await prisma.preorder.findMany({
      //   where: {
      //     AND: [
      //       {
      //         name: {
      //           contains: req.query.name,
      //           mode: "insensitive",
      //         },
      //       },
      //     ],
      //   },
      include: {
        user: true,
        product: true,
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

    if (preorders.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No preorder is available", null));

    if (preorders) {
      return res
        .status(200)
        .json(
          jsonResponse(true, `${preorders.length} preorders found`, preorders)
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

//get single preorder
export const getPreorder = async (req, res) => {
  try {
    const preorder = await prisma.preorder.findFirst({
      //   where: { slug: req.params.slug },
      where: { id: req.params.id },
      include: {
        product: true,
        user: true,
        //   serviceModel: true,
      },
    });

    if (preorder) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 preorder found`, preorder));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No preorder is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update preorder
export const updatePreorder = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let { productId, userId } = req.body;

      //validate input
      const inputValidation = validateInput(
        [productId, userId],
        ["Product", "User"]
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
      //   const findCoupon = await tx.coupon.findFirst({
      //     where: { id: req.params.id },
      //   });

      //   if (!findCoupon)
      //     return res
      //       .status(404)
      //       .json(jsonResponse(false, "This coupon does not exist", null));

      //   const user = await tx.user.findFirst({
      //     where: { id: findCategory.userId },
      //   });

      //   if (!user)
      //     return res
      //       .status(404)
      //       .json(jsonResponse(false, "This user does not exist", null));

      //check if slug already exists
      //   if (preorder) {
      //     if (
      //       code?.toLowerCase()?.trim() !==
      //       findCoupon?.code?.toLowerCase()?.trim()
      //     ) {
      //       const existingCoupon = await tx.coupon.findFirst({
      //         where: {
      //           id: req.params.id,
      //         },
      //       });

      //       //   if (existingBanner && existingBanner.slug === `${slugify(name)}`) {
      //       if (
      //         existingCoupon &&
      //         existingCoupon.code?.toLowerCase()?.trim() ===
      //           code?.toLowerCase()?.trim()
      //       ) {
      //         return res
      //           .status(409)
      //           .json(
      //             jsonResponse(false, `${code} already exists. Change it.`, null)
      //           );
      //       }
      //     }
      //   }

      //upload image
      // let imageUpload;
      //   if (req.file) {
      //     // imageUpload = await uploadImage(req.file);
      //     await uploadToCLoudinary(
      //       req.file,
      //       module_name,
      //       async (error, result) => {
      //         if (error) {
      //           console.error("error", error);
      //           return res.status(404).json(jsonResponse(false, error, null));
      //         }

      //         if (!result.secure_url) {
      //           return res
      //             .status(404)
      //             .json(
      //               jsonResponse(
      //                 false,
      //                 "Something went wrong while uploading image. Try again",
      //                 null
      //               )
      //             );
      //         }

      //         //update banner
      //         const banner = await prisma.banner.update({
      //           where: { id: req.params.id },
      //           data: {
      //             title,
      //             subtitle,
      //             isActive: isActive === "true" ? true : false,
      //             image: result.secure_url,
      //             // slug: name ? `${slugify(name)}` : findBrand.slug,
      //           },
      //         });

      //         //delete previous uploaded image
      //         await deleteFromCloudinary(
      //           findBanner.image,
      //           async (error, result) => {
      //             console.log("error", error);
      //             console.log("result", result);
      //           }
      //         );

      //         if (banner) {
      //           return res
      //             .status(200)
      //             .json(jsonResponse(true, `Banner has been updated`, banner));
      //         } else {
      //           return res
      //             .status(404)
      //             .json(jsonResponse(false, "Banner has not been updated", null));
      //         }
      //       }
      //     );

      //     // fs.unlinkSync(
      //     //   `public\\images\\${module_name}\\${findCategory.image.split("/")[2]}`
      //     // );
      //   }
      //   else {
      //if there is no image selected
      //update preorder
      const preorder = await prisma.preorder.update({
        where: { id: req.params.id },
        data: {
          userId,
          productId,
          //   isActive: isActive === "true" ? true : false,
          // image: findBanner.image,
          // slug: name ? `${slugify(name)}` : findBrand.slug,
        },
      });

      if (preorder) {
        return res
          .status(200)
          .json(jsonResponse(true, `Preorder has been updated`, preorder));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Preorder has not been updated", null));
      }
      //   }
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

//delete preorder
export const deletePreorder = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const preorder = await tx.preorder.delete({
        where: { id: req.params.id },
      });

      if (preorder) {
        // fs.unlinkSync(
        //   `public\\images\\${module_name}\\${category.image.split("/")[2]}`
        // );
        // await deleteFromCloudinary(banner.image, async (error, result) => {
        //   console.log("error", error);
        //   console.log("result", result);
        // });

        return res
          .status(200)
          .json(jsonResponse(true, `Preorder has been deleted`, preorder));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Preorder has not been deleted", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//For Customer

//get all preorders for customer
export const getPreordersForCustomer = async (req, res) => {
  try {
    const preorders = await prisma.preorder.findMany({
      //   where: {
      //     isActive: true,
      //     AND: [
      //       {
      //         code: {
      //           contains: req.query.code,
      //           mode: "insensitive",
      //         },
      //       },
      //     ],
      //   },
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

    if (preorders.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No preorder is available", null));

    if (preorders) {
      return res
        .status(200)
        .json(
          jsonResponse(true, `${preorders.length} preorders found`, preorders)
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

//get single preorder for customer
export const getPreorderForCustomer = async (req, res) => {
  try {
    const preorder = await prisma.preorder.findFirst({
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

    if (preorder) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 preorder found`, preorder));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No preorder is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
