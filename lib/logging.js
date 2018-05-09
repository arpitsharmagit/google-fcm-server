'use strict';

// [START logging_winston_quickstart]
const winston = require('winston');
const Logger = winston.Logger;
const Console = winston.transports.Console;

const colorize = process.env.NODE_ENV !== 'production';

// Imports the Google Cloud client library for Winston
const LoggingWinston = require('@google-cloud/logging-winston').LoggingWinston;

// Creates a Winston Stackdriver Logging client
const loggingWinston = new LoggingWinston();

// Create a Winston logger that streams to Stackdriver Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
const logger = new Logger({
  level: 'info', // log at 'info' and above
  transports: [
    // Log to the console
    new Console({
      json: true,
      colorize: colorize
    }),
    // And log to Stackdriver Logging  
    loggingWinston  
  ],
});

// Writes some log entries

module.exports = {
  error: winston.error,
  warn: winston.warn,
  info: winston.info,
  log: winston.log,
  verbose: winston.verbose,
  debug: winston.debug,
  silly: winston.silly
};