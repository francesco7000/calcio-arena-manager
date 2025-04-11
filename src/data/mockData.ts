
import { Match, Participant } from "@/types";

// Datos de ejemplo de participantes
const createParticipants = (): Participant[] => {
  return [
    { id: '1', name: 'Marco Rossi', position: 'GK', number: 1 },
    { id: '2', name: 'Luca Bianchi', position: 'DEF', number: 2 },
    { id: '3', name: 'Giovanni Verdi', position: 'DEF', number: 3 },
    { id: '4', name: 'Andrea Neri', position: 'DEF', number: 4 },
    { id: '5', name: 'Paolo Gialli', position: 'DEF', number: 5 },
    { id: '6', name: 'Alessandro Blu', position: 'MID', number: 6 },
    { id: '7', name: 'Roberto Viola', position: 'MID', number: 7 },
    { id: '8', name: 'Stefano Rosa', position: 'MID', number: 8 },
    { id: '9', name: 'Francesco Grigi', position: 'FWD', number: 9 },
    { id: '10', name: 'Davide Marroni', position: 'FWD', number: 10 },
  ];
};

const participants2 = [
  { id: '11', name: 'Fabio Rossi', position: 'GK', number: 1 },
  { id: '12', name: 'Antonio Bianchi', position: 'DEF', number: 2 },
  { id: '13', name: 'Leonardo Verdi', position: 'DEF', number: 3 },
  { id: '14', name: 'Simone Neri', position: 'DEF', number: 4 },
  { id: '15', name: 'Michele Gialli', position: 'DEF', number: 5 },
  { id: '16', name: 'Matteo Blu', position: 'MID', number: 6 },
  { id: '17', name: 'Nicola Viola', position: 'MID', number: 7 },
  { id: '18', name: 'Riccardo Rosa', position: 'MID', number: 8 },
];

// Datos de ejemplo de partidos
export const mockMatches: Match[] = [
  {
    id: '1',
    date: '2025-04-14', // Lunes
    time: '19:00',
    location: 'Centro Sportivo San Siro, Milano',
    organizer: 'Mario Rossi',
    totalParticipants: 10,
    currentParticipants: 10,
    price: 15,
    field: 'Campo A - San Siro',
    participants: createParticipants(),
  },
  {
    id: '2',
    date: '2025-04-16', // Miércoles
    time: '20:30',
    location: 'Centro Sportivo Giuriati, Milano',
    organizer: 'Luigi Verdi',
    totalParticipants: 10,
    currentParticipants: 8,
    price: 12,
    field: 'Campo Coperto - Giuriati',
    participants: participants2,
  },
  {
    id: '3',
    date: '2025-04-18', // Viernes
    time: '18:00',
    location: 'Centro Sportivo Brera, Milano',
    organizer: 'Paolo Bianchi',
    totalParticipants: 10,
    currentParticipants: 6,
    price: 10,
    field: 'Campo Centrale - Brera',
    participants: participants2.slice(0, 6),
  },
  {
    id: '4',
    date: '2025-04-20', // Domingo
    time: '10:00',
    location: 'Centro Sportivo Lombardia, Milano',
    organizer: 'Carlo Neri',
    totalParticipants: 10,
    currentParticipants: 4,
    price: 15,
    field: 'Campo B - Lombardia',
    participants: participants2.slice(0, 4),
  },
];
