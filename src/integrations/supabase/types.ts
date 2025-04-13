export type Database = {
  public: {
    Tables: {
      matches: {
        Row: {
          id: string;
          created_at: string;
          date: string;
          time: string;
          location: string;
          address: string;
          field: string;
          organizer: string;
          price: number;
          max_participants: number;
          current_participants: number;
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          title: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          date: string;
          time: string;
          location: string;
          address: string;
          field: string;
          organizer: string;
          price: number;
          max_participants: number;
          current_participants?: number;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
        };
        Update: {
          id?: string;
          created_at?: string;
          date?: string;
          time?: string;
          location?: string;
          address?: string;
          field?: string;
          organizer?: string;
          price?: number;
          max_participants?: number;
          current_participants?: number;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
        };
      };
      participants: {
        Row: {
          id: string;
          created_at: string;
          match_id: string;
          user_id: string;
          name: string;
          position: 'GK' | 'DEF' | 'MID' | 'FWD';
          team?: 'A' | 'B';
          number?: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          match_id: string;
          user_id: string;
          name: string;
          position: 'GK' | 'DEF' | 'MID' | 'FWD';
          team?: 'A' | 'B';
          number?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          match_id?: string;
          user_id?: string;
          name?: string;
          position?: 'GK' | 'DEF' | 'MID' | 'FWD';
          team?: 'A' | 'B';
          number?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};