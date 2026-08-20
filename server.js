const express = require('express');
const https = require('https');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { config } = require('./src/config');

const app = express();
const PORT = config.port;
const isProduction = config.isProduction;
const authRoutes = require('./src/routes/authRoutes');
const financeRoutes = require('./src/routes/financeRoutes');
const protectedRoutes = require('./src/routes/protectedRoutes');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

app.use(helmet({
  contentSecurityPolicy: isProduction ? undefined : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(isProduction ? 'combined' : 'dev'));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
}));

app.use('/api/auth', authRoutes);
app.use('/api', financeRoutes);
app.use('/api/protected', protectedRoutes);

app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/app.js', (req, res) => res.sendFile(path.join(__dirname, 'app.js')));
app.get('/style.css', (req, res) => res.sendFile(path.join(__dirname, 'style.css')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const hasHttpsCertificates = config.httpsPfxPath || (config.httpsKeyPath && config.httpsCertPath);

if (isProduction && !hasHttpsCertificates) {
  throw new Error('HTTPS_KEY_PATH and HTTPS_CERT_PATH are required in production.');
}

if (hasHttpsCertificates) {
  const tlsOptions = config.httpsPfxPath
    ? { pfx: fs.readFileSync(path.resolve(config.httpsPfxPath)), passphrase: config.httpsPfxPassword }
    : {
        key: fs.readFileSync(path.resolve(config.httpsKeyPath)),
        cert: fs.readFileSync(path.resolve(config.httpsCertPath))
      };
  https.createServer({ ...tlsOptions, minVersion: 'TLSv1.2' }, app).listen(config.httpsPort, () => {
    console.log(`Crest Financial backend listening on https://localhost:${config.httpsPort}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Crest Financial backend listening on http://localhost:${PORT} (development only)`);
  });
}
