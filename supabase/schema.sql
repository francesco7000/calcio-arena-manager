-- Rimuovi tutte le tabelle e i trigger esistenti
DROP TRIGGER IF EXISTS update_title_trigger ON matches;
DROP FUNCTION IF EXISTS update_title;

DROP TRIGGER IF EXISTS update_match_participants_count_trigger ON participants;
DROP TRIGGER IF EXISTS update_formations_updated_at_trigger ON formations;
DROP FUNCTION IF EXISTS update_match_participants_count;

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS formation CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS matches CASCADE;

DROP INDEX IF EXISTS formations_match_id_idx;

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
  position TEXT CHECK (
    position IN (
      'POR',  -- Portiere
      'DC',   -- Difensore Centrale
      'TS',   -- Terzino Sinistro
      'TD',   -- Terzino Destro
      'ES',   -- Esterno Sinistro
      'ED',   -- Esterno Destro
      'CDC',  -- Centrocampista Difensivo Centrale
      'CC',   -- Centrocampista Centrale
      'COC',  -- Centrocampista Offensivo Centrale
      'AS',   -- Ala Sinistra
      'AD',   -- Ala Destra
      'SP',   -- Seconda Punta
      'ATT'   -- Attaccante
    )
  ) NOT NULL,
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


-- Inserimento utenti di esempio
INSERT INTO users (username, password, admin) VALUES
('admin', 'admin', TRUE),
('ute1', 'pass1', FALSE),
('ute2', 'pass2', FALSE);

-- Aggiungi la tabella formations al database
CREATE TABLE IF NOT EXISTS formations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  positions JSONB NOT NULL DEFAULT '{}',
  UNIQUE(match_id)
);

-- Commento sulla tabella
COMMENT ON TABLE formations IS 'Tabella per memorizzare le formazioni delle partite';
COMMENT ON COLUMN formations.positions IS 'JSON con le posizioni dei giocatori sul campo';

-- Indice per migliorare le prestazioni delle query
CREATE INDEX formations_match_id_idx ON formations(match_id);

-- Trigger per aggiornare il timestamp updated_at
CREATE OR REPLACE FUNCTION update_formations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_formations_updated_at_trigger
BEFORE UPDATE ON formations
FOR EACH ROW
EXECUTE FUNCTION update_formations_updated_at();