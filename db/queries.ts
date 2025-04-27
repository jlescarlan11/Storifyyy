import { get } from "http";
import { PrismaClient } from "../generated/prisma";

import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const query = {
  user: {
    getAll: async () => {
      return await prisma.user.findMany();
    },
    getByEmail: async (email: string) => {
      return await prisma.user.findUnique({
        where: { email },
      });
    },
    getById: async (id: string) => {
      return await prisma.user.findUnique({
        where: { id },
      });
    },
  },
};

export default query;
