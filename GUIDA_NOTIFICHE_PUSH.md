# Guida all'attivazione delle notifiche push con Supabase

Questa guida ti mostrerà le azioni che devi eseguire manualmente per configurare le notifiche push per l'applicazione Calcio Arena utilizzando Supabase.

## Azioni da eseguire

### 1. Configurazione del database Supabase

#### Creazione della tabella push_subscriptions

1. Accedi alla dashboard di Supabase
2. Vai alla sezione "SQL Editor"
3. Esegui la seguente query SQL:

```sql
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
```

4. Verifica che la tabella sia stata creata correttamente nella sezione "Table Editor"

#### Configurazione delle politiche di sicurezza (RLS)

1. Vai alla sezione "Authentication" > "Policies"
2. Seleziona la tabella `push_subscriptions`
3. Abilita RLS cliccando su "Enable RLS"
4. Crea le seguenti politiche:

   a. **Politica di inserimento**:
   - Nome: `Allow users to insert their own subscriptions`
   - Comando: `INSERT`
   - Espressione USING: `auth.uid() = user_id`

   b. **Politica di lettura**:
   - Nome: `Allow users to read their own subscriptions`
   - Comando: `SELECT`
   - Espressione USING: `auth.uid() = user_id`

   c. **Politica di aggiornamento**:
   - Nome: `Allow users to update their own subscriptions`
   - Comando: `UPDATE`
   - Espressione USING: `auth.uid() = user_id`

   d. **Politica di eliminazione**:
   - Nome: `Allow users to delete their own subscriptions`
   - Comando: `DELETE`
   - Espressione USING: `auth.uid() = user_id`

### 2. Configurazione delle chiavi VAPID

1. Genera le chiavi VAPID utilizzando il seguente comando:

```bash
npx web-push generate-vapid-keys
```

2. Salva le chiavi pubbliche e private generate

3. Aggiungi le chiavi alle variabili d'ambiente del tuo progetto Supabase:
   - Vai alla dashboard di Supabase
   - Seleziona "Settings" > "API"
   - Scorri fino a "Project API keys"
   - Aggiungi le seguenti variabili d'ambiente:
     - `VAPID_PUBLIC_KEY`: La tua chiave pubblica VAPID
     - `VAPID_PRIVATE_KEY`: La tua chiave privata VAPID
     - `VAPID_SUBJECT`: Un'email di contatto (es. `mailto:tuo@email.com`)

### 3. Creazione di una Edge Function per l'invio delle notifiche

1. Installa Supabase CLI se non l'hai già fatto:

```bash
npm install -g supabase
```

2. Inizializza le funzioni Supabase nel tuo progetto:

```bash
supabase functions new send-push-notification
```

3. Modifica il file della funzione (`supabase/functions/send-push-notification/index.ts`) con il codice fornito nell'applicazione

4. Implementa la funzione su Supabase:

```bash
supabase functions deploy send-push-notification
```

### 4. Test delle notifiche push

1. Accedi all'applicazione con un utente registrato
2. Vai al profilo utente e abilita le notifiche push quando richiesto
3. Verifica che la sottoscrizione sia stata salvata nella tabella `push_subscriptions`
4. Crea una partita di test
5. Aggiungi alcuni partecipanti
6. Utilizza il pulsante "Notifica utenti registrati" nella pagina della partita
7. Verifica che la notifica venga ricevuta sui dispositivi registrati

### Risoluzione dei problemi comuni

- Se le notifiche non vengono ricevute, verifica che le sottoscrizioni siano state salvate correttamente nel database
- Controlla che le chiavi VAPID siano configurate correttamente nelle variabili d'ambiente
- Verifica i log della Edge Function per eventuali errori
- Ricorda che su iOS/Safari le notifiche push web sono supportate solo in Safari 16.4+ o in modalità PWA