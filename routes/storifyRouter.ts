import { Router } from "express";
const storifyRouter = Router();
const storifyController = require("../controllers/storifyController");

storifyRouter.get("/", storifyController.index);
storifyRouter.get("/signup", storifyController.signUpGet);
storifyRouter.post("/signup", storifyController.signUpPost);

export default storifyRouter;
