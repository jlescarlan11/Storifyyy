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
    getQuickAccess: async (userId) => {
      return await prisma.folder.findMany({
        where: { userId }, // only this user's folders
        take: 4,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { File: true }, // count the related File records
          },
        },
      });
    },

    getById: async (id) =>
      await prisma.folder.findUnique({
        where: { id },
        include: {
          File: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      }),

    getByUserId: async (userId) =>
      await prisma.folder.findMany({
        where: { userId },
        include: {
          _count: {
            select: { File: true }, // count the related File records
          },
        },
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
    getById: async (fileId, folderId) => {
      return await prisma.file.findFirst({
        where: { id: fileId, folderId },
      });
    },
    getAll: async (userId) => {
      return await prisma.file.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          User: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          Folder: {
            select: {
              id: true,
              name: true,
            },
          },
        },
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
    getFilesByFolderId: async (folderId) => {
      return await prisma.file.findMany({
        where: { folderId },
      });
    },

    delete: async (fileId) => {
      return await prisma.file.delete({
        where: { id: fileId },
      });
    },
  },
  sharedFolder: {
    create: async ({ folderId, userId, expiresAt, token }) =>
      await prisma.sharedFolder.create({
        data: { folderId, userId, expiresAt, token },
      }),
    getByToken: async (token) =>
      await prisma.sharedFolder.findUnique({
        where: { token },
        include: { Folder: { include: { File: true } } },
      }),
    deleteExpired: async () =>
      await prisma.sharedFolder.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      }),
  },
};
