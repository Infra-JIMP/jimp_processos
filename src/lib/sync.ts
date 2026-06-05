import type { NSRecord, Conference } from '../store/types';
import {
  fetchAllRecords, upsertRecord, upsertManyRecords,
  deleteRecord as dbDeleteRecord, deleteAllRecords as dbDeleteAll,
  fetchAllConferences, upsertConference as dbUpsertConference, deleteConference as dbDeleteConference,
  getLastUpdatedAt,
} from './db';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

type SyncListener = (status: SyncStatus, error?: string) => void;

const listeners = new Set<SyncListener>();
let currentStatus: SyncStatus = 'idle';
let pollTimer: ReturnType<typeof setInterval> | null = null;

export function onSyncStatus(fn: SyncListener) {
  listeners.add(fn);
  fn(currentStatus);
  return () => listeners.delete(fn);
}

function emit(status: SyncStatus, error?: string) {
  currentStatus = status;
  listeners.forEach((fn) => fn(status, error));
}

function rowToRecord(row: Record<string, unknown>): NSRecord {
  return {
    id: row.id as string,
    ns: row.ns as string,
    clientName: row.client_name as string,
    label: row.label as string,
    importedAt: row.imported_at as string,
    conferenceId: (row.conference_id as string) ?? undefined,
    generalNotes: (row.general_notes as string) ?? undefined,
    stages: Array.isArray(row.stages) ? row.stages : JSON.parse((row.stages as string) ?? '[]'),
  };
}

export async function loadFromDB(): Promise<{ records: NSRecord[]; conferences: Conference[] }> {
  try {
    emit('syncing');
    const [rows, confRows] = await Promise.all([fetchAllRecords(), fetchAllConferences()]);
    emit('synced');
    const records = (rows as Record<string, unknown>[]).map(rowToRecord);
    const conferences = (confRows as Record<string, unknown>[]).map(r => ({
      id: r.id as string,
      name: r.name as string,
      createdAt: r.created_at as string,
    }));
    return { records, conferences };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro de conexão';
    emit('error', msg);
    return { records: [], conferences: [] };
  }
}

export async function pushConference(conf: Conference): Promise<void> {
  try {
    await dbUpsertConference({ id: conf.id, name: conf.name, createdAt: conf.createdAt });
  } catch (err) {
    console.error('[sync] pushConference error:', err);
  }
}

export async function removeConference(id: string): Promise<void> {
  try {
    await dbDeleteConference(id);
  } catch (err) {
    console.error('[sync] removeConference error:', err);
  }
}

export async function pushRecord(record: NSRecord): Promise<void> {
  try {
    await upsertRecord({
      id: record.id,
      ns: record.ns,
      clientName: record.clientName,
      label: record.label,
      importedAt: record.importedAt,
      conferenceId: record.conferenceId,
      generalNotes: record.generalNotes,
      stages: record.stages,
    });
  } catch (err) {
    console.error('[sync] pushRecord error:', err);
    emit('error', err instanceof Error ? err.message : 'Erro ao salvar');
  }
}

export async function pushManyRecords(records: NSRecord[]): Promise<void> {
  if (records.length === 0) return;
  try {
    emit('syncing');
    await upsertManyRecords(
      records.map((r) => ({
        id: r.id,
        ns: r.ns,
        clientName: r.clientName,
        label: r.label,
        importedAt: r.importedAt,
        conferenceId: r.conferenceId,
        generalNotes: r.generalNotes,
        stages: r.stages,
      }))
    );
    emit('synced');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao salvar';
    emit('error', msg);
    throw err;
  }
}

export async function removeRecord(id: string): Promise<void> {
  try {
    await dbDeleteRecord(id);
  } catch (err) {
    console.error('[sync] removeRecord error:', err);
    emit('error', err instanceof Error ? err.message : 'Erro ao remover');
  }
}

export async function clearAllRecords(): Promise<void> {
  try {
    await dbDeleteAll();
  } catch (err) {
    console.error('[sync] clearAllRecords error:', err);
    emit('error', err instanceof Error ? err.message : 'Erro ao limpar');
  }
}

export async function checkForUpdates(
  localRecords: NSRecord[],
  onUpdate: (records: NSRecord[]) => void
): Promise<void> {
  try {
    const lastUpdated = await getLastUpdatedAt();
    if (!lastUpdated) return;

    const remoteRows = await fetchAllRecords();
    const remoteRecords = (remoteRows as Record<string, unknown>[]).map(rowToRecord);

    const localMap = new Map(localRecords.map((r) => [r.id, r]));
    const remoteMap = new Map(remoteRecords.map((r) => [r.id, r]));

    let hasChanges = false;

    const merged = localRecords.map((local) => {
      const remote = remoteMap.get(local.id);
      if (!remote) return local;
      if (JSON.stringify(remote.stages) !== JSON.stringify(local.stages) ||
          remote.generalNotes !== local.generalNotes) {
        hasChanges = true;
        return remote;
      }
      return local;
    });

    for (const remote of remoteRecords) {
      if (!localMap.has(remote.id)) {
        merged.push(remote);
        hasChanges = true;
      }
    }

    if (hasChanges) onUpdate(merged);
    emit('synced');
  } catch {
    emit('offline');
  }
}

export function startPolling(
  getLocalRecords: () => NSRecord[],
  onUpdate: (records: NSRecord[]) => void,
  intervalMs = 15000
) {
  if (pollTimer) return;
  pollTimer = setInterval(async () => {
    await checkForUpdates(getLocalRecords(), onUpdate);
  }, intervalMs);
}

export function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
