const express = require('express');
const cors = require('cors');

// configure application with process env variables from .env file
require('dotenv').config();

const app = express();
const logger = require('./logger');

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' directory

// Set up express to use the logger
app.use((req, res, next) => {
    logger.http(`Request: ${req.method} ${req.url}`);
    next();
  });

// Route prefixing
const apiPrefix = '/api';
app.use(`${apiPrefix}`, require('./routes/api')); // Load API routes from a separate file

// Error handling
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).send({ message: 'Internal Server Error' });
});

// Port
const port = 9090;
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});