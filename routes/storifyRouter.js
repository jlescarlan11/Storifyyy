const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { Router } = require("express");
const storifyRouter = Router();
const storifyController = require("../controllers/storifyController");

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

storifyRouter.get("/folders", storifyController.folderGetAll);
storifyRouter.get("/folders/create", (req, res) =>
  res.render("folders/create")
);
storifyRouter.post("/folders/create", storifyController.folderCreate);
storifyRouter.get("/folders/:id", storifyController.folderGetSingle);
storifyRouter.post(
  "/folders/:id",
  upload.single("uploaded_file"),
  storifyController.uploadFilePost
);
storifyRouter.get("/folders/:id/edit", storifyController.folderEditGet);
storifyRouter.post("/folders/:id/edit", storifyController.folderEditPost);
storifyRouter.post("/folders/:id/delete", storifyController.folderDelete);
storifyRouter.get("/folders/:id/:fileId", storifyController.fileGet);
storifyRouter.get(
  "/folders/:id/:fileId/download",
  storifyController.fileDownload
);

module.exports = storifyRouter;
// Add this with other file routes
storifyRouter.post(
  "/folders/:folderId/:fileId/delete",
  storifyController.fileDelete
);
