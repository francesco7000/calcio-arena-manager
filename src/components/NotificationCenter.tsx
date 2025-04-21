import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, X, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NotificationService, type Notification } from "@/services/NotificationService";
import { PushNotificationService } from "@/services/PushNotificationService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const NotificationCenter = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);

  // Conta le notifiche non lette
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Carica le notifiche dell'utente
  const loadNotifications = async () => {
    if (!isAuthenticated || !user) return;
    
    setLoading(true);
    try {
      const userNotifications = await NotificationService.getUserNotifications(user.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Errore nel caricamento delle notifiche:", error);
    } finally {
      setLoading(false);
    }
  };

  // Segna una notifica come letta
  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Errore nel segnare la notifica come letta:", error);
    }
  };

  // Segna tutte le notifiche come lette
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await NotificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast({
        title: "Notifiche lette",
        description: "Tutte le notifiche sono state segnate come lette",
      });
    } catch (error) {
      console.error("Errore nel segnare tutte le notifiche come lette:", error);
    }
  };

  // Controlla lo stato del permesso per le notifiche
  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      // Mostra l'alert sia quando il permesso è negato sia quando siamo su iOS/Safari
      // e il permesso non è ancora stato concesso
      const isIOSSafari = PushNotificationService.isIOS() || PushNotificationService.isSafari();
      setShowPermissionAlert(Notification.permission === 'denied' || 
        (isIOSSafari && Notification.permission !== 'granted'));
    }
  };

  // Richiedi il permesso per le notifiche
  const requestNotificationPermission = async () => {
    try {
      const hasPermission = await PushNotificationService.requestNotificationPermission();
      setNotificationPermission(hasPermission ? 'granted' : 'denied');
      setShowPermissionAlert(!hasPermission);
      
      if (hasPermission) {
        toast({
          title: "Notifiche attivate",
          description: "Riceverai notifiche per le nuove attività",
        });
      }
    } catch (error) {
      console.error("Errore durante la richiesta di permesso per le notifiche:", error);
    }
  };

  // Carica le notifiche all'avvio e configura la sottoscrizione in tempo reale
  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
      checkNotificationPermission();
      
      // Configura la sottoscrizione in tempo reale
      const subscription = NotificationService.subscribeToNotifications(
        user.id,
        (newNotification) => {
          // Aggiorna lo stato con la nuova notifica
          setNotifications(prev => [newNotification, ...prev]);
          
          // Mostra un toast per la nuova notifica
          toast({
            title: "Nuova notifica",
            description: newNotification.message || "Hai ricevuto una nuova notifica",
          });
        }
      );
      
      // Pulisci la sottoscrizione quando il componente viene smontato
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isAuthenticated, user]);

  // Se l'utente non è autenticato, non mostrare nulla
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.2rem] h-5 flex items-center justify-center bg-red-500 text-white border-none"
                variant="outline"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[90vw] max-w-sm p-0 shadow-lg" align="center" sideOffset={8}>
        <Card className="border-none shadow-none rounded-lg overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BellRing className="h-4 w-4 text-primary" />
                Notifiche
              </CardTitle>
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs hover:bg-primary/20 transition-colors"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Segna tutte come lette
                </Button>
              )}
            </div>
            <CardDescription className="text-xs mt-1 font-medium">
              {loading ? "Caricamento notifiche..." : 
                notifications.length === 0 ? "Non hai notifiche" : 
                `Hai ${unreadCount} notifiche non lette`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {notificationPermission === 'denied' && (
              <div className="p-4 border-b bg-amber-50/50">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 rounded-full p-2 mt-1">
                    <BellRing className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1 text-amber-800">Notifiche disabilitate</p>
                    <p className="text-xs text-amber-700/80 mb-3">Attiva le notifiche per ricevere aggiornamenti in tempo reale</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={requestNotificationPermission}
                      className="w-full border-amber-300 bg-amber-100/50 hover:bg-amber-200/50 text-amber-800"
                    >
                      <BellRing className="h-3.5 w-3.5 mr-1" />
                      Attiva notifiche
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <AnimatePresence>
              {notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`p-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-primary/10 border-l-2 border-primary' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.message}</p>
                          <div className="flex items-center mt-2">
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.created_at || '').toLocaleString('it-IT', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {!notification.is_read && (
                              <Badge variant="outline" className="ml-2 bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0">
                                Nuova
                              </Badge>
                            )}
                          </div>
                        </div>
                        {!notification.is_read && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-primary/20 hover:text-primary transition-colors"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : !loading && (
                <div className="py-12 px-4 text-center">
                  <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-3">
                    <Bell className="h-8 w-8 mx-auto text-muted-foreground opacity-60" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Non hai notifiche</p>
                  <p className="text-xs text-muted-foreground mt-1">Le notifiche appariranno qui</p>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
    </>
  );
};

export default NotificationCenter;