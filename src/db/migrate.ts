import "dotenv/config"
import { pool } from "./pool";

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id            TEXT PRIMARY KEY,
        name          TEXT NOT NULL UNIQUE,
        gender        TEXT,
        gender_probability  NUMERIC,
        sample_size   INTEGER,
        age           INTEGER,
        age_group     TEXT,
        country_id    TEXT,
        country_probability NUMERIC,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Migration complete: profiles table ready.");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
