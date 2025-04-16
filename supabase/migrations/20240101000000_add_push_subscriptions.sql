-- Aggiungi la tabella push_subscriptions al database
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  device_info JSONB,
  last_used TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);

-- Commento sulla tabella
COMMENT ON TABLE push_subscriptions IS 'Tabella per memorizzare le sottoscrizioni push degli utenti';
COMMENT ON COLUMN push_subscriptions.subscription IS 'JSON con i dati della sottoscrizione push';
COMMENT ON COLUMN push_subscriptions.device_info IS 'Informazioni sul dispositivo dell\'utente';

-- Trigger per aggiornare il timestamp updated_at
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_subscriptions_updated_at_trigger
BEFORE UPDATE ON push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_push_subscriptions_updated_at();