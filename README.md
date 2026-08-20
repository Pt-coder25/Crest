# Crest Financial Launch Readiness

This project now includes a secure backend foundation for Crest Financial. The previous version stored everything in browser `localStorage`, which is fine for prototypes but not acceptable for launch.

## What this adds

- Secure authentication using JWT in HTTP-only cookies
- Password hashing with `bcryptjs`
- SQLite storage with persistent data per user
- Request rate limiting
- Helmet and strict CORS defaults
- Environment-based configuration

## Run locally

1. Copy `.env.example` to `.env`
2. Install dependencies:
   
   npm install

3. Start the server:

   npm start

4. Open:

   http://localhost:3000

## Run with HTTPS

The server uses HTTPS when both certificate paths are configured. For local testing, create a `certs` directory and generate a trusted development certificate with your preferred certificate tool, then set these values in `.env`:

   HTTPS_PORT=3443
   HTTPS_KEY_PATH=./certs/localhost-key.pem
   HTTPS_CERT_PATH=./certs/localhost.pem
   HTTPS_PFX_PATH=
   HTTPS_PFX_PASSWORD=

Start the server and open `https://localhost:3443`. Browsers may show a warning for a self-signed development certificate. In production, use a certificate issued by a trusted certificate authority. Production startup now fails if HTTPS certificate paths are missing.

## Security notes

This is a real launch-ready backend foundation, but the front-end still needs to be migrated from local-only storage to authenticated API calls before production use.

## Important

For launch, use a real production deployment with:

- HTTPS only with a trusted production certificate
- a managed database (Postgres recommended)
- rotated secrets
- CI/CD checks
- backups and monitoring
- a proper front-end auth flow
