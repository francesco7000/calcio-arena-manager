
import { Match as SupabaseMatch, Participant as SupabaseParticipant } from './database';

export interface Match extends SupabaseMatch {
  participants: Participant[];
  currentParticipants?: number;
  totalParticipants?: number;
  teamA?: string;
  teamB?: string;
}

export interface Participant extends SupabaseParticipant {
  team?: 'A' | 'B'; // To distinguish between teams
}

export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export type ViewMode = 'list' | 'compact';
