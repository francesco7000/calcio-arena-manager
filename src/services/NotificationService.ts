import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from '@supabase/supabase-js'


export interface Notification {
  id: string;
  created_at: string | null;
  match_id: string;
  user_id: string;
  is_read: boolean | null;
  message: string | null;
}

// Remove the redefinition of supabase
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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
          /* Invia una notifica push locale
          await PushNotificationService.sendLocalNotification('Calcio Arena', {
            body: message,
            icon: '/icon-192.png',
            badge: '/favicon.ico',
            //vibrate: [100, 50, 100],
            data: {
              url: `/match/${matchId}`,
              matchId: matchId
            },
            tag: `match-${matchId}`, // Usa un tag per raggruppare notifiche simili
            requireInteraction: true, // Mantiene la notifica visibile fino all'interazione dell'utente
            silent: false // Assicura che la notifica emetta un suono
          });
          */
          
          // Invia anche una notifica push tramite il server (per quando l'app è chiusa)
          await this.sendServerPushNotification(nonGuestParticipants.map(p => p.user_id), {
            title: 'Calcio Arena',
            message: message,
            //url: `/match/${matchId}`,
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

      if (error) {
        console.error('Errore durante l\'inserimento della notifica nel database:', error);
        throw error;
      }
      
      // Invia anche una notifica push
      try {
        // Importiamo dinamicamente il PushNotificationService per evitare dipendenze circolari
        const { PushNotificationService } = await import('./PushNotificationService');
        
        // Invia notifica push tramite il server
        await this.sendServerPushNotification([userId], {
          title: 'Calcio Arena',
          message: message,
          //url: `/match/${matchId}`,
          matchId: matchId
        });
      } catch (pushError) {
        console.error('Errore durante l\'invio della notifica push:', pushError);
        // Non blocchiamo il flusso se la notifica push fallisce
      }
      
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
        return { success: true, message: 'Nessun utente a cui inviare notifiche push' };
      }
      
      const nonGuestUserIds = userIds.filter(id => !id.startsWith('guest-'));
      
      if (nonGuestUserIds.length === 0) {
        return { success: true, message: 'Nessun utente non guest a cui inviare notifiche push' };
      }
      

      const subscriptions = await this.getPushSubscriptionsByUserIds(nonGuestUserIds);

      if (subscriptions.length === 0) {
        return { success: true, message: 'Nessuna subscription valida' };
      }
    


      const testData = { subscriptions:  subscriptions.map(s => s.subscription) , notification: notificationData};

      const body = JSON.stringify(testData);
      
      // Get your Supabase URL and anon key from your project settings
      const SUPABASE_URL = 'https://hancogrsqrajdxmontft.supabase.co';
      const SUPABASE_ANON_KEY = 'c35240a19eb0e33d874587d6f8b9d21775899297e5eec76531b5bc562a5a65eb';
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Length': body.length.toString()
        },
        body: body
      });
      
      const data = await response.json();

      if (error) {
        console.error('Errore durante l\'invio delle notifiche push:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Errore durante l\'invio delle notifiche push dal server:', error);
      return { success: false, error };
    }
  },

  /**
 * Recupera le push subscription dal database per una lista di userId
 * @param userIds Lista di ID utente
 */
async  getPushSubscriptionsByUserIds(userIds: string[]) {
  if (!userIds || userIds.length === 0) return [];

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('subscription, user_id')
    .in('user_id', userIds)
    .not('subscription', 'is', null); // Evita risultati nulli

  if (error) {
    console.error('Errore nel recupero delle subscription:', error);
    return [];
  }

  // Filtra eventuali righe senza subscription valida
  return (data || []).filter(entry => entry.subscription);
}


};