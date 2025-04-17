import { supabase } from "@/integrations/supabase/client";

export const PushNotificationService = {
  /**
   * Verifica se il browser è Safari
   */
  isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  },

  /**
   * Verifica se il dispositivo è iOS
   */
  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  },

  /**
   * Verifica se stiamo usando Safari su iOS
   */
  isIOSSafari() {
    return this.isIOS() && this.isSafari();
  },
  
  /**
   * Verifica se le notifiche push sono supportate su questo dispositivo iOS
   */
  areIOSPushNotificationsSupported() {
    // Su iOS, le notifiche web push sono supportate solo in PWA mode
    // o in Safari 16.4+ su macOS/iOS
    const isPWA = this.isPWA();
    const isSafari = this.isSafari();
    
    // Verifica la versione di Safari (16.4+ supporta Web Push)
    let safariVersion = 0;
    if (isSafari) {
      const versionMatch = navigator.userAgent.match(/Version\/(\d+)/);
      if (versionMatch && versionMatch[1]) {
        safariVersion = parseInt(versionMatch[1], 10);
      }
    }
    
    
    // Le notifiche sono supportate se è una PWA o Safari 16.4+
    return isPWA || (isSafari && safariVersion >= 16.4);
  },

  /**
   * Verifica se l'app è in esecuzione in modalità standalone (PWA installata)
   */
  isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
  },

  /**
   * Registra il service worker per le notifiche push
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        return registration;
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  /**
   * Richiede il permesso per le notifiche push
   * @param userId ID dell'utente da utilizzare per la sottoscrizione (opzionale)
   * @param userObject Oggetto utente completo (opzionale, alternativo a userId)
   */
  async requestNotificationPermission(userId?: string, userObject?: any) {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      // Per Safari, potremmo dover forzare la visualizzazione del popup
      // Questo è particolarmente importante quando l'app è condivisa o installata come PWA
      if (this.isSafari() || this.isIOS()) {
        
        // Forza la visualizzazione del popup di richiesta permesso
        // Questo è necessario perché Safari potrebbe non mostrarlo automaticamente
        const permission = await Notification.requestPermission();
        
        // Salva l'impostazione nel localStorage per ricordare che l'utente ha dato il permesso
        if (permission === 'granted') {
          localStorage.setItem('notification_permission_safari', 'granted');
          
          // Registra il dispositivo nel database anche se Web Push non è supportato
          try {
            // Tenta di registrare il dispositivo nel database
            await this.subscribeUserToPush(userId, userObject);
          } catch (regError) {
            console.error('Errore durante la registrazione del dispositivo iOS:', regError);
          }
          
          // Mostra un messaggio per guidare l'utente ad abilitare le notifiche nelle impostazioni di Safari
          if (this.isIOS() && !this.isPWA()) {
            alert('Per ricevere notifiche su iPhone/iPad, assicurati di: 1. Abilitare le notifiche nelle Impostazioni di iOS 2. Andare su Impostazioni > Safari > Notifiche 3. Attivare "Consenti notifiche" per questo sito');
          }
        } else if (permission === 'denied') {
          // Se l'utente ha negato il permesso, mostra un messaggio informativo
          alert('Hai negato il permesso per le notifiche. Per riceverle, dovrai abilitarle nelle impostazioni del browser.');
        }
        
        return permission === 'granted';
      } else {
        // Per gli altri browser, procediamo normalmente
        const permission = await Notification.requestPermission();
        
        // Se il permesso è stato concesso, registra la sottoscrizione
        if (permission === 'granted') {
          try {
            await this.subscribeUserToPush(userId, userObject);
          } catch (regError) {
            console.error('Errore durante la registrazione della sottoscrizione:', regError);
          }
        }
        
        return permission === 'granted';
      }
    } catch (error) {
      console.error('Errore durante la richiesta di permesso per le notifiche:', error);
      return false;
    }
  },

  /**
   * Verifica se le notifiche push sono supportate e abilitate
   */
  async arePushNotificationsSupported() {
    // Per Safari/iOS, controlliamo se l'utente ha dato il permesso in precedenza
    if (this.isSafari() || this.isIOS()) {
      return 'Notification' in window && 
        (Notification.permission === 'granted' || 
         localStorage.getItem('notification_permission_safari') === 'granted');
    }
    
    // Per gli altri browser, verifichiamo il supporto standard
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },

  /**
   * Verifica se l'utente ha concesso il permesso per le notifiche
   */
  async hasNotificationPermission() {
    if (!('Notification' in window)) return false;
    
    // Per Safari/iOS, controlliamo anche il localStorage
    if (this.isSafari() || this.isIOS()) {
      return Notification.permission === 'granted' || 
             localStorage.getItem('notification_permission_safari') === 'granted';
    }
    
    return Notification.permission === 'granted';
  },

  /**
   * Invia una notifica push locale (senza server)
   * @param title Titolo della notifica
   * @param options Opzioni della notifica
   */
  async sendLocalNotification(title: string, options: NotificationOptions) {
    if (!('Notification' in window)) return false;
    
    if (Notification.permission === 'granted') {
      // Per Safari/iOS, utilizziamo l'API Notification direttamente
      if (this.isSafari() || this.isIOS()) {
        try {
          // Se siamo in una PWA, le notifiche potrebbero funzionare meglio con il service worker
          const isPWA = this.isPWA();
          
          // Prova a utilizzare il service worker se disponibile
          if ('serviceWorker' in navigator) {
            try {
              const registration = await navigator.serviceWorker.ready;
              
              // Aggiungiamo opzioni specifiche per iOS
              const enhancedOptions = {
                ...options,
                renotify: true, // Forza la notifica anche se esiste già una con lo stesso tag
                requireInteraction: true, // Mantiene la notifica visibile fino all'interazione dell'utente
                silent: false // Assicura che la notifica emetta un suono
              };
              
              // Invia un messaggio al service worker per mostrare la notifica
              registration.active?.postMessage({
                type: 'PUSH_NOTIFICATION',
                payload: {
                  title: title,
                  body: enhancedOptions.body,
                  icon: enhancedOptions.icon,
                  badge: enhancedOptions.badge,
                  data: enhancedOptions.data,
                  tag: enhancedOptions.tag,
                  renotify: enhancedOptions.renotify,
                  requireInteraction: enhancedOptions.requireInteraction,
                  silent: enhancedOptions.silent
                }
              });
              
              // Se siamo in PWA su iOS, proviamo anche a mostrare la notifica direttamente
              if (isPWA) {
                try {
                  await registration.showNotification(title, enhancedOptions);
                } catch (e) {
                  new Notification(title, enhancedOptions);
                }
              }
              
              return true;
            } catch (swError) {
              // Fallback all'API Notification nativa
              new Notification(title, options);
              return true;
            }
          } else {
            // Fallback all'API Notification nativa
            new Notification(title, options);
            return true;
          }
        } catch (error) {
          console.error('Errore durante l\'invio della notifica su Safari/iOS:', error);
          return false;
        }
      } else {
        // Per gli altri browser, utilizziamo il service worker
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, options);
        return true;
      }
    }
    
    return false;
  },

  /**
   * Inizializza il sistema di notifiche push
   * @param userId ID dell'utente da utilizzare per la sottoscrizione (opzionale)
   * @param userObject Oggetto utente completo (opzionale, alternativo a userId)
   */
  async initialize(userId?: string, userObject?: any) {
    // Registra il service worker indipendentemente dal browser
    const registration = await this.registerServiceWorker();
    
    // Per Safari/iOS, gestiamo le notifiche in modo diverso
    if (this.isSafari() || this.isIOS()) {
      
      // Verifica se siamo in modalità PWA
      const isPWA = this.isPWA();
      
      // Verifica se l'utente ha già dato il permesso
      const currentPermission = Notification.permission;
      const savedPermission = localStorage.getItem('notification_permission_safari');
      
      // Tenta di registrare il dispositivo nel database anche se non abbiamo ancora il permesso
      // Questo è importante per iOS dove Web Push potrebbe non essere supportato
      try {
        await this.subscribeUserToPush(userId, userObject);
      } catch (regError) {
        console.error('Errore durante la registrazione iniziale del dispositivo iOS:', regError);
        // Continuiamo comunque con l'inizializzazione
      }
      
      // Richiedi sempre il permesso all'avvio dell'app se non è già stato concesso
      // Questo è fondamentale per Safari che potrebbe non mostrare il popup automaticamente
      if (currentPermission !== 'granted' && savedPermission !== 'granted') {
        const hasPermission = await this.requestNotificationPermission(userId, userObject);
        if (!hasPermission) return false;
      }
      
      // Anche su Safari/iOS proviamo a registrare il service worker
      // per supportare le notifiche push quando possibile
      if (registration) {
        try {
          // Prova a sottoscrivere l'utente alle notifiche push
          await this.subscribeUserToPush(userId, userObject);
          

        } catch (error) {
          // Continuiamo comunque perché possiamo usare le notifiche base
        }
      }
      
      return true;
    }
    
    // Per gli altri browser, procediamo con la configurazione standard
    if (!registration) return false;

    // Richiedi il permesso per le notifiche se non è già stato concesso
    const currentPermission = Notification.permission;
    if (currentPermission !== 'granted') {
      const hasPermission = await this.requestNotificationPermission(userId, userObject);
      if (!hasPermission) return false;
    }

    // Configura l'ascolto dei messaggi dal service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        // Gestisci il click sulla notifica
        
        // Puoi aggiungere qui la logica per navigare alla pagina corretta
        // ad esempio usando window.location o un router
      } else if (event.data && event.data.type === 'PUSH_SUBSCRIPTION_CHANGED') {
        // Gestisci il cambio di sottoscrizione push
        
        // Aggiorna la sottoscrizione nel database
        if (event.data.payload.newSubscription) {
          this.updatePushSubscriptionInDatabase(event.data.payload.newSubscription, userId, userObject);
        }
      }
    });

    // Sottoscrivi l'utente alle notifiche push
    await this.subscribeUserToPush(userId, userObject);

    return true;
  },

  /**
   * Aggiorna la sottoscrizione push nel database
   * @param subscription La nuova sottoscrizione push
   * @param userId ID dell'utente da utilizzare per la sottoscrizione (opzionale)
   * @param userObject Oggetto utente completo (opzionale, alternativo a userId)
   */
  async updatePushSubscriptionInDatabase(subscription: PushSubscription | null, userId?: string, userObject?: any) {
    try {
      // Se è stato fornito direttamente l'ID utente, utilizziamo quello
      if (userId) {
      } 
      // Se è stato fornito l'oggetto utente, utilizziamo il suo ID
      else if (userObject && userObject.id) {
        userId = userObject.id;
      }
      // Altrimenti, tentiamo di recuperare l'utente dal localStorage
      else {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            userId = parsedUser.id;
          } catch (error) {
            console.error('Errore nel parsing dell\'utente dal localStorage:', error);
          }
        }
        
        // Se non abbiamo trovato l'utente nel localStorage, proviamo con Supabase
        if (!userId) {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session || !session.user) {
            console.error('Utente non autenticato, impossibile salvare la subscription');
            return null;
          }
          
          // Ottieni l'ID UUID dell'utente dalla tabella users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('username', session.user.email || session.user.id)
            .single();
          
          if (userError || !userData) {
            console.error('Errore durante il recupero dell\'ID utente:', userError);
            return false;
          }
          
          userId = userData.id;
        }
      }
      
      
      // Aggiorna la subscription nel database Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId, // Usa l'ID UUID dalla tabella users o dal localStorage
          subscription: subscription ? JSON.stringify(subscription) : null,
          device_info: {
            is_safari: this.isSafari(),
            is_ios: this.isIOS(),
            is_pwa: this.isPWA(),
            user_agent: navigator.userAgent
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) {
        // Aggiungi log dettagliati per tracciare il flusso di esecuzione e identificare eventuali errori durante il processo di salvataggio
        console.error('Errore durante l\'aggiornamento della subscription:', error);
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error('Errore durante l\'aggiornamento della subscription push:', error);
      return false;
    }
  },
  
  /**
   * Sottoscrive l'utente alle notifiche push Web Push (VAPID)
   * e salva la subscription nel database Supabase
   * @param userId ID dell'utente da utilizzare per la sottoscrizione (opzionale)
   * @param userObject Oggetto utente completo (opzionale, alternativo a userId)
   */
  async subscribeUserToPush(userId?: string, userObject?: any) {
    // Per iOS/Safari, controlliamo se siamo in una PWA
    if (this.isIOS() && this.isPWA()) {
    }
    
    // Verifica supporto Web Push
    const isWebPushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    
    // Se è stato fornito direttamente l'ID utente o l'oggetto utente, utilizziamo quello
    if (userId) {
      const userData = { id: userId };
      return this.continueSubscription(userData, isWebPushSupported);
    } else if (userObject && userObject.id) {
      const userData = { id: userObject.id };
      return this.continueSubscription(userData, isWebPushSupported);
    }
    
    // Altrimenti, tentiamo di recuperare l'utente dal localStorage
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      // Prova comunque a ottenere la sessione da Supabase come fallback
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        console.error('Utente non autenticato, impossibile salvare la subscription');
        return null;
      }
      
      // Ottieni l'ID UUID dell'utente dalla tabella users usando la sessione Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', session.user.email || session.user.id)
        .single();
      
      if (userError || !userData) {
        console.error('Errore durante il recupero dell\'ID utente:', userError);
        return null;
      }
      
      return this.continueSubscription(userData, isWebPushSupported);
    } else {
      // Usa l'utente dal localStorage
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // L'ID è già disponibile nel localStorage, non serve fare query
        const userData = { id: parsedUser.id };
        return this.continueSubscription(userData, isWebPushSupported);
      } catch (error) {
        console.error('Errore nel parsing dell\'utente dal localStorage:', error);
        return null;
      }
    }
  },
  
  /**
   * Continua il processo di sottoscrizione dopo aver ottenuto l'utente
   * @param userData Dati dell'utente con ID
   * @param isWebPushSupported Se Web Push è supportato
   */
  async continueSubscription(userData, isWebPushSupported) {
    
    // Se Web Push non è supportato (come su Safari iOS non-PWA),
    // registriamo comunque il dispositivo nel database
    if (!isWebPushSupported) {
      console.warn('Web Push non supportato su questo browser, registrazione base del dispositivo.');
      
      // Registra il dispositivo senza subscription push
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userData.id,
          subscription: null, // Nessuna subscription disponibile
          device_info: {
            is_safari: this.isSafari(),
            is_ios: this.isIOS(),
            is_pwa: this.isPWA(),
            user_agent: navigator.userAgent
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      
      return null;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      // Chiave pubblica VAPID fornita dall'utente
      const VAPID_PUBLIC_KEY = "BBGAMOeHjZf5t_y2nWMCcy0db4UTQ1d7xEux-hqmdnM_zy_WbzQUeWhf_owBr7P4GQ0PtBanwhQ-_8ySxTmTse8";
      if (!VAPID_PUBLIC_KEY) {
        console.error('Chiave pubblica VAPID non configurata.');
        return null;
      }
      // Verifica se esiste già una sottoscrizione
      let subscription = await registration.pushManager.getSubscription();
      let isNewSubscription = false;
      // Se non esiste, crea una nuova sottoscrizione
      if (!subscription) {
        const convertedVapidKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
        isNewSubscription = true;
      }
      // Salva la subscription nel database Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userData.id, // Usa l'ID UUID dalla tabella users
          subscription: JSON.stringify(subscription),
          device_info: {
            is_safari: this.isSafari(),
            is_ios: this.isIOS(),
            user_agent: navigator.userAgent
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString() // Aggiungiamo un timestamp di aggiornamento
        }, { onConflict: 'user_id' });
      if (error) {
      } else {
        if (isNewSubscription && (this.isSafari() || this.isIOS())) {
          await this.sendLocalNotification('Calcio Arena', {
            body: 'Le notifiche sono state attivate con successo!',
            icon: '/icon-192.png'
          });
        }
      }
      return subscription;
    } catch (error) {
      return null;
    }
  },

  /**
   * Utility per convertire la chiave VAPID da base64 a Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
};
