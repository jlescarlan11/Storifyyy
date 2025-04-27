// config/passport-config.ts
import type { PassportStatic } from "passport";
// import type { AuthenticateOptions } from "passport-local";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import query from "../db/queries";

export default function initializePassport(passport: PassportStatic): void {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email: string, password: string, done) => {
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

  passport.serializeUser((user, done) => done(null, (user as any).user_id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await query.user.getById(id);
      if (!user) return done(null, false);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
