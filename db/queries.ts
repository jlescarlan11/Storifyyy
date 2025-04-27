import { PrismaClient } from "../generated/prisma/client";
const prisma = new PrismaClient();

const query = {
  user: {
    getAll: async () => await prisma.user.findMany(),
    getById: async (id: string) =>
      await prisma.user.findUnique({ where: { id: id } }),
    getByEmail: async (email: string) =>
      await prisma.user.findUnique({ where: { email } }),
  },
};

export default query;
