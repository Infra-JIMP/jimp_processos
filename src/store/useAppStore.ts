import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NSRecord, StageStatus, ViewMode, Conference } from './types';
import type { StageId } from '../utils/stages';
import {
  pushRecord, pushManyRecords, removeRecord, clearAllRecords as syncClearAll,
  pushConference, removeConference,
  loadFromDB, startPolling, stopPolling, type SyncStatus,
} from '../lib/sync';
import { initDB } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  records: NSRecord[];
  conferences: Conference[];
  activeConferenceId: string | null;
  viewMode: ViewMode;
  syncStatus: SyncStatus;
  syncError: string | undefined;
  dbReady: boolean;

  initializeDB: () => Promise<void>;
  loadRemoteRecords: () => Promise<void>;
  importRecords: (newRecords: NSRecord[], mergeStrategy?: 'keep' | 'replace' | 'replace_all') => Promise<void>;
  updateStageStatus: (recordId: string, stageId: StageId, status: StageStatus) => void;
  moveRecordToStage: (recordId: string, targetStageIndex: number) => void;
  updateStageNotes: (recordId: string, stageId: StageId, notes: string) => void;
  updateStageLocation: (recordId: string, stageId: StageId, location: string) => void;
  addStagePhoto: (recordId: string, stageId: StageId, field: 'locationPhotos' | 'notesPhotos', dataUrl: string) => void;
  removeStagePhoto: (recordId: string, stageId: StageId, field: 'locationPhotos' | 'notesPhotos', index: number) => void;
  updateGeneralNotes: (recordId: string, notes: string) => void;
  deleteRecord: (recordId: string) => void;
  clearAllRecords: () => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  setSyncStatus: (status: SyncStatus, error?: string) => void;
  _setRecordsFromRemote: (records: NSRecord[]) => void;

  // Conference actions
  createConference: (name: string) => Promise<Conference>;
  deleteConference: (id: string) => Promise<void>;
  deleteConferenceWithRecords: (id: string) => Promise<void>;
  setActiveConference: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      records: [],
      conferences: [],
      activeConferenceId: null,
      viewMode: 'table',
      syncStatus: 'idle',
      syncError: undefined,
      dbReady: false,

      setSyncStatus: (status, error) => set({ syncStatus: status, syncError: error }),

      _setRecordsFromRemote: (records) => set({ records }),

      initializeDB: async () => {
        try {
          set({ syncStatus: 'syncing' });
          await initDB();
          set({ dbReady: true });
        } catch (err) {
          console.error('[db] init error:', err);
          set({ syncStatus: 'offline', dbReady: false });
        }
      },

      loadRemoteRecords: async () => {
        set({ syncStatus: 'syncing' });
        const { records: remote, conferences: rawConferences } = await loadFromDB();
        // Deduplicate conferences by name (keep the one with most records)
        const seenNames = new Map<string, Conference>();
        for (const conf of rawConferences) {
          const key = conf.name.trim().toLowerCase();
          if (!seenNames.has(key)) {
            seenNames.set(key, conf);
          } else {
            // Keep the conference that has records associated with it
            const existing = seenNames.get(key)!;
            const existingCount = remote.filter(r => r.conferenceId === existing.id).length;
            const newCount = remote.filter(r => r.conferenceId === conf.id).length;
            if (newCount > existingCount) seenNames.set(key, conf);
          }
        }
        const conferences = Array.from(seenNames.values());
        if (remote.length > 0 || conferences.length > 0) {
          set({ records: remote, conferences, syncStatus: 'synced' });
        } else {
          const local = get().records;
          if (local.length > 0) await pushManyRecords(local);
          set({ syncStatus: 'synced' });
        }

        startPolling(
          () => get().records,
          (updated) => get()._setRecordsFromRemote(updated),
          15000
        );
      },

      createConference: async (name: string) => {
        const conf: Conference = { id: uuidv4(), name, createdAt: new Date().toISOString() };
        set(state => ({ conferences: [conf, ...state.conferences] }));
        await pushConference(conf).catch(console.error);
        return conf;
      },

      deleteConference: async (id: string) => {
        set(state => ({
          conferences: state.conferences.filter(c => c.id !== id),
          activeConferenceId: state.activeConferenceId === id ? null : state.activeConferenceId,
        }));
        await removeConference(id).catch(console.error);
      },

      deleteConferenceWithRecords: async (id: string) => {
        const recordsToDelete = get().records.filter(r => r.conferenceId === id);
        set(state => ({
          conferences: state.conferences.filter(c => c.id !== id),
          records: state.records.filter(r => r.conferenceId !== id),
          activeConferenceId: state.activeConferenceId === id ? null : state.activeConferenceId,
        }));
        await removeConference(id).catch(console.error);
        await Promise.all(recordsToDelete.map(r => removeRecord(r.id).catch(console.error)));
      },

      setActiveConference: (id) => set({ activeConferenceId: id }),

      importRecords: async (newRecords, mergeStrategy = 'keep') => {
        set((state) => {
          if (mergeStrategy === 'replace_all') {
            return { records: newRecords };
          }

          const existingMap = new Map(state.records.map((r) => [r.ns + (r.conferenceId ?? ''), r]));
          const toAdd: NSRecord[] = [];

          for (const rec of newRecords) {
            const key = rec.ns + (rec.conferenceId ?? '');
            const existing = existingMap.get(key);
            if (existing) {
              if (mergeStrategy === 'replace') {
                existingMap.set(key, rec);
              } else {
                existingMap.set(key, { ...existing, clientName: rec.clientName, label: rec.label });
              }
            } else {
              toAdd.push(rec);
            }
          }

          return { records: [...existingMap.values(), ...toAdd] };
        });

        const finalRecords = get().records;
        await pushManyRecords(finalRecords).catch(console.error);
      },

      updateStageStatus: (recordId, stageId, status) => {
        set((state) => ({
          records: state.records.map((r) => {
            if (r.id !== recordId) return r;
            return {
              ...r,
              stages: r.stages.map((s) => {
                if (s.stageId !== stageId) return s;
                const now = new Date().toISOString();
                return {
                  ...s,
                  status,
                  startedAt: status === 'in_progress' && !s.startedAt ? now : s.startedAt,
                  completedAt: status === 'done' ? now : undefined,
                  history: [...(s.history ?? []), { status, changedAt: now }],
                };
              }),
            };
          }),
        }));
        const updated = get().records.find((r) => r.id === recordId);
        if (updated) pushRecord(updated).catch(console.error);
      },

      moveRecordToStage: (recordId, targetStageIndex) => {
        set((state) => ({
          records: state.records.map((r) => {
            if (r.id !== recordId) return r;
            const now = new Date().toISOString();
            return {
              ...r,
              stages: r.stages.map((s, i) => {
                if (i < targetStageIndex) {
                  const newStatus = 'done' as StageStatus;
                  return { ...s, status: newStatus, completedAt: s.completedAt ?? now, startedAt: s.startedAt ?? now, history: [...(s.history ?? []), { status: newStatus, changedAt: now }] };
                }
                if (i === targetStageIndex) {
                  const newStatus = 'in_progress' as StageStatus;
                  return { ...s, status: newStatus, startedAt: s.startedAt ?? now, completedAt: undefined, history: [...(s.history ?? []), { status: newStatus, changedAt: now }] };
                }
                return { ...s, status: 'pending' as StageStatus, startedAt: undefined, completedAt: undefined };
              }),
            };
          }),
        }));
        const updated = get().records.find((r) => r.id === recordId);
        if (updated) pushRecord(updated).catch(console.error);
      },

      updateStageNotes: (recordId, stageId, notes) => {
        set((state) => ({
          records: state.records.map((r) => {
            if (r.id !== recordId) return r;
            return { ...r, stages: r.stages.map((s) => s.stageId === stageId ? { ...s, notes } : s) };
          }),
        }));
        const updated = get().records.find((r) => r.id === recordId);
        if (updated) pushRecord(updated).catch(console.error);
      },

      updateStageLocation: (recordId, stageId, location) => {
        set((state) => ({
          records: state.records.map((r) => {
            if (r.id !== recordId) return r;
            return { ...r, stages: r.stages.map((s) => s.stageId === stageId ? { ...s, location } : s) };
          }),
        }));
        const updated = get().records.find((r) => r.id === recordId);
        if (updated) pushRecord(updated).catch(console.error);
      },

      addStagePhoto: (recordId, stageId, field, dataUrl) => {
        set((state) => ({
          records: state.records.map((r) => {
            if (r.id !== recordId) return r;
            return {
              ...r,
              stages: r.stages.map((s) => {
                if (s.stageId !== stageId) return s;
                return { ...s, [field]: [...(s[field] ?? []), dataUrl] };
              }),
            };
          }),
        }));
        const updated = get().records.find((r) => r.id === recordId);
        if (updated) pushRecord(updated).catch(console.error);
      },

      removeStagePhoto: (recordId, stageId, field, index) => {
        set((state) => ({
          records: state.records.map((r) => {
            if (r.id !== recordId) return r;
            return {
              ...r,
              stages: r.stages.map((s) => {
                if (s.stageId !== stageId) return s;
                return { ...s, [field]: (s[field] ?? []).filter((_: unknown, i: number) => i !== index) };
              }),
            };
          }),
        }));
        const updated = get().records.find((r) => r.id === recordId);
        if (updated) pushRecord(updated).catch(console.error);
      },

      updateGeneralNotes: (recordId, notes) => {
        set((state) => ({
          records: state.records.map((r) => r.id === recordId ? { ...r, generalNotes: notes } : r),
        }));
        const updated = get().records.find((r) => r.id === recordId);
        if (updated) pushRecord(updated).catch(console.error);
      },

      deleteRecord: (recordId) => {
        set((state) => ({ records: state.records.filter((r) => r.id !== recordId) }));
        removeRecord(recordId).catch(console.error);
      },

      clearAllRecords: async () => {
        set({ records: [] });
        await syncClearAll().catch(console.error);
      },

      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: 'amanda-gerencial-v1',
      partialize: (state) => ({
        records: state.records,
        conferences: state.conferences,
        activeConferenceId: state.activeConferenceId,
        viewMode: state.viewMode,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => stopPolling());
}
