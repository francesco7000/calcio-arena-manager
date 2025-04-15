
import { useState } from "react";
import { UserMinus, UserPlus, Bell } from "lucide-react";
import * as framerMotion from "framer-motion";
const { motion } = framerMotion;
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Participant } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationService } from "@/services/NotificationService";
import { Textarea } from "@/components/ui/textarea";
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
import { Separator } from "@/components/ui/separator";

interface ParticipantsListProps {
  matchId: string;
  participants: Participant[];
  maxParticipants: number; // Aggiunto parametro per il numero massimo di partecipanti
  onParticipantAdded: (participant: Participant) => void;
  onParticipantRemoved: (participantId: string) => void;
}



const ParticipantsList = ({
  matchId,
  participants,
  maxParticipants, // Utilizzo del nuovo parametro
  onParticipantAdded,
  onParticipantRemoved
}: ParticipantsListProps) => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPosition, setGuestPosition] = useState<string>("CC");
  const [guestTeam, setGuestTeam] = useState<string>("auto"); // Impostato su "auto" per l'assegnazione automatica di default
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editName, setEditName] = useState("");
  const [editPosition, setEditPosition] = useState<string>("CC");
  const [editTeam, setEditTeam] = useState<string>("A");

  const handleAddGuest = async () => {
    if (participants.length >= maxParticipants) {
      toast({
        title: "Limite raggiunto",
        description: "Numero massimo di partecipanti raggiunto.",
        variant: "destructive"
      });
      return;
    }

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
      
      // Determina il team in base alla selezione (auto o manuale)
      let assignedTeam: string;
      
      if (guestTeam === "auto") {
        // Conta i partecipanti per team per assegnare automaticamente al team con meno giocatori
        const teamACounts = participants.filter(p => p.team === 'A').length;
        const teamBCounts = participants.filter(p => p.team === 'B').length;
        
        // Assegna automaticamente al team con meno giocatori
        assignedTeam = teamACounts <= teamBCounts ? 'A' : 'B';
      } else {
        // Usa il team selezionato manualmente
        assignedTeam = guestTeam;
      }
      
      // Create a guest participant with the unique guest ID
      const newGuest = {
        match_id: matchId,
        user_id: uniqueGuestId, // Use unique ID instead of just "guest"
        name: guestName,
        position: guestPosition,
        team: assignedTeam,
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
          description: `${guestName} è stato aggiunto come ospite alla partita nel Team ${data.team}`,
        });
        
        // Reset form
        setGuestName("");
        setGuestPosition("CC");
        setGuestTeam("auto"); // Reimposta su auto per il prossimo ospite
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
  
  const handleEditParticipant = async (id: string) => {
    if (!editingParticipant) return;
    
    setIsEditing(true);
    
    try {
      // Verifica se è un ospite o un utente registrato
      const isGuest = editingParticipant.user_id.startsWith('guest-');
      
      // Prepara i dati da aggiornare
      const updateData: any = {
        position: editPosition,
        team: editTeam
      };
      
      // Aggiunge il nome solo se è un ospite
      if (isGuest) {
        updateData.name = editName;
      }
      
      // Aggiorna il partecipante nel database
      const { data, error } = await supabase
        .from('participants')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Aggiorna l'interfaccia utente senza rimuovere e aggiungere
      if (data) {
        // Trova il partecipante nell'array e aggiornalo direttamente
        // senza chiamare onParticipantRemoved e onParticipantAdded
        const updatedParticipant = {...data};
        
        // Aggiorna il partecipante nell'array locale
        const updatedParticipants = participants.map(p => 
          p.id === id ? updatedParticipant : p
        );
        
        toast({
          title: "Partecipante aggiornato",
          description: `Le modifiche sono state salvate con successo.`,
        });
        
        // Forza un aggiornamento della pagina per riflettere le modifiche
        // Questo è necessario perché non possiamo aggiornare direttamente lo stato nel componente padre
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating participant:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del partecipante",
        variant: "destructive"
      });
    } finally {
      setIsEditing(false);
      setEditingParticipant(null);
    }
  };

  // Raggruppa i partecipanti per squadra
  const teamAParticipants = participants.filter(p => p.team === 'A');
  const teamBParticipants = participants.filter(p => p.team === 'B');
  
  // Funzione per ottenere il nome completo della posizione
  const getPositionName = (position: string) => {
    switch(position) {
      case 'POR': return 'Portiere';
      case 'DC': return 'Difensore Centrale';
      case 'TS': return 'Terzino Sinistro';
      case 'TD': return 'Terzino Destro';
      case 'CDC': return 'Centrocampista Difensivo';
      case 'CC': return 'Centrocampista Centrale';
      case 'COC': return 'Centrocampista Offensivo';
      case 'AS': return 'Ala Sinistra';
      case 'AD': return 'Ala Destra';
      case 'ATT': return 'Attaccante';
      default: return position;
    }
  };
  
  // Funzione per ottenere il colore del badge in base alla posizione
  const getPositionColor = (position: string) => {
    switch(position) {
      case 'POR': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DC': case 'TS': case 'TD': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CDC': case 'CC': case 'COC': return 'bg-green-100 text-green-800 border-green-200';
      case 'AS': case 'AD': case 'ATT': case 'SP': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Stato per la notifica a singolo utente
  const [isNotifying, setIsNotifying] = useState(false);
  const [notifyingUserId, setNotifyingUserId] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);

  // Funzione per inviare una notifica a un singolo utente
  const handleNotifySingleUser = async (userId: string) => {
    if (!notificationMessage) {
      toast({
        title: "Messaggio richiesto",
        description: "Inserisci un messaggio per la notifica",
        variant: "destructive"
      });
      return;
    }

    setIsNotifying(true);
    
    try {
      const { success, error } = await NotificationService.notifySingleParticipant(
        matchId,
        userId,
        notificationMessage
      );
      
      if (success) {
        toast({
          title: "Notifica inviata",
          description: `La notifica è stata inviata con successo`,
        });
        setShowNotificationDialog(false);
        setNotificationMessage("");
      } else {
        throw error;
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'invio della notifica",
        variant: "destructive"
      });
    } finally {
      setIsNotifying(false);
      setNotifyingUserId(null);
    }
  };

  // Componente per renderizzare un singolo partecipante
  const ParticipantCard = ({ participant }: { participant: Participant }) => (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100"
    >
      <div className="p-3 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="font-medium">{participant.name}</div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs px-2 py-0 ${getPositionColor(participant.position)}`}>
              {participant.position}
            </Badge>
            <span className="text-xs text-muted-foreground">{getPositionName(participant.position)}</span>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setEditingParticipant(participant);
                setEditName(participant.name);
                setEditPosition(participant.position);
                setEditTeam(participant.team || 'A');
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-pencil"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </Button>
            
            {/* Pulsante di notifica solo per utenti non guest */}
            {!participant.user_id.startsWith('guest-') && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  setNotifyingUserId(participant.user_id);
                  setShowNotificationDialog(true);
                }}
              >
                <Bell className="h-4 w-4" />
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                  <UserMinus className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione rimuoverà {participant.name} dalla partita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => confirmRemoveParticipant(participant.id)}
                    className="bg-destructive text-destructive-foreground"
                  >
                    {isRemoving && participantToRemove === participant.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Rimozione...
                      </div>
                    ) : (
                      "Rimuovi"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Dialog per inviare notifica a un singolo utente */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invia notifica</DialogTitle>
            <DialogDescription>
              Invia una notifica a questo partecipante.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notification-message">Messaggio</Label>
              <Textarea
                id="notification-message"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Scrivi il messaggio della notifica"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => notifyingUserId && handleNotifySingleUser(notifyingUserId)} disabled={isNotifying}>
              {isNotifying ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Invio...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Invia notifica
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card className="border-none shadow-lg mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            <span>Partecipanti ({participants.length}/{maxParticipants})</span>
          </CardTitle>
          
          {isAdmin && (
            <div className="mt-2 mb-4 w-full">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Controlli amministratore</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="w-full sm:w-auto flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white font-semibold shadow-sm hover:shadow-md transition-all">
                      <UserPlus className="h-4 w-4" />
                      <span>Aggiungi ospite</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Aggiungi ospite</DialogTitle>
                      <DialogDescription>
                        Aggiungi un ospite alla partita. Gli ospiti sono partecipanti che non hanno un account.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Nome dell'ospite"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="position">Posizione</Label>
                        <Select value={guestPosition} onValueChange={setGuestPosition}>
                          <SelectTrigger id="position">
                            <SelectValue placeholder="Seleziona posizione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="POR">Portiere</SelectItem>
                            <SelectItem value="DC">Difensore Centrale</SelectItem>
                            <SelectItem value="TS">Terzino Sinistro</SelectItem>
                            <SelectItem value="TD">Terzino Destro</SelectItem>
                            <SelectItem value="CDC">Centrocampista Difensivo</SelectItem>
                            <SelectItem value="CC">Centrocampista Centrale</SelectItem>
                            <SelectItem value="COC">Centrocampista Offensivo</SelectItem>
                            <SelectItem value="AS">Ala Sinistra</SelectItem>
                            <SelectItem value="AD">Ala Destra</SelectItem>
                            <SelectItem value="ATT">Attaccante</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="team">Squadra</Label>
                        <Select value={guestTeam} onValueChange={setGuestTeam}>
                          <SelectTrigger id="team">
                            <SelectValue placeholder="Seleziona squadra" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Assegnazione automatica</SelectItem>
                            <SelectItem value="A">Team A</SelectItem>
                            <SelectItem value="B">Team B</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button onClick={handleAddGuest} disabled={isAddingGuest} className="bg-green-500 hover:bg-green-600 text-white font-semibold shadow-sm hover:shadow-md transition-all">
                        {isAddingGuest ? "Aggiunta in corso..." : "Aggiungi ospite"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {participants.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="w-full sm:w-auto flex items-center gap-2 bg-red-600 hover:bg-red-700 font-semibold shadow-sm hover:shadow-md transition-all"
                      >
                        <UserMinus className="h-4 w-4" />
                        Elimina tutti
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Elimina tutti i partecipanti</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sei sicuro di voler eliminare tutti i partecipanti? Questa azione non può essere annullata.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={async () => {
                            try {
                              const { error } = await supabase
                                .from('participants')
                                .delete()
                                .eq('match_id', matchId);
                                
                              if (error) throw error;
                              
                              // Rimuovi tutti i partecipanti dall'interfaccia
                              participants.forEach(p => onParticipantRemoved(p.id));
                              
                              toast({
                                title: "Partecipanti eliminati",
                                description: "Tutti i partecipanti sono stati eliminati con successo",
                              });
                              
                              // Ricarica la pagina per aggiornare l'interfaccia
                              window.location.reload();
                            } catch (error) {
                              console.error("Error removing all participants:", error);
                              toast({
                                title: "Errore",
                                description: "Si è verificato un errore durante l'eliminazione dei partecipanti",
                                variant: "destructive"
                              });
                            }
                          }}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Elimina tutti
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          )}
        </CardHeader>
        
        {/* Separatore visibile tra i controlli amministrativi e la lista dei partecipanti */}
        <Separator className="my-4 mx-auto w-[calc(100%-2rem)]" />
        
        <CardContent>
          <div className="space-y-4">
            {participants.length > 0 ? (
              <>
                <div className="space-y-6">
                  {/* Team A */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <h3 className="font-semibold text-blue-700">Team A - {teamAParticipants.length} giocatori</h3>
                    </div>
                    <div className="space-y-2">
                      {teamAParticipants.length > 0 ? (
                        teamAParticipants.map((participant) => (
                          <ParticipantCard key={participant.id} participant={participant} />
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground italic p-2">Nessun giocatore nel Team A</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Team B */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <h3 className="font-semibold text-red-700">Team B - {teamBParticipants.length} giocatori</h3>
                    </div>
                    <div className="space-y-2">
                      {teamBParticipants.length > 0 ? (
                        teamBParticipants.map((participant) => (
                          <ParticipantCard key={participant.id} participant={participant} />
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground italic p-2">Nessun giocatore nel Team B</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nessun partecipante iscritto</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog per modificare un partecipante */}
      <Dialog open={!!editingParticipant} onOpenChange={(open) => !open && setEditingParticipant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica partecipante</DialogTitle>
            <DialogDescription>
              Modifica i dettagli del partecipante.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {editingParticipant && editingParticipant.user_id.startsWith('guest-') && (
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nome del partecipante"
                />
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="edit-position">Posizione</Label>
              <Select value={editPosition} onValueChange={setEditPosition}>
                <SelectTrigger id="edit-position">
                  <SelectValue placeholder="Seleziona posizione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POR">Portiere</SelectItem>
                  <SelectItem value="DC">Difensore Centrale</SelectItem>
                  <SelectItem value="TS">Terzino Sinistro</SelectItem>
                  <SelectItem value="TD">Terzino Destro</SelectItem>
                  <SelectItem value="CDC">Centrocampista Difensivo</SelectItem>
                  <SelectItem value="CC">Centrocampista Centrale</SelectItem>
                  <SelectItem value="COC">Centrocampista Offensivo</SelectItem>
                  <SelectItem value="AS">Ala Sinistra</SelectItem>
                  <SelectItem value="AD">Ala Destra</SelectItem>
                  <SelectItem value="ATT">Attaccante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-team">Squadra</Label>
              <Select value={editTeam} onValueChange={setEditTeam}>
                <SelectTrigger id="edit-team">
                  <SelectValue placeholder="Seleziona squadra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Team A</SelectItem>
                  <SelectItem value="B">Team B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => editingParticipant && handleEditParticipant(editingParticipant.id)} disabled={isEditing}>
              {isEditing ? "Salvataggio..." : "Salva modifiche"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ParticipantsList;
