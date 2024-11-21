const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const dotenv = require('dotenv');

// make sure the config is loaded
dotenv.config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.colorize(), 
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf((info) => {
      return `${info.timestamp} - ${info.level}: ${info.message}`;
    }),
  ),
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      level: process.env.LOG_LEVEL,
    }),
    new DailyRotateFile({
      filename: './logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      handleExceptions: true,
      level: process.env.LOG_LEVEL,
    }),
    new DailyRotateFile({
      filename: './logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      handleExceptions: true,
      level: 'error',
    }),
  ],
});

module.exports = logger;