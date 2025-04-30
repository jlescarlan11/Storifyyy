const { Router } = require("express");
const storifyRouter = Router();
const storifyController = require("../controllers/storifyController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

storifyRouter.get("/", storifyController.index);
storifyRouter.get("/signup", storifyController.signUpGet);
storifyRouter.post("/signup", storifyController.signUpPost);
storifyRouter.get("/login", storifyController.logInGet);
storifyRouter.post("/login", storifyController.logInPost);
storifyRouter.get("/logout", storifyController.logOutGet);
storifyRouter.get("/password-reset", storifyController.passwordResetRequestGet);
storifyRouter.post(
  "/password-reset",
  storifyController.passwordResetRequestPost
);
storifyRouter.get(
  "/password-reset/:id",
  storifyController.passwordResetConfirmGet
);
storifyRouter.post(
  "/password-reset/:id",
  storifyController.passwordResetConfirmPost
);
storifyRouter.post(
  "/",
  upload.single("uploaded_file"),
  storifyController.uploadFilePost
);

module.exports = storifyRouter;
