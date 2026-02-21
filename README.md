# Acadience Attendance

Serverless attendance system on Cloudflare (Workers + D1 + Pages).

## 🚀 Live Deployment

- **Frontend**: https://6e4536fe.acadience.pages.dev
- **API**: https://acadience-attendance-api.sedegahkimathi.workers.dev
- **Database**: Cloudflare D1 (acadience)

## Features

- Dynamic QR per session (JWT + HMAC)
- Geofence validation using Haversine distance
- Time-window enforcement
- Device fingerprinting and duplicate prevention
- Lecturer review of flagged submissions

## Project Structure

- Worker API: [api/src/index.js](api/src/index.js)
- Pages UI: [public](public)
- D1 schema: [schema.sql](schema.sql)

## Cloudflare Setup

### 1. Create D1 Database

```bash
wrangler d1 create acadience
wrangler d1 execute acadience --file=./schema.sql
```

### 2. Configure Cloudflare Access (Lecturer Authentication)

Lecturers require authentication via Cloudflare Access:

1. Go to Cloudflare Dashboard → Zero Trust → Access → Applications
2. Create a new Application:
   - **Application type**: Self-hosted
   - **Application domain**: Your Worker URL (e.g., `attendance-api.yourdomain.workers.dev`)
   - **Policy**: Allow specific emails or groups (your lecturers)
3. Note your **Team Domain** (e.g., `yourteam.cloudflareaccess.com`)
4. Get your **Application AUD** from the application settings
5. Update [wrangler.toml](wrangler.toml):
   ```toml
   ACCESS_AUD = "your-application-aud-here"
   ACCESS_TEAM_DOMAIN = "yourteam"
   ```

### 3. Deploy Worker API and Pages

```bash
wrangler secret put QR_HMAC_SECRET
wrangler deploy
wrangler pages deploy public --project-name acadience
```

## Local Development

1. Install dependencies (none required for runtime).
2. Create a D1 database and set its ID in [wrangler.toml](wrangler.toml).
3. Apply schema:

```bash
wrangler d1 execute acadience_attendance --file=./schema.sql
```

4. Set secrets:
	- `QR_HMAC_SECRET` (use `wrangler secret put QR_HMAC_SECRET`)
5. Configure `ACCESS_AUD` and `ACCESS_TEAM_DOMAIN` (Cloudflare Access) in [wrangler.toml](wrangler.toml).
6. Set `APP_ORIGIN` to your Pages origin for CORS.
7. Run locally:

```bash
npm run dev:worker
npm run dev:pages
```

Update [public/config.js](public/config.js) if the API base is not the same origin.

## API Overview

- `GET /api/health`
- `GET /api/lecturer/courses`
- `POST /api/lecturer/courses`
- `POST /api/lecturer/students`
- `POST /api/lecturer/enrollments`
- `POST /api/lecturer/sessions`
- `POST /api/lecturer/sessions/:id/refresh-qr`
- `GET /api/lecturer/sessions/:id`
- `POST /api/student/submit`

## Notes

- **Lecturer Authentication**: Protected by Cloudflare Access. Lecturers must authenticate before accessing the dashboard.
- **Student Flow**: No authentication required. Students scan QR, enter ID/name/course, and submit.
- QR tokens are time-bound and rotated per session.
- **Device-based duplicate prevention**: Each device can scan only once per session (using device fingerprint).
- Geofence radius and session windows are adjustable per session.
- Lecturers can download attendance as CSV.