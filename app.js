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


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// SENTRY MIDLEWARE
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// config websocket
const server = require('http').createServer(app);
const io = require('socket.io')(server);

//routes
app.get('/', (req, res) => {
  res.redirect('/api/v1/user/login');
});

app.get('/notif', (req, res) => {
  let { user_id } = req.query;
  let db = require('./db.json');
  let notifications = db.notifications;
  if (user_id) {
    notifications = notifications.filter((i) => i.user_id == user_id);
  }

  res.render('notification', { notifications, user_id });
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

server.listen(PORT, () => console.log('app running on port : ', PORT));
