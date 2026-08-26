# Tiny Yes

A bilingual collection of three playful, shareable asks: a raise, a new role, and a coffee date.
Raise, Hire, and Date are all enabled by default. Clone owners can hide scenarios and optionally
receive completed results by email without changing application code.

## Quick Start

Requires Node.js 20.11 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. The root command runs the Vite frontend and the lightweight email API
together; Vite proxies `/api` to the local server on port `8787`.

For a production build served by the Node process:

```bash
npm run build
npm start
```

`npm run check` runs typechecking, lint, tests, and both production builds.

## Email Result Notifications

The server uses [Resend](https://resend.com/docs/send-with-nodejs) through a small provider adapter.
Create a sending-only key in the [Resend API Keys dashboard](https://resend.com/docs/dashboard/api-keys/introduction)
and verify the domain used by `EMAIL_FROM`. Copy `.env.example` to a root `.env` file:

```dotenv
EMAIL_NOTIFICATIONS_ENABLED=true
RESEND_API_KEY=re_fake_replace_me
EMAIL_FROM="Tiny Yes <results@your-verified-domain.example>"
RESULT_EMAIL_TO=owner@example.com
```

- `EMAIL_NOTIFICATIONS_ENABLED` — set to `true` to send; any other value keeps email disabled.
- `RESEND_API_KEY` — server-only Resend API key.
- `EMAIL_FROM` — sender on a domain configured in Resend.
- `RESULT_EMAIL_TO` — deployer/owner address that receives every completed result.

Visitors are intentionally never asked for a name, email address, login, or other personal data.
Results go only to the deployer's configured `RESULT_EMAIL_TO` address. Delivery failures never
interrupt the visitor's Final Result screen.

**Keep `RESEND_API_KEY` server-side. Never rename it to a `VITE_*` variable, expose it in frontend
code, or commit `.env`.** Configure the same four server environment variables in your hosting
provider. Email variables are read at runtime; no secret is included in the frontend bundle.

The API accepts only the app's typed Raise, Hire, and Date result schemas. It rejects custom
recipients, subjects, HTML, unknown choices, and incomplete results, and includes per-IP rate
limiting plus completion idempotency.

## Choosing Available Experiences

Set `VITE_ENABLED_SCENARIOS` in `.env` before starting development or building for production.
Values are comma-separated and order matters when Raise is disabled:

```dotenv
# All (default)
VITE_ENABLED_SCENARIOS=raise,hire,date

# Raise only
VITE_ENABLED_SCENARIOS=raise

# Hire only
VITE_ENABLED_SCENARIOS=hire

# Date only
VITE_ENABLED_SCENARIOS=date

# Raise + Hire
VITE_ENABLED_SCENARIOS=raise,hire
```

Disabled scenarios disappear from the selector and their URLs redirect to an enabled scenario. `/`
uses Raise whenever Raise is enabled; otherwise it uses the first configured valid scenario.
Unknown IDs are ignored. If none are usable, the app logs a developer-facing warning and safely
falls back to all three scenarios instead of rendering an empty application.

`VITE_ENABLED_SCENARIOS` is intentionally frontend-visible and is read at build time. Set it in the
build environment when deploying, then rebuild the frontend.

## Repository Layout

- `frontend/` — React, TypeScript, Vite, Motion, localization, and UI tests
- `backend/` — Node/TypeScript result API, Resend adapter, validation, rate limiting, and tests
- `shared/` — canonical completed-result domain types/builders used by UI and email
- `docs/` — product and architecture notes
- `gorba/` — canonical bee-kitten source renders
