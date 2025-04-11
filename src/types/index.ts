
export interface Match {
  id: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  totalParticipants: number;
  currentParticipants: number;
  price: number;
  field: string;
  participants: Participant[];
  teamA?: string;
  teamB?: string;
}

export interface Participant {
  id: string;
  name: string;
  position: string;
  number: number;
  team?: 'A' | 'B'; // To distinguish between teams
}

export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export type ViewMode = 'list' | 'grid' | 'calendar';
