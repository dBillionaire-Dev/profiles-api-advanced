import { Router, Request, Response } from "express";
import { uuidv7 } from "uuidv7";
import { aggregateName, ExternalApiError } from "../services/aggregator";
import {
  findProfileByName,
  findProfileById,
  findProfiles,
  insertProfile,
  deleteProfileById,
} from "../repositories/profileRepository";

const router = Router();

// ─── POST /api/profiles ────
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;

  // Input validation
  if (name === undefined || name === null || name === "") {
    res.status(400).json({ status: "error", message: "Missing or empty name" });
    return;
  }
  if (typeof name !== "string") {
    res.status(422).json({ status: "error", message: "name must be a string" });
    return;
  }

  const trimmedName: string = name.trim();
  if (trimmedName === "") {
    res.status(400).json({ status: "error", message: "Missing or empty name" });
    return;
  }

  try {
    // Idempotency: return existing profile if name already stored
    const existing = await findProfileByName(trimmedName);
    if (existing) {
      res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: formatProfile(existing),
      });
      return;
    }

    // Call the three external APIs
    const aggregated = await aggregateName(trimmedName);

    // Store in DB with a UUID v7
    const id: string = uuidv7();
    const profile = await insertProfile(id, trimmedName, aggregated);

    res.status(201).json({
      status: "success",
      data: formatProfile(profile),
    });
  } catch (err) {
    if (err instanceof ExternalApiError) {
      res.status(502).json({ status: "502", message: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// ─── GET /api/profiles ────
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { gender, country_id, age_group } = req.query;

  try {
    const profiles = await findProfiles({
      gender: gender as string | undefined,
      country_id: country_id as string | undefined,
      age_group: age_group as string | undefined,
    });

    res.status(200).json({
      status: "success",
      count: profiles.length,
      data: profiles.map(formatProfileList),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// ─── GET /api/profiles/:id ─────
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await findProfileById(req.params.id);
    if (!profile) {
      res.status(404).json({ status: "error", message: "Profile not found" });
      return;
    }
    res.status(200).json({ status: "success", data: formatProfile(profile) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// ─── DELETE /api/profiles/:id ─────
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await deleteProfileById(req.params.id);
    if (!deleted) {
      res.status(404).json({ status: "error", message: "Profile not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// ─── Formatters ────
function formatProfile(p: any) {
  return {
    id: p.id,
    name: p.name,
    gender: p.gender,
    gender_probability: parseFloat(p.gender_probability),
    sample_size: parseInt(p.sample_size),
    age: parseInt(p.age),
    age_group: p.age_group,
    country_id: p.country_id,
    country_probability: parseFloat(p.country_probability),
    created_at: new Date(p.created_at).toISOString(),
  };
}

function formatProfileList(p: any) {
  return {
    id: p.id,
    name: p.name,
    gender: p.gender,
    age: parseInt(p.age),
    age_group: p.age_group,
    country_id: p.country_id,
  };
}

export default router;
