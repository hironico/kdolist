const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const bodyParser = require('body-parser');

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
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(process.env.WEBUI_HOME_DIR)); // Serve static files from the 'public' directory see .env file

// Set up express to use the logger
app.use((req, res, next) => {
    logger.http(`Request: ${req.method} ${req.url}`);
    next();
  });

// Route loading
app.use('/api', require('./routes/api/')); 
app.use('/legal', require('./routes/legal/')); 

// Error handling
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).send({ message: 'Internal Server Error' });
});

const port = process.env.SERVER_PORT;

// create HTTPS server only if enabled in the configuration
// see dotenv-sample file for instructions about SSL and HTTPS
if (process.env.SERVER_SSL_ENABLED === 'true') {
  https.createServer({
      key: fs.readFileSync(process.env.SERVER_SSL_KEY_FILE),
      cert: fs.readFileSync(process.env.SERVER_SSL_CERT_FILE)
  }, app).listen(port, () => {
      // tslint:disable-next-line:no-console
      logger.info(`Server started at https://localhost:${port}`);
  });
} else {
  http.createServer(app).listen(port, () => {
      // tslint:disable-next-line:no-console
      logger.info(`Development server started at http://localhost:${port}`);
  })
}
