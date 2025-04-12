
import { Database } from '@/integrations/supabase/types';

// Matches table type
export type Match = Database['public']['Tables']['matches']['Row'];
export type InsertMatch = Database['public']['Tables']['matches']['Insert'];
export type UpdateMatch = Database['public']['Tables']['matches']['Update'];

// Participants table type
export type Participant = Database['public']['Tables']['participants']['Row'];
export type InsertParticipant = Database['public']['Tables']['participants']['Insert'];
export type UpdateParticipant = Database['public']['Tables']['participants']['Update'];
