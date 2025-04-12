# Schema SQL per Calcio Arena Manager

## Panoramica

Questo documento descrive lo schema SQL creato per l'applicazione Calcio Arena Manager. Lo schema è progettato per essere utilizzato con Supabase e include tutte le tabelle necessarie per gestire partite di calcio, partecipanti e notifiche.

## Struttura del Database

### Tabella `matches`

Contiene i dettagli delle partite di calcio.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Chiave primaria, generata automaticamente |
| created_at | TIMESTAMP | Data e ora di creazione del record |
| date | DATE | Data della partita |
| time | TIME | Orario della partita |
| location | TEXT | Luogo della partita (es. Centro Sportivo) |
| address | TEXT | Indirizzo completo del luogo |
| field | TEXT | Nome del campo specifico |
| organizer | TEXT | Nome dell'organizzatore della partita |
| price | DECIMAL | Quota di partecipazione |
| max_participants | INTEGER | Numero massimo di partecipanti |
| current_participants | INTEGER | Numero attuale di partecipanti |
| status | TEXT | Stato della partita (scheduled, in_progress, completed, cancelled) |
| title | TEXT | Campo generato automaticamente (field + data) |

### Tabella `participants`

Contiene i dettagli dei partecipanti alle partite.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Chiave primaria, generata automaticamente |
| created_at | TIMESTAMP | Data e ora di creazione del record |
| match_id | UUID | Riferimento alla partita (chiave esterna) |
| user_id | TEXT | ID dell'utente partecipante |
| name | TEXT | Nome del partecipante |
| position | TEXT | Ruolo del giocatore (GK, DEF, MID, FWD) |
| team | TEXT | Squadra del giocatore (A o B) |
| number | INTEGER | Numero di maglia |

### Tabella `notifications`

Contiene le notifiche per gli utenti.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | Chiave primaria, generata automaticamente |
| created_at | TIMESTAMP | Data e ora di creazione del record |
| match_id | UUID | Riferimento alla partita (chiave esterna) |
| user_id | TEXT | ID dell'utente destinatario |
| is_read | BOOLEAN | Indica se la notifica è stata letta |
| message | TEXT | Messaggio della notifica |

## Funzionalità Speciali

### Trigger per il conteggio dei partecipanti

È stato implementato un trigger che aggiorna automaticamente il campo `current_participants` nella tabella `matches` quando un partecipante viene aggiunto o rimosso.

## Come Utilizzare lo Schema

1. Accedi al tuo progetto Supabase
2. Vai alla sezione "SQL Editor"
3. Copia e incolla il contenuto del file `schema.sql`
4. Esegui lo script

Questo creerà tutte le tabelle necessarie e inserirà alcuni dati di esempio per iniziare a testare l'applicazione.

## Dati di Esempio

Lo schema include l'inserimento di:
- 4 partite di esempio
- Partecipanti per le prime tre partite
- Alcune notifiche di esempio

Questi dati possono essere utilizzati per testare l'applicazione senza dover inserire manualmente i dati.