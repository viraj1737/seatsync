const session = require('express-session');
const MongoStore = require('connect-mongo');

const configureSession = () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/seatsync';
  const sessionSecret = process.env.SESSION_SECRET || 'seatsync_development_secret_key_2026';

  return session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
      httpOnly: true, // Prevent client-side JS access to cookie (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'lax', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  });
};

module.exports = configureSession;
