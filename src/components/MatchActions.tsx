
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Trash2, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Match, Participant } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationService } from "@/services/NotificationService";

interface MatchActionsProps {
  match: Match;
  onRemoveParticipant?: (participantId: string) => void;
}

const MatchActions = ({ match, onRemoveParticipant }: MatchActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [isNotifying, setIsNotifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleNotifyAll = async () => {
    setIsNotifying(true);
    
    try {
      // Invia notifiche a tutti i partecipanti non guest tramite il servizio di notifiche
      const message = `Promemoria: La partita a ${match.field} è confermata per il ${new Date(match.date).toLocaleDateString('it-IT')} alle ${match.time.substring(0, 5)}`;
      
      const result = await NotificationService.notifyAllParticipants(
        match.id,
        message,
        match.participants || []
      );
      
      if (result.success) {
        // Conta quanti partecipanti non sono guest
        const nonGuestCount = (match.participants || []).filter(p => !p.user_id.startsWith('guest-')).length;
        
        toast({
          title: "Notifica inviata",
          description: `${nonGuestCount} partecipanti registrati sono stati notificati`,
        });
      } else {
        throw new Error('Errore durante l\'invio delle notifiche');
      }
    } catch (error) {
      console.error("Error notifying participants:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'invio delle notifiche",
        variant: "destructive"
      });
    } finally {
      setIsNotifying(false);
    }
  };

  const handleDeleteMatch = async () => {
    setIsDeleting(true);
    
    try {
      // Delete the match from Supabase
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', match.id);
        
      if (error) throw error;
      
      toast({
        title: "Partita eliminata",
        description: "La partita è stata eliminata con successo",
      });
      navigate("/");
    } catch (error) {
      console.error("Error deleting match:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione della partita",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const confirmRemoveParticipant = async (id: string) => {
    if (onRemoveParticipant) {
      try {
        // Delete the participant from Supabase
        const { error } = await supabase
          .from('participants')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        onRemoveParticipant(id);
        toast({
          title: "Partecipante rimosso",
          description: "Il partecipante è stato rimosso dalla partita",
        });
      } catch (error) {
        console.error("Error removing participant:", error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante la rimozione del partecipante",
          variant: "destructive"
        });
      } finally {
        setParticipantToRemove(null);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="border-none shadow-lg mb-6">
        <CardContent className="p-6">
          <CardTitle className="text-xl mb-4">Amministratore</CardTitle>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2"
              onClick={handleNotifyAll}
              disabled={isNotifying}
            >
              {isNotifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Invio...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  Notifica utenti registrati
                </>
              )}
            </Button>
            
            {isAdmin && (
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Elimina partita
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Questa azione eliminerà permanentemente la partita e non può essere annullata.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteMatch} className="bg-destructive text-destructive-foreground">
                      {isDeleting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Eliminazione...
                        </div>
                      ) : "Elimina"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MatchActions;
