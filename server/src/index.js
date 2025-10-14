const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

// configure application with process env variables from .env file
require('dotenv').config();

const app = express();
const logger = require('./logger');
const { initKeycloakClient } = require('./config/keycloak');

// enable CORS for the webdav server to be used by a client in the browser.
// we use the regular cors methods plus thoses from RFC2518 aka webdav (6 last http methods)
const corsOptions = {
    origin: (origin, callback) => { callback(null, true)},
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,PROPFIND,PROPPATCH,MKCOL,COPY,MOVE,LOCK,UNLOCK",
    allowedHeaders: 'Content-Type,Authorization'
};

// Middlewares
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '5mb' }));

// Session middleware for OIDC flow
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.SERVER_SSL_ENABLED === 'true',
    httpOnly: false,
    maxAge: 1000 * 60 * 30 // 30 minutes
  }
}));

// Set up express to use the logger
app.use((req, res, next) => {
    logger.http(`${req.method} ${req.url}`);
    next();
  });

// Route loading - MUST come before static files
app.use('/api', require('./routes/api/')); 
app.use('/legal', require('./routes/legal/'));

// Serve static files using absolute path to avoid permission issues
// This comes AFTER API routes so API calls are handled first
const staticPath = path.resolve(process.cwd(), process.env.WEBUI_HOME_DIR);
logger.info(`Serving static files from: ${staticPath}`);
app.use(express.static(staticPath));

// SPA fallback: serve index.html for all non-API routes
// This allows React Router to handle client-side routing
// Explicitly exclude /api and /legal routes from SPA fallback
app.get('*', (req, res, next) => {
  // Skip SPA fallback for API and legal routes
  if (req.path.startsWith('/api') || req.path.startsWith('/legal')) {
    logger.warn(`Skipping SPA fallback for API route: ${req.path}`);
    return next();
  }

  // Only serve index.html for HTML requests (not for assets like .js, .css, etc.)
  if (req.accepts('html')) {
    // Resolve to absolute path to avoid permission issues
    const indexPath = path.resolve(process.cwd(), process.env.WEBUI_HOME_DIR, 'index.html');
    logger.debug(`Serving SPA index.html for route: ${req.url} from ${indexPath}`);
    
    // Check if file exists before trying to serve it
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath, (err) => {
        if (err) {
          logger.error(`Failed to serve index.html: ${err.message}`);
          res.status(500).send('Error serving application');
        }
      });
    } else {
      logger.error(`index.html not found at: ${indexPath}`);
      res.status(404).send('React app not found. Make sure the client is built with: cd client && npm run build');
    }
  } else {
    logger.debug(`Not serving HTML for: ${req.url}`);
    res.status(404).send('Not found');
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ message: 'Internal Server Error', err: err });
});

const port = process.env.SERVER_PORT;

// Initialize Keycloak client
initKeycloakClient().catch(error => {
  logger.error(`Failed to initialize Keycloak: ${error.message}`);
});

// create HTTPS server only if enabled in the configuration
// see dotenv-sample file for instructions about SSL and HTTPS
if (process.env.SERVER_SSL_ENABLED === 'true') {
  logger.info('Searching certs in directory :' + process.cwd());
  logger.info('Directory of this file :' + __dirname);
  https.createServer({
      key: fs.readFileSync(`${process.cwd()}/${process.env.SERVER_SSL_KEY_FILE}`),
      cert: fs.readFileSync(`${process.cwd()}/${process.env.SERVER_SSL_CERT_FILE}`)
  }, app).listen(port, () => {
      logger.info(`Server started at https://localhost:${port}`);
  });
} else {
  http.createServer(app).listen(port, () => {
      logger.info(`Development server started at http://localhost:${port}`);
  })
}
