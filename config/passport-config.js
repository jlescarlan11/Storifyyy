const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const query = require("../schema/queries");

module.exports = function initializePassport(passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await query.user.getByEmail(email);
          if (!user) return done(null, false, { message: "Incorrect email" });
          const match = await bcrypt.compare(password, user.password);
          if (!match)
            return done(null, false, { message: "Incorrect password" });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await query.user.getById(id);
      if (!user) return done(null, false);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
