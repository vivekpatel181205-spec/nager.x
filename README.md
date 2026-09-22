# NagarX

NagarX — Smarter Cities. Better Mobility.

Local full-stack smart-city mobility platform for Citizens, Authorities, and Logistics teams. The application uses React/Vite/Tailwind/Leaflet in the browser and Express/SQLite/JWT in a local Node.js API.

## Structure

```text
nager.x/
├── client/
│   ├── src/main.jsx
│   ├── src/styles.css
│   ├── .env
│   └── package.json
├── server/
│   ├── server.js
│   ├── .env
│   └── package.json
├── database/nagerx.db          # created automatically on first server start
├── .env.example
└── package.json
```

## Install and run

Use Node.js 22 or 24 for the project. The backend uses better-sqlite3 13, which supports Node.js 22+.

From the repository root:

```bash
npm install
```

This installs both the frontend and backend workspaces automatically.

Run the complete app with one local URL:

```bash
npm run dev
```

Open `http://127.0.0.1:5000`. The Express server serves the built frontend and the `/api` endpoints from the same origin.

For optional frontend hot reload during development:

```bash
npm run dev:frontend
```

The API health endpoint is available at `http://127.0.0.1:5000/api/health`.

The frontend API URL is centralized in `client/.env` as `VITE_API_URL=/api` for the combined production service. Backend settings are in `server/.env`; set `CLIENT_URL` to the frontend origin when hosting the client separately (multiple origins may be comma-separated), and change `JWT_SECRET` before using this beyond local demos.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Citizen | citizen@nagerx.demo | citizen123 |
| Authority | authority@nagerx.demo | authority123 |
| Logistics | logistics@nagerx.demo | logistics123 |

## API endpoints

`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

`POST /api/incidents`, `GET /api/incidents`, `GET /api/incidents/:id`, `PUT /api/incidents/:id`, `DELETE /api/incidents/:id`

`GET /api/traffic`, `GET /api/routes`, `POST /api/routes`, `GET /api/analytics`, `GET /api/notifications`, `GET /api/health`

Authenticated endpoints use `Authorization: Bearer <token>`. Authority-only incident changes are role protected. SQLite is seeded with 10 incidents, 10 traffic records, 5 routes, and 3 users. Maps use Leaflet and OpenStreetMap data; no paid services are used.

## Limitations

Route planning is clearly labelled as a local demo calculation and does not provide turn-by-turn routing. Traffic records are seeded local snapshots rather than a live city feed. Performance claims in the UI are labelled “Pilot Target / Illustrative Metric” and are not proven results.