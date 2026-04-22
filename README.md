# Profiles API

A REST API that aggregates name-based predictions from Genderize, Agify, and Nationalize, stores results in PostgreSQL, and exposes CRUD endpoints.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **Database**: PostgreSQL
- **ID generation**: UUID v7 (`uuidv7` package)
- **HTTP client**: Axios

## Project Structure

```
src/
├── index.ts                      # Entry point
├── app.ts                        # Express app + middleware
├── db/
│   ├── pool.ts                   # PostgreSQL connection pool
│   └── migrate.ts                # Creates the profiles table
├── routes/
│   └── profiles.ts               # All 4 endpoints
├── services/
│   └── aggregator.ts             # Calls 3 external APIs + classification
├── repositories/
│   └── profileRepository.ts      # All DB queries
└── types/
    └── index.ts                  # TypeScript interfaces
```

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or a connection string to a hosted DB)

### Steps

```bash
# 1. Clone and install
git clone <your-repo-url>
cd profiles-api
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set your DATABASE_URL

# 3. Run the migration (creates the profiles table)
npm run build
npm run migrate

# 4. Start the dev server
npm run dev
```

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port to run the server on | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/profiles_db` |

## API Endpoints

### POST /api/profiles
Create a new profile. If the name already exists, returns the existing one.

**Request:**
```json
{ "name": "nex" }
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "019d99b0-1d75-7937-8ded-6e482ff56bfa",
    "name": "nex",
    "gender": "male",
    "gender_probability": 0.81,
    "sample_size": 532,
    "age": 51,
    "age_group": "adult",
    "country_id": "AO",
    "country_probability": 0.06776679651594841,
    "created_at": "2026-04-17T04:25:50.624Z"
  }
}
```

### GET /api/profiles
List all profiles. Supports optional case-insensitive filters:
- `?gender=female`
- `?country_id=NG`
- `?age_group=adult`

### GET /api/profiles/:id
Get a single profile by UUID.

### DELETE /api/profiles/:id
Delete a profile. Returns `204 No Content` on success.

## Error Responses

All errors follow this structure:
```json
{ "status": "error", "message": "..." }
```

| Status | Cause |
|---|---|
| 400 | Missing or empty `name` |
| 422 | `name` is not a string |
| 404 | Profile not found |
| 502 | External API returned invalid/null data |
| 500 | Internal server error |

## Deployment (Railway)

1. Create a new project on [Railway](https://railway.app)
2. Add a **PostgreSQL** plugin — Railway auto-sets `DATABASE_URL`
3. Connect your GitHub repo
4. Set `NODE_ENV=production` in Railway environment variables
5. Set the start command to: `npm run build && npm run migrate && npm start`

## Age Classification Logic

| Age Range | Group |
|---|---|
| 0–12 | child |
| 13–19 | teenager |
| 20–59 | adult |
| 60+ | senior |
