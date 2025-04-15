import jwt from "jsonwebtoken";
import arrayEquals from "./arrayEquals.js";
import jsonResponse from "./jsonResponse.js";
import prisma from "./prismaClient.js";

const verify = (req, res, next) => {
  const cookiesToken = req.cookies.accessToken;
  const authHeader = req.headers.token;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err)
          res
            .status(403)
            .json(jsonResponse(false, "Token is not valid!", null));
        req.user = user;

        const activeUser = await prisma.user.findFirst({
          where: { id: req.user.id, isDeleted: false },
        });

        if (!activeUser) {
          return res
            .clearCookie("accessToken", {
              secure: true,
              sameSite: "none",
            })
            .status(401)
            .json(
              jsonResponse(
                false,
                "You are not authenticated. Please login again",
                null
              )
            );
        }

        //logout if changes in 'role' and 'parentId' occurs
        console.log(activeUser.roleId);
        if (activeUser.roleId !== null) {
          if (
            activeUser.roleId !== req.user.roleId || activeUser.parentId
              ? activeUser.parentId !== req.user.parentId
              : false
          ) {
            return res
              .clearCookie("accessToken", {
                secure: true,
                sameSite: "none",
              })
              .status(401)
              .json(jsonResponse(false, "Please log in again!", null));
          }
        }

        //logout if changes in `user module access` occurs
        const roleModuleList = await prisma.roleModule.findMany({
          where: { roleId: activeUser.roleId ?? undefined, isDeleted: false },
          include: { module: true },
        });

        console.log({ roleModuleList });

        const roleModuleList_length = roleModuleList.length;

        const module_names = [];

        if (activeUser.roleId !== null) {
          for (let i = 0; i < roleModuleList_length; i++) {
            module_names.push(roleModuleList[i].module.name);
          }

          if (!arrayEquals(req.user.moduleNames, module_names)) {
            return res
              .clearCookie("accessToken", {
                secure: true,
                sameSite: "none",
              })
              .status(401)
              .json(jsonResponse(false, "Please log in again!", null));
          }
        }

        //check if user is active or banned

        if (!activeUser.isActive) {
          return res
            .clearCookie("accessToken", {
              secure: true,
              sameSite: "none",
            })
            .status(401)
            .json(
              jsonResponse(false, "You are no longer authenticated user!", null)
            );
        }

        //check if user has module access
        if (res.locals.module_name) {
          if (
            req.user &&
            req.user.moduleNames.includes(res.locals.module_name) === false
          )
            return res.status(409).json({
              success: false,
              message: "You do not have permission to access this module",
              data: null,
            });
        }

        next();
      });
    } else {
      return res
        .clearCookie("accessToken", {
          secure: true,
          sameSite: "none",
        })
        .status(401)
        .json(jsonResponse(false, "You are not authenticated!", null));
    }
  } else {
    return res
      .clearCookie("accessToken", {
        secure: true,
        sameSite: "none",
      })
      .status(401)
      .json(jsonResponse(false, "You are not authenticated!", null));
  }
};

export default verify;
