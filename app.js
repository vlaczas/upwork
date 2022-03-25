const compression = require('compression');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./utils/error');
const startCron = require('./config/cron');
const Bugsnag = require('@bugsnag/js');
const BugsnagPluginExpress = require('@bugsnag/plugin-express');

Bugsnag.start({
  apiKey: process.env.BUGSNAG, plugins: [ BugsnagPluginExpress ],
});

const app = express();
app.set('trust proxy', true);
app.use(express.static('public'));
const middleware = Bugsnag.getPlugin('express');
app.use(middleware.requestHandler);
// basic setup
app.use(express.json());
app.use(logger('dev'));
app.use(helmet());
app.use(compression());
app.use(hpp());
app.use(mongoSanitize());
app.use(cors({
  origin: [ 'http://localhost:3000' ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  credentials: true,
  optionsSuccessStatus: 200,
}));

startCron();

// routes setup
const indexRouter = require('./routes');

app.use('/api/v1', indexRouter);

/**
 * ! Handle error
 */
// catch 404 and forward to error handlerE
app.use(middleware.errorHandler);
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.statusCode = 404;
  next(err);
});

app.use(errorHandler);

module.exports = app;
