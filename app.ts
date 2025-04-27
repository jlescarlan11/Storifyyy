import type { RequestHandler } from "express";
import initializePassport from "./config/passport-config";
import path from "node:path";
import express from "express";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "./generated/prisma/client";
import passport from "passport";
import storifyRouter from "./routes/storifyRouter";
require("dotenv").config();

const app = express();

// for styling
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

// for views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: process.env.SESSION_SECRET!,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

initializePassport(passport);

app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

// to localize the saved user.
const attachUser: RequestHandler = (req, res, next) => {
  res.locals.user = req.user;
  next();
};
app.use(attachUser);

app.use("/", storifyRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port http://localhost:${PORT}`);
});
