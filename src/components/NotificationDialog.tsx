import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PushNotificationService } from "@/services/PushNotificationService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NotificationDialogProps {
  userId?: string;
  userObject?: any;
  onClose?: () => void;
}

const NotificationDialog = ({ userId, userObject, onClose }: NotificationDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

  // Controlla lo stato del permesso per le notifiche
  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      // Se il permesso è già stato concesso, non mostrare il dialog
      if (Notification.permission === 'granted') {
        setOpen(false);
      } else {
        setOpen(true);
      }
    }
  };

  // Richiedi il permesso per le notifiche
  const requestNotificationPermission = async () => {
    try {
      const hasPermission = await PushNotificationService.requestNotificationPermission(userId, userObject);
      setNotificationPermission(hasPermission ? 'granted' : 'denied');
      
      if (hasPermission) {
        toast({
          title: "Notifiche attivate",
          description: "Riceverai notifiche per le nuove attività",
        });
        setOpen(false);
        if (onClose) onClose();
      } else if (PushNotificationService.isIOS()) {
        // Per iOS mostriamo un messaggio specifico ma lasciamo aperto il dialog
        toast({
          title: "Configurazione notifiche iOS",
          description: "Segui le istruzioni per completare la configurazione",
          variant: "destructive"
        });
      } else {
        // Per altri browser, se l'utente ha negato, mostriamo un messaggio
        toast({
          title: "Notifiche non attivate",
          description: "Non riceverai notifiche per le nuove attività",
          variant: "destructive"
        });
        setOpen(false);
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Errore durante la richiesta di permesso per le notifiche:", error);
      setOpen(false);
      if (onClose) onClose();
    }
  };

  // Chiudi il dialog senza attivare le notifiche
  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  // Controlla il permesso all'avvio del componente
  useEffect(() => {
    checkNotificationPermission();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BellRing className="h-5 w-5 text-primary" />
            Attiva le notifiche
          </DialogTitle>
          <DialogDescription className="pt-2 text-base">
            Ricevi notifiche in tempo reale per:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Nuove partite disponibili</li>
              <li>Aggiornamenti sulle tue partite</li>
              <li>Messaggi dalla tua squadra</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <div className="bg-primary/10 p-4 rounded-lg text-center w-full">
            <BellRing className="h-12 w-12 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">
              {PushNotificationService.isIOS() 
                ? "Su iOS, dovrai confermare le notifiche anche nelle impostazioni di Safari dopo aver cliccato 'Attiva'" 
                : "Non perderti nessun aggiornamento importante!"}
            </p>
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-between sm:justify-between gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="flex-1"
          >
            Più tardi
          </Button>
          <Button 
            onClick={requestNotificationPermission} 
            className="flex-1"
          >
            <BellRing className="h-4 w-4 mr-1" />
            Attiva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDialog;