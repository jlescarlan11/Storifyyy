const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const query = require("../schema/queries");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          // 1. Fetch user
          const user = await query.user.getByEmail(email.toLocaleLowerCase());

          if (!user) {
            return done(null, false, { message: "Incorrect email" });
          }
          // 3. Now it’s safe to compare passwords
          const match = await bcrypt.compare(password, user.password);
          if (!match) {
            return done(null, false, { message: "Incorrect password" });
          }

          // 4. Success
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Serialization/deserialization
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
