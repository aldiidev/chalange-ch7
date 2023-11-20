require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const Sentry = require('@sentry/node');
const { PORT, SENTRY_DSN, RAILWAY_ENVIRONMENT_NAME } = process.env;

// SENTRY INIT
Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  environment: RAILWAY_ENVIRONMENT_NAME,
});

//midleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// SENTRY MIDLEWARE
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

//routes
app.get('/', (req, res) => {
  res.redirect('/api/v1/user/login');
});
const user = require('./routes/auth.routes');
app.use('/api/v1/user', user);

// SENTRY ERR HANDLER
// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

//500
// app.use((err, req, res, next) => {
//   res.status(500).json({
//     status: false,
//     message: 'internal server error',
//     err: err.message,
//     data: null
//   });
// });

app.listen(PORT, () => console.log('app running on port : ', PORT));
