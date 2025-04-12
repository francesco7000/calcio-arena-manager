-- Rimuovi tutte le tabelle e i trigger esistenti
DROP TRIGGER IF EXISTS update_title_trigger ON matches;
DROP FUNCTION IF EXISTS update_title;

DROP TRIGGER IF EXISTS update_match_participants_count_trigger ON participants;
DROP FUNCTION IF EXISTS update_match_participants_count;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS users;

-- Abilita le estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabella users (utenti)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  admin BOOLEAN DEFAULT FALSE
);

-- Tabella matches (partite)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  field TEXT NOT NULL,
  organizer TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  title TEXT,  -- Colonna separata per title
  UNIQUE(title)
);

-- Funzione e trigger per aggiornare il campo title
CREATE OR REPLACE FUNCTION update_title()
RETURNS TRIGGER AS $$
BEGIN
  NEW.title := NEW.field || ' - ' || NEW.date::TEXT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_title_trigger
BEFORE INSERT OR UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION update_title();

-- Tabella participants (partecipanti)
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT CHECK (position IN ('GK', 'DEF', 'MID', 'FWD')) NOT NULL,
  team TEXT CHECK (team IN ('A', 'B')),
  number INTEGER,
  UNIQUE(match_id, user_id)
);

-- Tabella notifications (notifiche)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  message TEXT,
  UNIQUE(match_id, user_id)
);

-- Funzione e trigger per aggiornare il conteggio dei partecipanti
CREATE OR REPLACE FUNCTION update_match_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE matches SET current_participants = current_participants + 1 WHERE id = NEW.match_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE matches SET current_participants = current_participants - 1 WHERE id = OLD.match_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_match_participants_count_trigger
AFTER INSERT OR DELETE ON participants
FOR EACH ROW
EXECUTE FUNCTION update_match_participants_count();

-- Dati di esempio

-- Inserimento partite di esempio
INSERT INTO matches (date, time, location, address, field, organizer, price, max_participants, current_participants) VALUES
('2025-04-15', '19:00', 'Centro Sportivo XYZ', 'Via del Campo 123, Milano', 'Campo Grande', 'Mario Rossi', 10.00, 10, 0),
('2025-04-16', '20:30', 'Stadio Comunale', 'Via dello Sport 45, Milano', 'Campo Centrale', 'Luca Bianchi', 12.50, 10, 0),
('2025-04-18', '18:45', 'Centro Sportivo Meridiana', 'Viale dei Giochi 78, Milano', 'Campo Piccolo', 'Antonio Verdi', 8.00, 12, 0),
('2025-04-20', '19:30', 'Stadio Olimpico', 'Piazza delle Vittorie 1, Roma', 'Campo Principale', 'Giorgio Neri', 15.00, 22, 0);

-- Inserimento partecipanti di esempio (per la prima partita)
INSERT INTO participants (match_id, user_id, name, position, number) VALUES
((SELECT id FROM matches WHERE field = 'Campo Grande' LIMIT 1), 'user-1', 'Marco', 'GK', 1),
((SELECT id FROM matches WHERE field = 'Campo Grande' LIMIT 1), 'user-2', 'Luigi', 'DEF', 2),
((SELECT id FROM matches WHERE field = 'Campo Grande' LIMIT 1), 'user-3', 'Giovanni', 'DEF', 3),
((SELECT id FROM matches WHERE field = 'Campo Grande' LIMIT 1), 'user-4', 'Paolo', 'MID', 4),
((SELECT id FROM matches WHERE field = 'Campo Grande' LIMIT 1), 'user-5', 'Roberto', 'MID', 5),
((SELECT id FROM matches WHERE field = 'Campo Grande' LIMIT 1), 'user-6', 'Alberto', 'MID', 6),
((SELECT id FROM matches WHERE field = 'Campo Grande' LIMIT 1), 'user-7', 'Davide', 'FWD', 7),
((SELECT id FROM matches WHERE field = 'Campo Grande' LIMIT 1), 'user-8', 'Stefano', 'FWD', 8);

-- Inserimento notifiche di esempio
INSERT INTO notifications (match_id, user_id, message) VALUES
((SELECT id FROM matches WHERE field = 'Campo Centrale' LIMIT 1), 'user-30', 'Si è liberato un posto per la partita'),
((SELECT id FROM matches WHERE field = 'Campo Piccolo' LIMIT 1), 'user-31', 'Si è liberato un posto per la partita');

-- Inserimento utenti di esempio
INSERT INTO users (username, password, admin) VALUES
('admin', 'admin', TRUE),
('ute1', 'pass1', FALSE),
('ute2', 'pass2', FALSE);
