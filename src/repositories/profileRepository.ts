import { pool } from "../db/pool";
import { Profile } from "../types";

export async function findProfileByName(name: string): Promise<Profile | null> {
  const res = await pool.query<Profile>(
    "SELECT * FROM profiles WHERE LOWER(name) = LOWER($1)",
    [name]
  );
  return res.rows[0] ?? null;
}

export async function findProfileById(id: string): Promise<Profile | null> {
  const res = await pool.query<Profile>(
    "SELECT * FROM profiles WHERE id = $1",
    [id]
  );
  return res.rows[0] ?? null;
}

export interface ProfileFilters {
  gender?: string;
  country_id?: string;
  age_group?: string;
}

export async function findProfiles(filters: ProfileFilters): Promise<Profile[]> {
  const conditions: string[] = [];
  const values: string[] = [];
  let idx = 1;

  if (filters.gender) {
    conditions.push(`LOWER(gender) = LOWER($${idx++})`);
    values.push(filters.gender);
  }
  if (filters.country_id) {
    conditions.push(`LOWER(country_id) = LOWER($${idx++})`);
    values.push(filters.country_id);
  }
  if (filters.age_group) {
    conditions.push(`LOWER(age_group) = LOWER($${idx++})`);
    values.push(filters.age_group);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const res = await pool.query<Profile>(
    `SELECT * FROM profiles ${where} ORDER BY created_at DESC`,
    values
  );
  return res.rows;
}

export async function insertProfile(
  id: string,
  name: string,
  data: {
    gender: string;
    gender_probability: number;
    sample_size: number;
    age: number;
    age_group: string;
    country_id: string;
    country_probability: number;
  }
): Promise<Profile> {
  const res = await pool.query<Profile>(
    `INSERT INTO profiles
      (id, name, gender, gender_probability, sample_size, age, age_group, country_id, country_probability, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
     RETURNING *`,
    [
      id,
      name,
      data.gender,
      data.gender_probability,
      data.sample_size,
      data.age,
      data.age_group,
      data.country_id,
      data.country_probability,
    ]
  );
  return res.rows[0];
}

export async function deleteProfileById(id: string): Promise<boolean> {
  const res = await pool.query("DELETE FROM profiles WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}
