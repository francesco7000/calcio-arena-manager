
import { Match as SupabaseMatch, Participant as SupabaseParticipant } from './database';

export interface Match extends SupabaseMatch {
  participants: Participant[];
  currentParticipants?: number;
  totalParticipants?: number;
  teamA?: string;
  teamB?: string;
}

export interface Participant extends Omit<SupabaseParticipant, 'team'> {
  team?: 'A' | 'B' | string; // Allow both the typed version and string from database
}

export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export type ViewMode = 'list' | 'compact';
