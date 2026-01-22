const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const dotenv = require('dotenv');

// make sure the config is loaded
dotenv.config();

// formats used to print log messages
const colorFormat = winston.format.combine(
    winston.format.colorize(), 
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf((info) => {
      return `${info.timestamp} - ${info.level}: ${info.message}`;
    }),
  );

const fileFormat = winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf((info) => {
      return `${info.timestamp} - ${info.level}: ${info.message}`;
    })
  );

// transports where to ouput log messages into files and/or console
const transports = [];

const logDir = process.env.LOG_DIR;

const combinedTransort = new DailyRotateFile({
      filename: `${logDir}/kdolist-server-combined-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      handleExceptions: true,
      level: process.env.LOG_LEVEL,
      format: fileFormat,
    });

const exceptionTransport = new DailyRotateFile({
      filename: `${logDir}/kdolist-server-exceptions-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      handleExceptions: true,
      level: 'error',
      format: fileFormat,
    });

transports.push(combinedTransort);
transports.push(exceptionTransport);

// there is an option to disable log in the console
if (process.env.LOG_CONSOLE_DISABLED !== 'true') {
  const consoleTransport = new winston.transports.Console({      
      handleExceptions: true,
      level: process.env.LOG_LEVEL,
      format: colorFormat,
    });

    transports.push(consoleTransport);
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  transports: transports,
});

module.exports = logger;