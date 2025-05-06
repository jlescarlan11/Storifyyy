const query = require("../schema/queries");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const axios = require("axios"); // Install with: npm install axios

const signUpValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 4, max: 55 })
    .withMessage("First name must be between 4-50 characters")
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
    .withMessage(
      "First name can only contain letters, accents, spaces, apostrophes, and hyphens"
    ),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 55 })
    .withMessage("Last name must be between 2-55 characters")
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
    .withMessage(
      "Last name can only contain letters, accents, spaces, apostrophes, and hyphens"
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .custom(async (value) => {
      const existing = await query.user.getByEmail(value);
      if (existing) {
        // reject if email already in the database
        throw new Error("E-mail is already registered");
      }
      // returning true signals the field passed this check
      return true;
    }),
  ,
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

const PasswordResetValidation = [
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

const logInValidate = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email, { req }) => {
      const user = await query.user.getByEmail(email);
      if (!user) {
        throw new Error("Invalid email");
      }

      console.log(req.body.password);

      console.log(user.password);

      const isPasswordCorrect = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!isPasswordCorrect) {
        throw new Error("Invalid  password");
      }

      // Attach user to request for passport or further processing if needed
      req.userFromValidation = user;

      return true;
    }),

  body("password").notEmpty().withMessage("Password is required"),
];

exports.index = async (req, res, next) => {
  try {
    if (req.user) {
      const folders = await query.folder.getQuickAccess(req.user.id);
      const files = await query.file.getAll(req.user.id);
      console.log(files);
      return res.render("index", { folders, files });
    }
    res.redirect("/login");
  } catch (err) {
    next(err);
  }
};

exports.signUpGet = (req, res) => {
  res.render("signUp");
};

exports.signUpPost = [
  signUpValidation,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("signUp", {
        errors: errors.array(),
        repopulate: req.body,
      });
    }

    try {
      const { firstName, lastName, email, password } = req.body;
      console.log(req.body);

      const hashedPassword = await bcrypt.hash(password, 10);

      await query.user.createUser({
        firstName,
        lastName,
        email,
        hashedPassword,
      });

      res.redirect("/");
    } catch (err) {
      next(err);
    }
  },
];

exports.logInGet = (req, res) => {
  const raw = req.session.messages || [];
  const errors = raw.map((msg) => ({ msg }));
  // clear messages immediately
  req.session.messages = [];

  // Only include the errors array when there's exactly one error
  if (errors.length === 1) {
    res.render("logIn", { errors });
  } else {
    // either zero errors or multiple; render without the errors key
    res.render("logIn");
  }
};

// exports.logInPost = [
//   // step A: run express-validator
//   logInValidate,

//   // step B: process results & then invoke passport.authenticate
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       // re-render login form with validation errors
//       return res.render("logIn", { errors: errors.array() });
//     }

//     // now that validation passed, hand off to Passport
//     passport.authenticate("local", (err, user, info) => {
//       if (err) return next(err);
//       if (!user) {
//         // authentication failed (shouldn’t usually happen since we pre-checked,
//         // but just in case, show the message)
//         return res.render("logIn", {
//           errors: [{ msg: info.message || "Login failed" }],
//         });
//       }

//       // log the user in
//       req.logIn(user, (err) => {
//         if (err) return next(err);
//         return res.redirect("/");
//       });
//     })(req, res, next);
//   },
// ];

exports.logInPost = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureMessage: "Incorrect email or password",
});

exports.logOutGet = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

exports.passwordResetRequestGet = (req, res, next) => {
  if (req.user) {
    return res.render("index");
  }
  res.render("passwordResetRequest");
};

exports.passwordResetRequestPost = async (req, res, next) => {
  try {
    const user = await query.user.getByEmail(req.body.email.trim());
    if (!user) {
      return res.render("passwordResetRequest", {
        errors: [{ msg: "Email does not exist." }],
      });
    }
    res.redirect(`/password-reset/${user.id}`);
  } catch (err) {
    next(err);
  }
};

exports.passwordResetConfirmGet = (req, res, next) => {
  if (req.user) {
    return res.render("index");
  }
  res.render("passwordResetConfirm", { id: req.params.id });
};

exports.passwordResetConfirmPost = [
  PasswordResetValidation,
  async (req, res, next) => {
    const errors = validationResult(req);
    const { id } = req.params;
    const { password } = req.body;
    if (!errors.isEmpty()) {
      return res.render("PasswordResetConfirm", {
        errors: errors.array(),
        id: req.params.id,
      });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      query.user.updatePassword({ id, hashedPassword });

      res.redirect("/");
    } catch (err) {
      next(err);
    }
  },
];

exports.uploadToCloudinary = (buffer, folder = "") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", // Add this line to handle PDFs correctly
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

exports.uploadFilePost = async (req, res, next) => {
  try {
    const folderId = req.params.id;
    const result = await this.uploadToCloudinary(
      req.file.buffer,
      `folders/${folderId}`
    );

    const file = await query.file.createFile({
      name: req.file.originalname,
      path: result.secure_url,
      size: req.file.size,
      type: req.file.mimetype,
      folderId,
      userId: req.user.id,
    });

    res.redirect(`/folders/${folderId}`);
  } catch (err) {
    next(err);
  }
};

exports.folderGetAll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const folders = await query.folder.getByUserId(userId);
    res.render("folders", { folders });
  } catch (err) {
    next(err);
  }
};

exports.folderGetSingle = async (req, res, next) => {
  try {
    const folder = await query.folder.getById(req.params.id);

    res.render("folders/id", { folder, files: folder.File });
  } catch (err) {
    next(err);
  }
};

exports.folderCreate = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const newFolder = await query.folder.create({
      name,
      userId,
    });
    console.log(newFolder.id);

    res.redirect(`/folders/${newFolder.id}`);
  } catch (err) {
    next(err);
  }
};

exports.folderEditGet = async (req, res, next) => {
  try {
    const folderId = req.params.id;

    const folder = await query.folder.getById(folderId);
    res.render("folders/id/edit", { folder });
  } catch (err) {
    next(err);
  }
};

exports.folderEditPost = async (req, res, next) => {
  try {
    const { name } = req.body;
    const folderId = req.params.id;

    const updatedFolder = await query.folder.update(folderId, { name });
    res.redirect(`/folders/${updatedFolder.id}`);
  } catch (err) {
    next(err);
  }
};

exports.folderDelete = async (req, res, next) => {
  try {
    const folderId = req.params.id;

    await query.folder.delete(folderId);
    res.redirect("/folders");
  } catch (err) {
    next(err);
  }
};

exports.fileGet = async (req, res, next) => {
  try {
    const folder = await query.folder.getById(req.params.id);
    const file = await query.file.getById(req.params.fileId, req.params.id);
    console.log(file);
    res.render("folders/id/fileId", { folder, file });
  } catch (err) {
    next(err);
  }
};

exports.fileDownload = async (req, res, next) => {
  try {
    const file = await query.file.getById(
      req.params.fileId,
      req.params.id // folderId
    );

    if (!file) {
      return res.status(404).render("error", {
        message: "File not found in this folder",
      });
    }

    // Fetch the file from Cloudinary as a stream
    const response = await axios.get(file.path, {
      responseType: "stream",
    });

    // Set download headers
    res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader("Content-Length", response.headers["content-length"]);

    // Stream the file to the client
    response.data.pipe(res);
  } catch (err) {
    next(err);
  }
};

exports.fileDelete = async (req, res, next) => {
  try {
    const { folderId, fileId } = req.params;

    // Verify file exists in this folder
    const file = await query.file.getById(fileId, folderId);
    if (!file) {
      return res.status(404).render("error", {
        message: "File not found in this folder",
      });
    }

    // Delete from Cloudinary
    const publicId = file.path
      .split("/upload/")[1]
      .split("/")
      .slice(1)
      .join("/")
      .replace(/\..+$/, "");

    await cloudinary.uploader.destroy(publicId);

    // Delete from database
    await query.file.delete(fileId);

    res.redirect(`/folders/${folderId}`);
  } catch (err) {
    next(err);
  }
};

exports.shareGet = async (req, res) => {
  // console.log("hello");
  try {
    console.log("hello");
    res.render("share-form", { folderId: req.params.id });
  } catch (err) {
    next(err);
  }
};

exports.sharePost = async (req, res) => {
  try {
    const { duration } = req.body;
    const folderId = req.params.id;
    const userId = req.user.id;

    // Generate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(duration));

    // Generate unique token
    const token = require("crypto").randomBytes(16).toString("hex");

    // Save to database
    await query.sharedFolder.create({
      folderId,
      userId,
      expiresAt,
      token,
    });

    // Generate shareable link
    const shareLink = `${req.headers.host}/share/${token}`;
    const sharedEntry = await query.sharedFolder.getByToken(token);

    res.render("share-link", {
      shareLink,
      shared: sharedEntry, // Pass the shared folder data
    });
  } catch (err) {
    next(err);
  }
};

exports.shareView = async (req, res) => {
  try {
    const shared = await query.sharedFolder.getByToken(req.params.token);

    if (!shared || shared.expiresAt < new Date()) {
      return res.status(404).render("error", {
        message: "Link expired or invalid",
      });
    }

    res.render("shared-folder", {
      folder: shared.Folder,
      files: shared.Folder.File,
    });
  } catch (err) {
    next(err);
  }
};

// // Optional: Get folder with files
// exports.folderGetWithFiles = async (req, res, next) => {
//   try {
//     const folder = await query.folder.getWithFiles(req.params.id);

//     if (!folder || folder.userId !== req.user.id) {
//       return res.status(404).render("error", {
//         message: "Folder not found",
//       });
//     }

//     res.render("folders/detail", { folder });
//   } catch (err) {
//     next(err);
//   }
// };
