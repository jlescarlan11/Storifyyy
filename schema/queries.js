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
  folder: {
    getAll: async () => await prisma.folder.findMany(),

    getById: async (id) =>
      await prisma.folder.findUnique({
        where: { id },
      }),

    getByUserId: async (userId) =>
      await prisma.folder.findMany({
        where: { userId },
      }),

    create: async ({ name, userId }) =>
      await prisma.folder.create({
        data: {
          name: name,
          userId: userId,
        },
      }),

    update: async (id, { name }) =>
      await prisma.folder.update({
        where: { id },
        data: { name },
      }),

    delete: async (id) =>
      await prisma.folder.delete({
        where: { id },
      }),

    // Optional: Get folders with their files
    getWithFiles: async (id) =>
      await prisma.folder.findUnique({
        where: { id },
        include: { File: true },
      }),
  },
  file: {
    getById: async (fileId) => {
      await prisma.file.findFirst({
        where: { id: fileId, folderId },
      });
    },
    createFile: async ({ name, path, size, type, folderId, userId }) => {
      await prisma.file.create({
        data: {
          name: name,
          path: path,
          size: size,
          type: type,
          folderId: folderId,
          userId: userId,
        },
      });
    },
  },
};
