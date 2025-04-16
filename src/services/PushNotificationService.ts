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
    
    console.log('Verifica supporto notifiche iOS:', { isPWA, isSafari, safariVersion });
    
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
        console.log('Service Worker registrato con successo:', registration);
        return registration;
      } catch (error) {
        console.error('Errore durante la registrazione del Service Worker:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Richiede il permesso per le notifiche push
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('Questo browser non supporta le notifiche desktop');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      // Se siamo su iOS/Safari, mostriamo un messaggio aggiuntivo per guidare l'utente
      if (permission === 'granted' && (this.isSafari() || this.isIOS())) {
        // Salva l'impostazione nel localStorage per ricordare che l'utente ha dato il permesso
        localStorage.setItem('notification_permission_safari', 'granted');
        
        // Mostra un messaggio per guidare l'utente ad abilitare le notifiche nelle impostazioni di Safari
        if (this.isIOS()) {
          alert('Per ricevere notifiche su iPhone/iPad, assicurati di: 1. Abilitare le notifiche nelle Impostazioni di iOS 2.  Andare su Impostazioni > Safari > Notifiche 3. Attivare "Consenti notifiche" per questo sito');
        }
      }
      
      return permission === 'granted';
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
              console.log('Service worker pronto, invio notifica tramite SW');
              
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
                  console.log('Fallback a notifica nativa in PWA');
                  new Notification(title, enhancedOptions);
                }
              }
              
              return true;
            } catch (swError) {
              console.log('Service worker non disponibile, utilizzo notifica nativa:', swError);
              // Fallback all'API Notification nativa
              new Notification(title, options);
              return true;
            }
          } else {
            // Fallback all'API Notification nativa
            console.log('Service worker non supportato, utilizzo notifica nativa');
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
   */
  async initialize() {
    // Per Safari/iOS, gestiamo le notifiche in modo diverso
    if (this.isSafari() || this.isIOS()) {
      // Richiedi il permesso per le notifiche
      const hasPermission = await this.requestNotificationPermission();
      if (!hasPermission) return false;
      
      // Se l'app è installata come PWA, le notifiche potrebbero funzionare meglio
      const isPWA = this.isPWA();
      if (isPWA) {
        console.log('App in esecuzione come PWA, le notifiche potrebbero funzionare meglio');
      }
      
      // Anche su Safari/iOS proviamo a registrare il service worker
      // per supportare le notifiche push quando possibile
      try {
        const registration = await this.registerServiceWorker();
        if (registration) {
          // Prova a sottoscrivere l'utente alle notifiche push
          await this.subscribeUserToPush();
          
          // Invia una notifica di test per verificare la configurazione
          setTimeout(() => {
            this.sendLocalNotification('Test Notifica', {
              body: 'Questa è una notifica di test per verificare la configurazione',
              icon: '/icon-192.png',
              tag: 'test-notification'
            });
          }, 2000);
        }
      } catch (error) {
        console.log('Service Worker non supportato su Safari/iOS, utilizziamo le notifiche base');
        // Continuiamo comunque perché possiamo usare le notifiche base
      }
      
      return true;
    }
    
    // Per gli altri browser, procediamo con il service worker
    const registration = await this.registerServiceWorker();
    if (!registration) return false;

    // Richiedi il permesso per le notifiche
    const hasPermission = await this.requestNotificationPermission();
    if (!hasPermission) return false;

    // Configura l'ascolto dei messaggi dal service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        // Gestisci il click sulla notifica
        console.log('Notifica cliccata:', event.data.payload);
        
        // Puoi aggiungere qui la logica per navigare alla pagina corretta
        // ad esempio usando window.location o un router
      } else if (event.data && event.data.type === 'PUSH_SUBSCRIPTION_CHANGED') {
        // Gestisci il cambio di sottoscrizione push
        console.log('Sottoscrizione push cambiata, aggiornamento nel database');
        
        // Aggiorna la sottoscrizione nel database
        if (event.data.payload.newSubscription) {
          this.updatePushSubscriptionInDatabase(event.data.payload.newSubscription);
        }
      }
    });

    // Sottoscrivi l'utente alle notifiche push
    await this.subscribeUserToPush();

    return true;
  },

  /**
   * Sottoscrive l'utente alle notifiche push Web Push (VAPID)
   * e salva la subscription nel database Supabase
   */
  /**
   * Aggiorna la sottoscrizione push nel database
   * @param subscription La nuova sottoscrizione push
   */
  async updatePushSubscriptionInDatabase(subscription: PushSubscription) {
    try {
      // Ottieni l'utente corrente da Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('Utente non autenticato, impossibile aggiornare la subscription');
        return false;
      }
      
      // Aggiorna la subscription nel database Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          subscription: JSON.stringify(subscription),
          device_info: {
            is_safari: this.isSafari(),
            is_ios: this.isIOS(),
            user_agent: navigator.userAgent
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Errore durante l\'aggiornamento della subscription:', error);
        return false;
      } else {
        console.log('Subscription aggiornata con successo per l\'utente:', user.id);
        return true;
      }
    } catch (error) {
      console.error('Errore durante l\'aggiornamento della subscription push:', error);
      return false;
    }
  },
  
  async subscribeUserToPush() {
    // Per iOS/Safari, controlliamo se siamo in una PWA
    if (this.isIOS() && this.isPWA()) {
      console.log('Dispositivo iOS in modalità PWA, tentativo di registrazione push...');
    }
    
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Web Push non supportato su questo browser.');
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
      
      // Se non esiste, crea una nuova sottoscrizione
      if (!subscription) {
        console.log('Creazione di una nuova sottoscrizione push...');
        const convertedVapidKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
        console.log('Nuova sottoscrizione push creata:', subscription);
      } else {
        console.log('Sottoscrizione push esistente trovata:', subscription);
      }
      
      // Ottieni l'utente corrente da Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('Utente non autenticato, impossibile salvare la subscription');
        return null;
      }
      
      // Salva la subscription nel database Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
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
        console.error('Errore durante il salvataggio della subscription:', error);
      } else {
        console.log('Subscription salvata con successo per l\'utente:', user.id);
        
        // Per iOS/Safari, inviamo una notifica di test per verificare che funzioni
        if (this.isSafari() || this.isIOS()) {
          await this.sendLocalNotification('Calcio Arena', {
            body: 'Le notifiche sono state attivate con successo!',
            icon: '/icon-192.png'
          });
        }
      }
      
      return subscription;
    } catch (error) {
      console.error('Errore durante la sottoscrizione Web Push:', error);
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
  },
};