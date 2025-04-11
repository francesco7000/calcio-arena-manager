
import { Match, Participant } from "@/types";

// Helper function to create participants
const createParticipants = (count: number, teamPrefix: string = '', team?: 'A' | 'B'): Participant[] => {
  const positions: ['GK', 'DEF', 'MID', 'FWD'] = ['GK', 'DEF', 'MID', 'FWD'];
  return Array.from({ length: count }).map((_, index) => {
    // Assign positions based on index (1 GK, 4 DEF, 4 MID, 2 FWD per team)
    let position: 'GK' | 'DEF' | 'MID' | 'FWD';
    if (index === 0) position = 'GK';
    else if (index >= 1 && index <= 4) position = 'DEF';
    else if (index >= 5 && index <= 8) position = 'MID';
    else position = 'FWD';
    
    return {
      id: `player-${teamPrefix}${index + 1}`,
      name: `${teamPrefix}Player ${index + 1}`,
      position,
      number: index + 1,
      team
    };
  });
};

// Create a full 11v11 match
const fullTeamAParticipants = createParticipants(11, 'A-', 'A');
const fullTeamBParticipants = createParticipants(11, 'B-', 'B');

export const mockMatches: Match[] = [
  {
    id: "match1",
    date: "2025-04-15",
    time: "19:00",
    location: "Centro Sportivo XYZ",
    organizer: "Mario Rossi",
    totalParticipants: 10,
    currentParticipants: 8,
    price: 10.00,
    field: "Campo Grande",
    participants: [
      { id: "p1", name: "Marco", position: "GK", number: 1 },
      { id: "p2", name: "Luigi", position: "DEF", number: 2 },
      { id: "p3", name: "Giovanni", position: "DEF", number: 3 },
      { id: "p4", name: "Paolo", position: "MID", number: 4 },
      { id: "p5", name: "Roberto", position: "MID", number: 5 },
      { id: "p6", name: "Alberto", position: "MID", number: 6 },
      { id: "p7", name: "Davide", position: "FWD", number: 7 },
      { id: "p8", name: "Stefano", position: "FWD", number: 8 }
    ]
  },
  {
    id: "match2",
    date: "2025-04-16",
    time: "20:30",
    location: "Stadio Comunale",
    organizer: "Luca Bianchi",
    totalParticipants: 10,
    currentParticipants: 10,
    price: 12.50,
    field: "Campo Centrale",
    participants: [
      { id: "p9", name: "Francesco", position: "GK", number: 1 },
      { id: "p10", name: "Alessio", position: "DEF", number: 2 },
      { id: "p11", name: "Simone", position: "DEF", number: 3 },
      { id: "p12", name: "Matteo", position: "DEF", number: 4 },
      { id: "p13", name: "Andrea", position: "MID", number: 5 },
      { id: "p14", name: "Fabio", position: "MID", number: 6 },
      { id: "p15", name: "Luca", position: "MID", number: 7 },
      { id: "p16", name: "Giuseppe", position: "FWD", number: 8 },
      { id: "p17", name: "Alessandro", position: "FWD", number: 9 },
      { id: "p18", name: "Riccardo", position: "FWD", number: 10 }
    ]
  },
  {
    id: "match3",
    date: "2025-04-18",
    time: "18:45",
    location: "Centro Sportivo Meridiana",
    organizer: "Antonio Verdi",
    totalParticipants: 12,
    currentParticipants: 9,
    price: 8.00,
    field: "Campo Piccolo",
    participants: [
      { id: "p19", name: "Michele", position: "DEF", number: 1 },
      { id: "p20", name: "Claudio", position: "DEF", number: 2 },
      { id: "p21", name: "Daniele", position: "DEF", number: 3 },
      { id: "p22", name: "Federico", position: "MID", number: 4 },
      { id: "p23", name: "Marco A.", position: "MID", number: 5 },
      { id: "p24", name: "Leonardo", position: "MID", number: 6 },
      { id: "p25", name: "Salvatore", position: "FWD", number: 7 },
      { id: "p26", name: "Lorenzo", position: "FWD", number: 8 },
      { id: "p27", name: "Vincenzo", position: "FWD", number: 9 }
    ]
  },
  {
    id: "match4",
    date: "2025-04-20",
    time: "19:30",
    location: "Stadio Olimpico",
    organizer: "Giovanni Neri",
    totalParticipants: 22,
    currentParticipants: 22,
    price: 15.00,
    field: "Campo Principale",
    teamA: "Squadra Rossa",
    teamB: "Squadra Blu",
    participants: [...fullTeamAParticipants, ...fullTeamBParticipants]
  },
  {
    id: "match5",
    date: "2025-04-22",
    time: "21:00",
    location: "Campo Sportivo Europa",
    organizer: "Francesco Esposito",
    totalParticipants: 14,
    currentParticipants: 14,
    price: 10.00,
    field: "Campo Europa",
    participants: [
      { id: "p50", name: "Giorgio", position: "GK", number: 1 },
      { id: "p51", name: "Massimo", position: "DEF", number: 2 },
      { id: "p52", name: "Valerio", position: "DEF", number: 3 },
      { id: "p53", name: "Carmine", position: "DEF", number: 4 },
      { id: "p54", name: "Enzo", position: "MID", number: 5 },
      { id: "p55", name: "Pietro", position: "MID", number: 6 },
      { id: "p56", name: "Antonio B.", position: "MID", number: 7 },
      { id: "p57", name: "Stefano B.", position: "FWD", number: 8 },
      { id: "p58", name: "Giovanni B.", position: "FWD", number: 9 },
      { id: "p59", name: "Luigi B.", position: "GK", number: 10, team: 'B' },
      { id: "p60", name: "Marco B.", position: "DEF", number: 11, team: 'B' },
      { id: "p61", name: "Roberto B.", position: "MID", number: 12, team: 'B' },
      { id: "p62", name: "Paolo B.", position: "MID", number: 13, team: 'B' },
      { id: "p63", name: "Davide B.", position: "FWD", number: 14, team: 'B' }
    ]
  }
];
