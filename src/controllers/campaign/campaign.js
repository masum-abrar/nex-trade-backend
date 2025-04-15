import jsonResponse from "../../utils/jsonResponse.js";
import prisma from "../../utils/prismaClient.js";
import slugify from "../../utils/slugify.js";
import { filterByMonth } from "../../utils/filter.js";
import { defaultLimit, defaultPage } from "../../utils/defaultData.js";
import fs from "fs";
// import uploadImage from "../../utils/uploadImage.js";
import uploadToCLoudinary from "../../utils/uploadToCloudinary.js";
import deleteFromCloudinary from "../../utils/deleteFromCloudinary.js";
import validateInput from "../../utils/validateInput.js";

const module_name = "campaign";

//create campaign
export const createCampaign = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { userId, name, categoryId } = req.body;

      //validate input
      const inputValidation = validateInput([name], ["Name"]);

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      //get user name for slugify
      const user = await tx.user.findFirst({
        where: { id: userId },
      });

      if (!user)
        return res
          .status(404)
          .json(jsonResponse(false, "This user does not exist", null));

      //check if campaign exists
      const campaign = await tx.campaign.findFirst({
        where: {
          userId: req.user.parentId ? req.user.parentId : req.user.id,
          name: name,
          isDeleted: false,
        },
      });

      if (
        campaign &&
        campaign.slug === `${slugify(user.name)}-${slugify(name)}`
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
        //create campaign
        const newCampaign = await prisma.campaign.create({
          data: {
            userId: req.user.parentId ? req.user.parentId : req.user.id,
            name,
            date: new Date(Date.now()).toISOString(),
            categoryId,
            slug: `${slugify(user.name)}-${slugify(name)}`,
            createdBy: req.user.id,
          },
        });

        if (newCampaign) {
          return res
            .status(200)
            .json(jsonResponse(true, "Campaign has been created", newCampaign));
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

        //create campaign
        const newCampaign = await prisma.campaign.create({
          data: {
            userId: req.user.parentId ? req.user.parentId : req.user.id,
            name,
            image: result.secure_url,
            date: new Date(Date.now()).toISOString(),
            categoryId,
            slug: `${slugify(user.name)}-${slugify(name)}`,
            createdBy: req.user.id,
          },
        });

        if (newCampaign) {
          return res
            .status(200)
            .json(jsonResponse(true, "Campaign has been created", newCampaign));
        }
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//get all campaigns
export const getCampaigns = async (req, res) => {
  if (req.user.roleName !== "super-admin") {
    getCampaignsByUser(req, res);
  } else {
    const month = req.query.month;
    try {
      let monthlyCampaign;

      monthlyCampaign = await prisma.campaign.findMany({
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

        include: { category: true, user: true },
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
        monthlyCampaign = filterByMonth([], monthlyCampaign, month);
      }

      if (monthlyCampaign.length === 0)
        return res
          .status(200)
          .json(jsonResponse(true, "No campaign is available", null));

      if (monthlyCampaign) {
        return res
          .status(200)
          .json(
            jsonResponse(
              true,
              `${monthlyCampaign.length} campaigns found`,
              monthlyCampaign
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

//get all campaigns by user
export const getCampaignsByUser = async (req, res) => {
  const month = req.query.month;
  try {
    let monthlyCampaign;

    monthlyCampaign = await prisma.campaign.findMany({
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
      include: { category: true, user: true },
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

    //filter month wise campaign
    if (month) {
      monthlyCampaign = filterByMonth([], monthlyCampaign, month);
    }

    if (monthlyCampaign.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No campaign is available", null));

    if (monthlyCampaign) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${monthlyCampaign.length} campaigns found`,
            monthlyCampaign
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

//get single campaign
export const getCampaign = async (req, res) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: { slug: req.params.slug, isDeleted: false },
    });

    if (campaign) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 campaign found`, campaign));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No campaign is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//update campaign
export const updateCampaign = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const { userId, name, categoryId, viewCount } = req.body;

      //validate input
      const inputValidation = validateInput([name], ["Name"]);

      if (inputValidation) {
        return res.status(400).json(jsonResponse(false, inputValidation, null));
      }

      //get user id from campaign and user name from user for slugify
      const findCampaign = await tx.campaign.findFirst({
        where: { id: req.params.id },
      });

      if (!findCampaign)
        return res
          .status(404)
          .json(jsonResponse(false, "This campaign does not exist", null));

      const user = await tx.user.findFirst({
        where: { id: findCampaign.userId },
      });

      if (!user)
        return res
          .status(404)
          .json(jsonResponse(false, "This user does not exist", null));

      //check if slug already exists
      if (name) {
        if (name !== findCampaign.name) {
          const existingCampaign = await tx.campaign.findFirst({
            where: {
              userId: req.user.parentId ? req.user.parentId : req.user.id,
              name: name,
              isDeleted: false,
            },
          });

          if (
            existingCampaign &&
            existingCampaign.slug === `${slugify(user.name)}-${slugify(name)}`
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

            //update campaign
            const campaign = await prisma.campaign.update({
              where: { id: req.params.id },
              data: {
                userId: req.user.parentId ? req.user.parentId : req.user.id,
                name,
                image: result.secure_url,
                date: findCampaign.date,
                categoryId,
                viewCount,
                updatedBy: req.user.id,
                slug: name
                  ? `${slugify(user.name)}-${slugify(name)}`
                  : findCampaign.slug,
              },
            });

            //delete previous uploaded image
            await deleteFromCloudinary(
              findCampaign.image,
              async (error, result) => {
                console.log("error", error);
                console.log("result", result);
              }
            );

            if (campaign) {
              return res
                .status(200)
                .json(
                  jsonResponse(true, `Campaign has been updated`, campaign)
                );
            } else {
              return res
                .status(404)
                .json(
                  jsonResponse(false, "Campaign has not been updated", null)
                );
            }
          }
        );

        // fs.unlinkSync(
        //   `public\\images\\${module_name}\\${findCampaign.image.split("/")[2]}`
        // );
      } else {
        //if there is no image selected
        //update campaign
        const campaign = await prisma.campaign.update({
          where: { id: req.params.id },
          data: {
            userId: req.user.parentId ? req.user.parentId : req.user.id,
            name,
            image: findCampaign.image,
            date: findCampaign.date,
            categoryId,
            viewCount,
            updatedBy: req.user.id,
            slug: name
              ? `${slugify(user.name)}-${slugify(name)}`
              : findCampaign.slug,
          },
        });

        if (campaign) {
          return res
            .status(200)
            .json(jsonResponse(true, `Campaign has been updated`, campaign));
        } else {
          return res
            .status(404)
            .json(jsonResponse(false, "Campaign has not been updated", null));
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//increase view count
export const increaseCampaignViewCount = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      //get user id from campaign and user name from user for increasing view count
      const findCampaign = await tx.campaign.findFirst({
        where: { id: req.params.id, isActive: true, isDeleted: false },
      });

      if (!findCampaign)
        return res
          .status(404)
          .json(jsonResponse(false, "This campaign does not exist", null));

      const user = await tx.user.findFirst({
        where: { id: findCampaign.userId, isActive: true, isDeleted: false },
      });

      if (!user)
        return res
          .status(404)
          .json(jsonResponse(false, "This user does not exist", null));

      //increase view count
      const campaign = await tx.campaign.update({
        where: { id: req.params.id, isActive: true, isDeleted: false },
        data: {
          viewCount: findCampaign.viewCount + 1,
        },
      });

      if (campaign) {
        return res
          .status(200)
          .json(
            jsonResponse(
              true,
              `A user has viewed your ${findCampaign.name} campaign`,
              campaign
            )
          );
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Something went wrong!", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//ban campaign
export const banCampaign = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      //ban campaign
      const getCampaign = await tx.campaign.findFirst({
        where: { id: req.params.id },
      });

      const campaign = await tx.campaign.update({
        where: { id: req.params.id },
        data: {
          isActive: getCampaign.isActive === true ? false : true,
        },
      });

      if (campaign) {
        return res
          .status(200)
          .json(jsonResponse(true, `Campaign has been banned`, campaign));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Campaign has not been banned", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

//delete campaign
export const deleteCampaign = async (req, res) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const campaign = await tx.campaign.update({
        where: { id: req.params.id },
        data: { deletedBy: req.user.id, isDeleted: true },
      });

      if (campaign) {
        // fs.unlinkSync(
        //   `public\\images\\${module_name}\\${campaign.image.split("/")[2]}`
        // );
        await deleteFromCloudinary(campaign.image, async (error, result) => {
          console.log("error", error);
          console.log("result", result);
        });

        return res
          .status(200)
          .json(jsonResponse(true, `Campaign has been deleted`, campaign));
      } else {
        return res
          .status(404)
          .json(jsonResponse(false, "Campaign has not been deleted", null));
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};

// For Customer

//get all campaigns for customer
export const getCampaignsForCustomer = async (req, res) => {
  const month = req.query.month;
  try {
    let monthlyCampaign;

    monthlyCampaign = await prisma.campaign.findMany({
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

    if (monthlyCampaign.length === 0)
      return res
        .status(200)
        .json(jsonResponse(true, "No campaign is available", null));

    if (monthlyCampaign) {
      return res
        .status(200)
        .json(
          jsonResponse(
            true,
            `${monthlyCampaign.length} campaigns found`,
            monthlyCampaign
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

//get single campaign for customer
export const getCampaignForCustomer = async (req, res) => {
  try {
    const campaign = await prisma.campaign.findFirst({
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
      },
    });

    if (campaign) {
      return res
        .status(200)
        .json(jsonResponse(true, `1 campaign found`, campaign));
    } else {
      return res
        .status(404)
        .json(jsonResponse(false, "No campaign is available", null));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(jsonResponse(false, error, null));
  }
};
