import { supabase } from "@/integrations/supabase/client";

export const PushNotificationService = {
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
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },

  /**
   * Verifica se l'utente ha concesso il permesso per le notifiche
   */
  async hasNotificationPermission() {
    if (!('Notification' in window)) return false;
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
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, options);
      return true;
    }
    
    return false;
  },

  /**
   * Inizializza il sistema di notifiche push
   */
  async initialize() {
    // Registra il service worker
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
      }
    });

    return true;
  }
};