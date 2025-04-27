import type { RequestHandler } from "express";

export const index: RequestHandler = (req, res) => {
  res.render("index");
};

export const signUpGet: RequestHandler = (req, res) => {
  res.render("signUpForm");
};
