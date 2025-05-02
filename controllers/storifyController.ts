import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();

export const index: RequestHandler = async (req, res) => {
  const users = await prisma.user.findMany();
  console.log(users);
  res.render("index");
};

export const signUpGet: RequestHandler = (req, res) => {
  res.render("signUpForm");
};

export const signUpPost: RequestHandler = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    console.log(req.body);

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashed,
      },
    });

    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
};
