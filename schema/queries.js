const bcrypt = require("bcryptjs"); // bcrypt.js exports via module.exports :contentReference[oaicite:0]{index=0}
const { PrismaClient } = require("../generated/prisma"); // destructure PrismaClient from the generated client :contentReference[oaicite:1]{index=1}
const prisma = new PrismaClient();

module.exports = {
  user: {
    getAll: async () => await prisma.user.findMany(),
    getById: async (id) => await prisma.user.findUnique({ where: { id } }),
    getByEmail: async (email) =>
      await prisma.user.findUnique({ where: { email } }),
    createUser: async ({ firstName, lastName, email, hashedPassword }) => {
      await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
        },
      });
    },
    updatePassword: async ({ id, hashedPassword }) => {
      await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          password: hashedPassword,
        },
      });
    },
  },
};
