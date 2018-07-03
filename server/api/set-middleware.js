'use strict';

const bodyParser = require('body-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const RedisStore = require('connect-redis')(session);

const passport = require('passport');
const LocalAPIKeyStrategy = require('passport-localapikey').Strategy;

const User = require('./models').User;
const { loggingRequestMiddleware, loggingErrorMiddleware } = require('./helpers/log');

passport.use(new LocalAPIKeyStrategy(
  (apiKey, done) => {
    done();
  }
));

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = function (app) {
  // set views. This will allow us to render without absolute paths
  app.set('views', `${__dirname}/private`);
  app.set('view engine', 'ejs');

  loggingRequestMiddleware(app);
  loggingErrorMiddleware(app);

  app.use(function (req, res, next) {
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
      // FYI this should work for local development as well
      return res.redirect(`https://${req.get('host')}${req.url}`);
    }

    return next();
  });

  if (!process.env.NODE_ENV && process.env.CLIENT_HOSTPORT) {
    // Allow development server to make cross origin request.
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type');

      next();
    });
  }

  let sessionStore;

  if (process.env.REDIS_URI) {
    sessionStore = new RedisStore({
      url: process.env.REDIS_URI,
    });
  } else {
    sessionStore = new FileStore();
  }

  app.use(session({
    store: sessionStore,
    secret: 'DHlS8IiQh4364Ped7JdVhcJe1rCeMn',
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 999999999,
    },
  }));

  app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb',
  }));

  // Most of our incoming requests are JSON hidden as urlencoded - extract JSON if possible
  app.use((req, res, next) => {
    if (typeof req.body === 'string') {
      req.body = JSON.parse(req.body);
    } else if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      if (req.body && typeof req.body.formJson === 'string') {
        req.body = JSON.parse(req.body.formJson);
      } else {
        const onlyKey = Object.keys(req.body)[0];
        req.body = JSON.parse(onlyKey);
      }
    }
    next();
  });

  app.use(bodyParser.json({ limit: '50mb' }));

  app.use(passport.initialize());
  app.use(passport.session());
};
