
import { useState } from "react";
import { UserMinus, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Participant } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ParticipantsListProps {
  matchId: string;
  participants: Participant[];
  onParticipantAdded: (participant: Participant) => void;
  onParticipantRemoved: (participantId: string) => void;
}

const ParticipantsList = ({
  matchId,
  participants,
  onParticipantAdded,
  onParticipantRemoved
}: ParticipantsListProps) => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPosition, setGuestPosition] = useState<string>("MID");
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleAddGuest = async () => {
    if (!guestName) {
      toast({
        title: "Nome richiesto",
        description: "Inserisci un nome per l'ospite",
        variant: "destructive"
      });
      return;
    }

    setIsAddingGuest(true);
    
    try {
      // Generate a unique guest ID using a timestamp and random string
      const uniqueGuestId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Create a guest participant with the unique guest ID
      const newGuest = {
        match_id: matchId,
        user_id: uniqueGuestId, // Use unique ID instead of just "guest"
        name: guestName,
        position: guestPosition,
      };
      
      const { data, error } = await supabase
        .from('participants')
        .insert(newGuest)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        onParticipantAdded(data);
        toast({
          title: "Ospite aggiunto",
          description: `${guestName} è stato aggiunto come ospite alla partita`,
        });
        
        // Reset form
        setGuestName("");
        setGuestPosition("MID");
      }
    } catch (error) {
      console.error('Error adding guest:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiunta dell'ospite",
        variant: "destructive"
      });
    } finally {
      setIsAddingGuest(false);
    }
  };

  const confirmRemoveParticipant = async (id: string) => {
    setIsRemoving(true);
    
    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      onParticipantRemoved(id);
      
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
      setIsRemoving(false);
      setParticipantToRemove(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="overflow-hidden border-none shadow-lg mb-6">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Partecipanti
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {participants.length > 0 ? (
            <div className="space-y-4">
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {participants.map((participant) => (
                  <li 
                    key={participant.id} 
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                  >
                    <span className="text-sm">{participant.name}</span>
                    {isAdmin && (
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
                              disabled={isRemoving}
                            >
                              {isRemoving ? "Rimozione..." : "Rimuovi"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </li>
                ))}
              </ul>

              {isAdmin && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 flex items-center justify-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Aggiungi ospite
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Aggiungi un ospite</DialogTitle>
                      <DialogDescription>
                        Aggiungi un partecipante ospite (non registrato) alla partita.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="guest-name">Nome</Label>
                        <Input 
                          id="guest-name" 
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Inserisci il nome dell'ospite"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guest-position">Ruolo</Label>
                        <Select 
                          value={guestPosition} 
                          onValueChange={setGuestPosition}
                        >
                          <SelectTrigger id="guest-position">
                            <SelectValue placeholder="Seleziona un ruolo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GK">Portiere</SelectItem>
                            <SelectItem value="DEF">Difensore</SelectItem>
                            <SelectItem value="MID">Centrocampista</SelectItem>
                            <SelectItem value="FWD">Attaccante</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        onClick={handleAddGuest}
                        disabled={isAddingGuest}
                      >
                        {isAddingGuest ? "Aggiungendo..." : "Aggiungi ospite"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nessun partecipante ancora iscritto.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ParticipantsList;
