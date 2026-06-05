import type { StageId } from '../utils/stages';

export type StageStatus = 'pending' | 'in_progress' | 'done' | 'n_a';

export interface Conference {
  id: string;
  name: string;
  createdAt: string;
}

export interface StageHistoryEntry {
  status: StageStatus;
  changedAt: string;
}

export interface StageEntry {
  stageId: StageId;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  location?: string;
  locationPhotos?: string[];
  notesPhotos?: string[];
  history?: StageHistoryEntry[];
}

export interface NSRecord {
  id: string;
  ns: string;
  clientName: string;
  label: string; // "NS - ClientName"
  importedAt: string;
  conferenceId?: string;
  stages: StageEntry[];
  generalNotes?: string;
}

export type ViewMode = 'table';
