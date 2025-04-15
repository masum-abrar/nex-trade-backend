import prisma from "./prismaClient";

const prismaTransaction = (...queries) => {
  return prisma.$transaction(...queries);
};

export default prismaTransaction;
