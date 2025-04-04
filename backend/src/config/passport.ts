import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user';
import { Vendor } from '../models/vendor';
import { Couple } from '../models/couple';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Sprawdź, czy użytkownik istnieje na podstawie googleId lub email
        let user = await User.findOne({
          where: { googleId: profile.id },
        });

        if (!user) {
          user = await User.findOne({
            where: { email: profile.emails![0].value },
          });
        }

        if (!user) {
          // Jeśli użytkownik nie istnieje, zwróć profil do dalszej obsługi w trasie
          return done(null, { profile, accessToken, refreshToken });
        }

        // Jeśli użytkownik istnieje, zwróć go
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serializacja użytkownika do sesji
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserializacja użytkownika z sesji
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;