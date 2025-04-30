const query = require("../schema/queries");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

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

exports.index = async (req, res) => {
  console.log(req.user);
  if (req.user) {
    return res.render("index");
  }
  res.redirect("/login");
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

      query.user.createUser({ firstName, lastName, email, hashedPassword });

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
