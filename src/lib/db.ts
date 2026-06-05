import { neon } from '@neondatabase/serverless';

const DATABASE_URL =
  'postgresql://neondb_owner:npg_dLkDH5TZqF7M@ep-wild-morning-acx10vqs-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const sql = neon(DATABASE_URL);

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS conferences (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ns_records (
      id TEXT PRIMARY KEY,
      ns TEXT NOT NULL,
      client_name TEXT NOT NULL,
      label TEXT NOT NULL,
      imported_at TEXT NOT NULL,
      conference_id TEXT,
      general_notes TEXT,
      stages JSONB NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL DEFAULT to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    )
  `;

  // Migrate: add conference_id if table already exists without it (no FK constraint)
  await sql`
    ALTER TABLE ns_records ADD COLUMN IF NOT EXISTS conference_id TEXT
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sync_log (
      id SERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      record_id TEXT,
      payload JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function fetchAllConferences() {
  return sql`SELECT id, name, created_at FROM conferences ORDER BY created_at DESC`;
}

export async function upsertConference(conf: { id: string; name: string; createdAt: string }) {
  await sql`
    INSERT INTO conferences (id, name, created_at)
    VALUES (${conf.id}, ${conf.name}, ${conf.createdAt})
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
  `;
}

export async function deleteConference(id: string) {
  await sql`DELETE FROM conferences WHERE id = ${id}`;
}

export async function fetchAllRecords() {
  return sql`
    SELECT id, ns, client_name, label, imported_at, conference_id, general_notes, stages, updated_at
    FROM ns_records
    ORDER BY imported_at DESC
  `;
}

export async function upsertRecord(record: {
  id: string;
  ns: string;
  clientName: string;
  label: string;
  importedAt: string;
  conferenceId?: string;
  generalNotes?: string;
  stages: unknown;
}) {
  const now = new Date().toISOString();
  await sql`
    INSERT INTO ns_records (id, ns, client_name, label, imported_at, conference_id, general_notes, stages, updated_at)
    VALUES (
      ${record.id},
      ${record.ns},
      ${record.clientName},
      ${record.label},
      ${record.importedAt},
      ${record.conferenceId ?? null},
      ${record.generalNotes ?? null},
      ${JSON.stringify(record.stages)},
      ${now}
    )
    ON CONFLICT (id) DO UPDATE SET
      ns = EXCLUDED.ns,
      client_name = EXCLUDED.client_name,
      label = EXCLUDED.label,
      conference_id = EXCLUDED.conference_id,
      general_notes = EXCLUDED.general_notes,
      stages = EXCLUDED.stages,
      updated_at = EXCLUDED.updated_at
  `;
}

export async function upsertManyRecords(records: Array<{
  id: string;
  ns: string;
  clientName: string;
  label: string;
  importedAt: string;
  conferenceId?: string;
  generalNotes?: string;
  stages: unknown;
}>) {
  if (records.length === 0) return;
  const now = new Date().toISOString();
  for (const record of records) {
    await sql`
      INSERT INTO ns_records (id, ns, client_name, label, imported_at, conference_id, general_notes, stages, updated_at)
      VALUES (
        ${record.id},
        ${record.ns},
        ${record.clientName},
        ${record.label},
        ${record.importedAt},
        ${record.conferenceId ?? null},
        ${record.generalNotes ?? null},
        ${JSON.stringify(record.stages)},
        ${now}
      )
      ON CONFLICT (id) DO UPDATE SET
        ns = EXCLUDED.ns,
        client_name = EXCLUDED.client_name,
        label = EXCLUDED.label,
        conference_id = EXCLUDED.conference_id,
        general_notes = EXCLUDED.general_notes,
        stages = EXCLUDED.stages,
        updated_at = EXCLUDED.updated_at
    `;
  }
}

export async function deleteRecord(id: string) {
  await sql`DELETE FROM ns_records WHERE id = ${id}`;
}

export async function deleteAllRecords() {
  await sql`DELETE FROM ns_records`;
}

export async function getLastUpdatedAt(): Promise<string | null> {
  const rows = await sql`
    SELECT MAX(updated_at) as last_updated FROM ns_records
  `;
  return (rows[0]?.last_updated as string) ?? null;
}
