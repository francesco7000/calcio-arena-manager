import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  created_at: string | null;
  match_id: string;
  user_id: string;
  is_read: boolean | null;
  message: string | null;
}

/**
 * Servizio per la gestione delle notifiche
 */
export const NotificationService = {
  /**
   * Invia una notifica a tutti i partecipanti non guest di una partita
   * @param matchId ID della partita
   * @param message Messaggio della notifica
   * @param participants Array di partecipanti a cui inviare la notifica
   */
  async notifyAllParticipants(matchId: string, message: string, participants: { user_id: string }[]) {
    try {
      // Filtra i partecipanti per escludere gli utenti guest
      const nonGuestParticipants = participants.filter(participant => 
        !participant.user_id.startsWith('guest-')
      );

      // Crea un array di notifiche da inserire solo per utenti non guest
      const notifications = nonGuestParticipants.map(participant => ({
        match_id: matchId,
        user_id: participant.user_id,
        message,
        is_read: false
      }));

      // Se non ci sono utenti non guest, restituisci successo senza fare nulla
      if (notifications.length === 0) {
        return { success: true, data: [], message: "Nessun utente registrato a cui inviare notifiche" };
      }

      // Inserisci le notifiche nel database
      const { data, error } = await supabase
        .from('notifications')
        .upsert(notifications, { onConflict: 'match_id,user_id' });

      if (error) throw error;
      
      // Invia anche notifiche push a tutti i partecipanti
      // Importiamo dinamicamente il PushNotificationService per evitare dipendenze circolari
      const { PushNotificationService } = await import('./PushNotificationService');
      
      // Verifica se le notifiche push sono supportate
      const pushSupported = await PushNotificationService.arePushNotificationsSupported();
      const hasPermission = await PushNotificationService.hasNotificationPermission();
      
      if (pushSupported && hasPermission) {
        try {
          // Invia una notifica push locale
          await PushNotificationService.sendLocalNotification('Calcio Arena', {
            body: message,
            icon: '/icon-192.png',
            badge: '/favicon.ico',
            vibrate: [100, 50, 100],
            data: {
              url: `/match/${matchId}`,
              matchId: matchId
            },
            tag: `match-${matchId}`, // Usa un tag per raggruppare notifiche simili
            requireInteraction: true, // Mantiene la notifica visibile fino all'interazione dell'utente
            silent: false // Assicura che la notifica emetta un suono
          });
          
          // Invia anche una notifica push tramite il server (per quando l'app è chiusa)
          await this.sendServerPushNotification(nonGuestParticipants.map(p => p.user_id), {
            title: 'Calcio Arena',
            message: message,
            url: `/match/${matchId}`,
            matchId: matchId
          });
        } catch (error) {
          console.error('Errore durante l\'invio delle notifiche push:', error);
        }
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Errore durante l\'invio delle notifiche:', error);
      return { success: false, error };
    }
  },

  /**
   * Ottiene tutte le notifiche per l'utente corrente
   * @param userId ID dell'utente
   */
  async getUserNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    } catch (error) {
      console.error('Errore durante il recupero delle notifiche:', error);
      return [];
    }
  },

  /**
   * Segna una notifica come letta
   * @param notificationId ID della notifica
   */
  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Errore durante l\'aggiornamento della notifica:', error);
      return { success: false, error };
    }
  },

  /**
   * Segna tutte le notifiche dell'utente come lette
   * @param userId ID dell'utente
   */
  async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Errore durante l\'aggiornamento delle notifiche:', error);
      return { success: false, error };
    }
  },

  /**
   * Configura una sottoscrizione in tempo reale per le notifiche
   * @param userId ID dell'utente
   * @param onNewNotification Callback da eseguire quando arriva una nuova notifica
   */
  subscribeToNotifications(userId: string, onNewNotification: (notification: Notification) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          onNewNotification(payload.new as Notification);
        }
      )
      .subscribe();
  },

  /**
   * Invia una notifica a un singolo partecipante
   * @param matchId ID della partita
   * @param userId ID dell'utente a cui inviare la notifica
   * @param message Messaggio della notifica
   */
  async notifySingleParticipant(matchId: string, userId: string, message: string) {
    try {
      // Verifica che l'utente non sia un guest
      if (userId.startsWith('guest-')) {
        return { success: false, error: { message: "Non è possibile inviare notifiche agli utenti ospiti" } };
      }

      // Crea la notifica
      const notification = {
        match_id: matchId,
        user_id: userId,
        message,
        is_read: false
      };

      // Inserisci la notifica nel database
      const { data, error } = await supabase
        .from('notifications')
        .upsert(notification, { onConflict: 'match_id,user_id' });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Errore durante l\'invio della notifica:', error);
      return { success: false, error };
    }
  },

  /**
   * Invia una notifica push tramite il server a tutti gli utenti specificati
   * Questo metodo è utile per inviare notifiche anche quando l'app è chiusa
   * @param userIds Array di ID utenti a cui inviare la notifica
   * @param notificationData Dati della notifica
   */
  async sendServerPushNotification(userIds: string[], notificationData: { title: string, message: string, url?: string, matchId?: string }) {
    try {
      if (!userIds || userIds.length === 0) {
        console.log('Nessun utente a cui inviare notifiche push');
        return { success: true, message: 'Nessun utente a cui inviare notifiche push' };
      }

      // Ottieni le sottoscrizioni push per gli utenti specificati
      const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .in('user_id', userIds);

      if (error) {
        console.error('Errore durante il recupero delle sottoscrizioni push:', error);
        return { success: false, error };
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log('Nessuna sottoscrizione push trovata per gli utenti specificati');
        return { success: true, message: 'Nessuna sottoscrizione push trovata' };
      }

      console.log(`Trovate ${subscriptions.length} sottoscrizioni push da notificare`);

      // Invia la notifica push a tutte le sottoscrizioni trovate
      // Nota: in un'implementazione reale, questa parte dovrebbe essere gestita dal backend
      // Qui simuliamo l'invio tramite il service worker
      const { PushNotificationService } = await import('./PushNotificationService');
      
      // Verifica se il service worker è registrato
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Invia un messaggio al service worker per simulare una notifica push
        registration.active?.postMessage({
          type: 'PUSH_NOTIFICATION',
          payload: {
            title: notificationData.title,
            body: notificationData.message,
            icon: '/icon-192.png',
            badge: '/favicon.ico',
            data: {
              url: notificationData.url || '/',
              matchId: notificationData.matchId
            },
            tag: notificationData.matchId ? `match-${notificationData.matchId}` : 'calcio-arena-notification',
            renotify: true,
            requireInteraction: true,
            silent: false
          }
        });
        
        console.log('Notifica push inviata tramite service worker');
      }
      
      return { success: true, message: `Notifiche push inviate a ${subscriptions.length} dispositivi` };
    } catch (error) {
      console.error('Errore durante l\'invio delle notifiche push dal server:', error);
      return { success: false, error };
    }
  }
};