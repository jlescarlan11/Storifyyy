import type { RequestHandler } from "express";

export const index: RequestHandler = (req, res) => {
  res.render("index");
};
