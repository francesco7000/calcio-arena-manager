
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
}

export interface Participant {
  id: string;
  name: string;
  position: string;
  number: number;
}

export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';
