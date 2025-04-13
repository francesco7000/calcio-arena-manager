
import { Match as SupabaseMatch, Participant as SupabaseParticipant } from './database';

export interface Match extends SupabaseMatch {
  participants: Participant[];
  totalParticipants: number;
  currentParticipants: number;
  teamA?: string;
  teamB?: string;
}

export interface Participant extends SupabaseParticipant {
  team?: 'A' | 'B' | string; // To distinguish between teams, allowing string from database
}

export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export type ViewMode = 'list' | 'compact';
