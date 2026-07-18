import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const OUTPUT_PATH = 'frontend/vit-room-finder/src/data/rooms.json'; // relative to repo root (proj_vit)

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role, not anon key -- this runs server-side only
);

const { data, error } = await supabase.rpc('get_rooms_json');

if (error) {
  console.error('Failed to fetch rooms.json from Supabase:', error.message);
  process.exit(1);
}

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
console.log(`rooms.json written to ${OUTPUT_PATH} at ${new Date().toISOString()}`);
