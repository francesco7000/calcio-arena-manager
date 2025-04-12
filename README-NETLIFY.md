# Guida al Deploy su Netlify

Questo documento fornisce istruzioni su come configurare e deployare l'applicazione Calcio Arena Manager su Netlify.

## Prerequisiti

- Un account Netlify
- Un account GitHub con il repository del progetto

## Passi per il Deploy

### 1. Connetti il Repository a Netlify

1. Accedi al tuo account Netlify
2. Clicca su "Add new site" > "Import an existing project"
3. Seleziona GitHub come provider
4. Autorizza Netlify ad accedere ai tuoi repository
5. Seleziona il repository `calcio-arena-manager`

### 2. Configura le Impostazioni di Build

Netlify dovrebbe rilevare automaticamente le impostazioni di build dal file `netlify.toml`, ma verifica che siano corrette:

- **Build command**: `npm run build`
- **Publish directory**: `dist`

### 3. Configura le Variabili d'Ambiente

È necessario configurare le stesse variabili d'ambiente presenti nel file `.env` locale:

1. Vai su "Site settings" > "Environment variables"
2. Aggiungi le seguenti variabili:
   - `VITE_SUPABASE_URL`: URL del tuo progetto Supabase
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Chiave pubblica del tuo progetto Supabase

### 4. Deploy

1. Clicca su "Deploy site"
2. Attendi che il processo di build e deploy sia completato

## Risoluzione dei Problemi

### Problemi di Routing

Se riscontri problemi con il routing (pagine 404 quando aggiorni o accedi direttamente a un URL):

1. Verifica che il file `netlify.toml` sia presente nella radice del progetto
2. Controlla che contenga la configurazione di redirect corretta:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Variabili d'Ambiente non Disponibili

Se l'app non riesce a connettersi a Supabase:

1. Verifica che le variabili d'ambiente siano state configurate correttamente in Netlify
2. Assicurati che i nomi delle variabili corrispondano esattamente a quelli utilizzati nell'app
3. Riavvia il deploy dopo aver aggiornato le variabili d'ambiente

## Aggiornamenti Futuri

Per aggiornare il sito dopo aver apportato modifiche al codice:

1. Effettua il push delle modifiche al repository GitHub
2. Netlify rileverà automaticamente le modifiche e avvierà un nuovo deploy

## Personalizzazione del Dominio

Per utilizzare un dominio personalizzato:

1. Vai su "Site settings" > "Domain management"
2. Clicca su "Add custom domain"
3. Segui le istruzioni per configurare il tuo dominio personalizzato