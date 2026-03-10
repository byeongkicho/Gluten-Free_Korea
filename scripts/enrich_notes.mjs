import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const placesPath = path.join(rootDir, "data", "places.json");
const outputPath = path.join(rootDir, "data", "note_drafts.json");

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getTextFromResponse(response) {
  const textParts = Array.isArray(response?.content)
    ? response.content
        .filter((block) => block && block.type === "text" && typeof block.text === "string")
        .map((block) => block.text.trim())
        .filter(Boolean)
    : [];

  return textParts.join("\n\n").trim();
}

function buildPrompt(place) {
  return [
    "Write ONE concise, factual note for a gluten-free directory entry.",
    "Constraints:",
    "- 1-2 sentences, plain English.",
    "- No guarantees (avoid '100% safe').",
    "- Include a gentle verification reminder.",
    "- No markdown, no bullets, no emojis.",
    "- If info is sparse, keep it cautious and brief.",
    "",
    `Name: ${place.name || ""}`,
    `Type: ${place.type || ""}`,
    `Location: ${place.location || ""}`,
    `Address: ${place.address || ""}`,
    `Address (EN): ${place.addressEn || ""}`,
    `Tags: ${Array.isArray(place.tags) ? place.tags.join(", ") : ""}`,
    `Sources: ${Array.isArray(place.sources) ? place.sources.join(" | ") : ""}`,
  ].join("\n");
}

async function loadPlaces() {
  const raw = await fs.readFile(placesPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("data/places.json must be a top-level array");
  }
  return parsed;
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-0";
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY. Set it before running `npm run enrich:notes`.");
  }

  const places = await loadPlaces();
  const targets = places.filter((place) => {
    const note = typeof place?.note === "string" ? place.note.trim() : "";
    const slug = typeof place?.slug === "string" ? place.slug.trim() : "";
    return slug && note.length === 0;
  });

  const client = new Anthropic({ apiKey });
  const generatedAt = todayIsoDate();
  const drafts = {};

  for (const place of targets) {
    const slug = place.slug;

    const response = await client.messages.create({
      model,
      max_tokens: 220,
      temperature: 0.3,
      system:
        "You write concise, cautious directory notes for gluten-free travelers. Be factual and avoid overclaiming safety.",
      messages: [{ role: "user", content: buildPrompt(place) }],
    });

    const draft = getTextFromResponse(response);
    drafts[slug] = {
      name: place.name || slug,
      draft,
      generated_at: generatedAt,
    };

    console.log(`Generated draft for ${slug}`);
  }

  await fs.writeFile(outputPath, `${JSON.stringify(drafts, null, 2)}\n`, "utf8");
  console.log(`Wrote ${Object.keys(drafts).length} draft(s) -> data/note_drafts.json`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
