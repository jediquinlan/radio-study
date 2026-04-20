#!/usr/bin/env node
// Ping Supabase to keep the free tier from pausing (7-day inactivity rule).
// Run twice a week. No external deps — uses Node 18+ fetch.
//
//   node scripts/supabase-keepalive.mjs
//
// Reads EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY from
// process.env first, then falls back to apps/mobile/.env.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, "../apps/mobile/.env");

function loadEnvFile(path) {
  try {
    const text = readFileSync(path, "utf8");
    const out = {};
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) out[m[1]] = m[2];
    }
    return out;
  } catch {
    return {};
  }
}

const fileEnv = loadEnvFile(envPath);
const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL || fileEnv.EXPO_PUBLIC_SUPABASE_URL;
const key =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  fileEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const stamp = new Date().toISOString();

async function ping(table) {
  const endpoint = `${url}/rest/v1/${table}?select=id&limit=1`;
  const res = await fetch(endpoint, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`${table} -> ${res.status} ${res.statusText}: ${await res.text()}`);
  }
  return res.status;
}

try {
  const a = await ping("practice_exams");
  const b = await ping("practice_exam_questions");
  console.log(`[${stamp}] keepalive ok: practice_exams=${a} practice_exam_questions=${b}`);
} catch (err) {
  console.error(`[${stamp}] keepalive FAILED: ${err.message}`);
  process.exit(1);
}
