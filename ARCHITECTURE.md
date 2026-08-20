# Crest Financial Architecture and Security

## Current runtime

Crest Financial is a browser application served from `index.html`, `style.css`, and `app.js`.
The current persistence adapter is localStorage. It is useful for offline prototypes, but it is not a trusted backend and must not be treated as secure storage for production financial data.

The application is organized around these boundaries:

- **Presentation:** HTML and CSS controls.
- **Application state:** the in-memory collections in `app.js`.
- **Domain rules:** normalization, amount limits, date handling, savings, loans, recurring payments, and calculations.
- **Persistence adapter:** `loadJSON`, `safeSet`, `saveData`, import, export, and reset.
- **Security boundary:** all imported and stored records pass through normalizers before rendering or calculations.

Savings and borrowing are deliberately separate from spending:

- `savings` stores micro-save deposits.
- `goals` stores targets and progress plans.
- `loans` stores principal, outstanding balance, and planned payment.
- `transactions` stores actual income and expenses.

## Production backend target

The recommended production shape is:

```text
Browser UI
  -> HTTPS API
      -> Authentication and authorization middleware
      -> Request validation and rate limiting
      -> Application services
      -> PostgreSQL repository
      -> Audit log
```

The API should expose resource-level routes such as:

- `GET /api/v1/summary`
- `GET|POST /api/v1/transactions`
- `GET|POST /api/v1/savings`
- `GET|POST /api/v1/goals`
- `GET|POST|PATCH /api/v1/loans`
- `GET|POST|PATCH /api/v1/budgets`

The browser should use an `ApiRepository` interface, while the current localStorage implementation remains a `LocalRepository` fallback for offline development. Server-side calculations must be authoritative; client values are display hints only.

## Security baseline

A production backend must include:

- Passwordless or strong password authentication with MFA support.
- Short-lived access tokens, rotating refresh tokens, and revocation.
- Object-level authorization on every resource and user ownership check.
- HTTPS only, HSTS, secure cookies, CSRF protection, and strict CORS.
- Server-side schema validation, maximum payload sizes, and rate limits.
- Parameterized SQL through a repository layer.
- Encryption at rest for sensitive financial records and managed secrets.
- Append-only audit events for login, export, import, loan changes, and deletes.
- Structured redacted logs, dependency scanning, backups, restore drills, and alerting.
- A Content-Security-Policy delivered as an HTTP response header, not only a meta tag.

The current frontend already performs defensive normalization, output escaping, size limits, safe storage writes, and CSP configuration. Those protections reduce browser-side risk, but they do not replace server authentication, authorization, encryption, or database controls.
