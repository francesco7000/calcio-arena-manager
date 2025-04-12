
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

interface MatchActionsProps {
  match: Match;
  onRemoveParticipant?: (participantId: string) => void;
}

const MatchActions = ({ match, onRemoveParticipant }: MatchActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNotifying, setIsNotifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(null);

  const handleNotifyAll = async () => {
    setIsNotifying(true);
    
    try {
      // In un'implementazione reale, qui invieresti notifiche ai partecipanti
      // Simuliamo un ritardo per mostrare lo stato di caricamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Notifica inviata",
        description: `Tutti i ${match.participants.length} partecipanti sono stati notificati`,
      });
    } catch (error) {
      console.error("Errore durante l'invio delle notifiche:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un errore durante l'invio delle notifiche",
      });
    } finally {
      setIsNotifying(false);
    }
  };

  const handleDeleteMatch = async () => {
    setIsDeleting(true);
    
    try {
      // Eliminare la partita dal database
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', match.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Partita eliminata",
        description: "La partita è stata eliminata con successo",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione della partita",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const confirmRemoveParticipant = async (id: string) => {
    try {
      // Eliminare il partecipante dal database
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Aggiornare l'UI
      if (onRemoveParticipant) {
        onRemoveParticipant(id);
      }
      
      setParticipantToRemove(null);
      
      toast({
        title: "Partecipante rimosso",
        description: "Il partecipante è stato rimosso dalla partita",
      });
    } catch (error) {
      console.error("Errore durante la rimozione del partecipante:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un errore durante la rimozione del partecipante",
      });
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
          <CardTitle className="text-xl mb-4">Azioni Amministratore</CardTitle>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  Notifica tutti
                </>
              )}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="flex items-center justify-center gap-2"
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
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2"
              onClick={() => navigate('/admin')}
            >
              Torna al pannello
            </Button>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-2">Gestione Partecipanti</h3>
            {match.participants.length > 0 ? (
              <div className="space-y-2">
                {match.participants.map((participant) => (
                  <div 
                    key={participant.id} 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center">
                      <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                        {participant.number}
                      </div>
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-xs text-muted-foreground">{participant.position}</p>
                      </div>
                    </div>
                    
                    <AlertDialog open={participantToRemove === participant.id} onOpenChange={(open) => {
                      if (!open) setParticipantToRemove(null);
                    }}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setParticipantToRemove(participant.id)}
                        >
                          <UserMinus className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Rimuovi partecipante</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler rimuovere {participant.name} dalla partita?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => confirmRemoveParticipant(participant.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Rimuovi
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Nessun partecipante iscritto</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MatchActions;
