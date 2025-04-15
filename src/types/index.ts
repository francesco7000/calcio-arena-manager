
import { Match as SupabaseMatch, Participant as SupabaseParticipant } from './database';

export interface Match extends SupabaseMatch {
  participants: Participant[];
  totalParticipants: number;
  currentParticipants: number;
  teamA?: string;
  teamB?: string;
}

export interface Participant extends Omit<SupabaseParticipant, 'team'> {
  team?: 'A' | 'B' | string; // To distinguish between teams, allowing string from database
}

export interface Notification {
  id: string;
  created_at: string | null;
  match_id: string;
  user_id: string;
  is_read: boolean | null;
  message: string | null;
}

export type Position =
  | 'POR'   // Portiere
  | 'DC'    // Difensore Centrale
  | 'TS'    // Terzino Sinistro
  | 'TD'    // Terzino Destro
  | 'ES'    // Esterno Sinistro
  | 'ED'    // Esterno Destro
  | 'CDC'   // Centrocampista Difensivo Centrale
  | 'CC'    // Centrocampista Centrale
  | 'COC'   // Centrocampista Offensivo Centrale
  | 'AS'    // Ala Sinistra
  | 'AD'    // Ala Destra
  | 'SP'    // Seconda Punta
  | 'ATT';  // Attaccante


export type ViewMode = 'list' | 'compact';
