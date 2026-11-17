# Marketplace services

NestJS service for Enterprise Data Marketplace workflow state. DataHub remains the system of record for metadata, ownership, domains, data products, and lineage. This service will own access requests, approvals, and provisioning status. It does not read or write DataHub's database or search indexes.

The DataHub integration is an interface plus an offline stub. No code path calls DataHub or reads `DATAHUB_TOKEN`.

`marketplace-platform/docs/api-contracts.md` is empty, and `docs/architecture.md` only names the service boundaries. The routes below are a provisional local API, not an agreed platform contract.

## Prerequisites

- Node.js 24

## Setup

```bash
npm install
```

Create a local env file. It contains no real secrets.

```bash
cp .env.example .env
```

```powershell
Copy-Item .env.example .env
```

## Run

```bash
npm run start:dev
```

Other commands:

```bash
npm run build
npm run start
npm run start:prod
npm test
npm run test:e2e
npm run lint
```

The process listens on `PORT` (default `3000`). Startup fails if the environment does not match [src/config/env.schema.ts](src/config/env.schema.ts). In particular, `DATAHUB_ADAPTER` must be `stub`, and `AUTH_MODE=dev-stub` is rejected when `NODE_ENV=production`.

## Provisional endpoints

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/health/live` | none |
| GET | `/health/ready` | none |
| POST | `/api/v1/access-requests` | required |
| GET | `/api/v1/access-requests/:id` | required |

`AUTH_MODE=disabled` (the default) responds `401` on `/api` routes. `AUTH_MODE=dev-stub` attaches a fixed local principal so the placeholder API can be called without an identity provider. Health checks stay unversioned so probes do not change when the API version does.

Create body:

```json
{
  "dataProductUrn": "urn:li:dataProduct:sample_sales",
  "justification": "Needed for a sample analysis"
}
```

The stub knows `urn:li:dataProduct:sample_sales` and `urn:li:dataProduct:sample_customers`. Unknown products return `404`. The caller identity is taken from the server principal, never from the body. A request is visible only to the principal that created it.

Send `x-request-id` to propagate a correlation id. The service generates one when the header is missing or not a short token, and returns it on the response.

Errors use `{ statusCode, error, message, requestId }` and do not include stack traces. A failed readiness check keeps the Terminus payload and returns `503`.

## Not implemented

- A real DataHub GMS or GraphQL adapter
- Approval, provisioning, and platform adapters
- Persistence (requests live in memory and are dropped on restart)
- Microsoft Entra ID token validation
- OpenAPI
- Idempotency keys

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | `development`, `test`, or `production` |
| `PORT` | `3000` | HTTP port |
| `DATAHUB_ADAPTER` | `stub` | Only `stub` is accepted |
| `DATAHUB_GMS_URL` | unset | Reserved. Unused by the stub |
| `DATAHUB_TIMEOUT_MS` | `5000` | Reserved. Unused by the stub |
| `DATAHUB_TOKEN` | unset | Reserved. Unused by the stub. Never log or commit it |
| `AUTH_MODE` | `disabled` | `disabled` or `dev-stub` |
