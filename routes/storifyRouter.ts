import { Router } from "express";
const storifyRouter = Router();
const storifyController = require("../controllers/storifyController");

storifyRouter.get("/", storifyController.index);
storifyRouter.get("/signup", storifyController.signUpGet);

export default storifyRouter;
