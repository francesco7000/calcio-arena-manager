import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Calendar, Clock, Euro, Info, UserPlus, Bell, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Match, Position } from "@/types";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface MatchCardProps {
  match: Match;
  isCompact?: boolean;
}

const MatchCard = ({ match, isCompact = false }: MatchCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  
  const isFull = match.currentParticipants >= match.totalParticipants;
  const isGoalkeeperMissing = !match.participants.some(p => p.position === 'GK');
  
  // Verifica se l'utente è già iscritto alla partita
  const isUserParticipating = () => {
    if (!isAuthenticated || !user) return false;
    return match.participants.some(p => p.user_id === user.id);
  };

  // Ottieni l'ID del partecipante dell'utente corrente
  const getUserParticipantId = () => {
    if (!isAuthenticated || !user) return null;
    const participant = match.participants.find(p => p.user_id === user.id);
    return participant ? participant.id : null;
  };

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFull) return;
    
    // Verifica se l'utente è autenticato
    if (!isAuthenticated || !user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi accedere per partecipare a questa partita.",
        variant: "default"
      });
      navigate('/login');
      return;
    }
    
    setIsJoining(true);
    try {
      // Verifica se l'utente è già iscritto
      const { data: existingParticipant, error: checkError } = await supabase
        .from('participants')
        .select('*')
        .eq('match_id', match.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingParticipant) {
        toast({
          title: "Già iscritto",
          description: "Sei già iscritto a questa partita.",
          variant: "default"
        });
        setIsJoining(false);
        return;
      }
      
      // Aggiungi partecipante a Supabase
      const newParticipant = {
        match_id: match.id,
        user_id: user.id,
        name: user.username || 'Utente',
        position: 'MID' as const, // Posizione predefinita
      };
      
      const { error } = await supabase
        .from('participants')
        .insert(newParticipant);
      
      if (error) throw error;
      
      toast({
        title: "Iscrizione confermata!",
        description: "Ti sei iscritto alla partita con successo.",
      });
      
      // Aggiorna la pagina per mostrare i dati aggiornati
      window.location.reload();
    } catch (error: any) {
      console.error('Error joining match:', error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'iscrizione.",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Funzione per gestire la disiscrizione dalla partita
  const [isCancelling, setIsCancelling] = useState(false);
  
  const handleCancelParticipation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || !user) return;
    
    const participantId = getUserParticipantId();
    if (!participantId) {
      toast({
        title: "Errore",
        description: "Non sei iscritto a questa partita.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCancelling(true);
    try {
      // Rimuovi il partecipante dal database
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', participantId);
      
      if (error) throw error;
      
      toast({
        title: "Disiscrizione completata",
        description: "Ti sei disiscritto dalla partita con successo.",
      });
      
      // Aggiorna la pagina per mostrare i dati aggiornati
      window.location.reload();
    } catch (error: any) {
      console.error('Error cancelling participation:', error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la disiscrizione.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleNotify = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNotifying(true);
    
    // Simulazione di una chiamata API
    setTimeout(() => {
      setIsNotifying(false);
      toast({
        title: "Notifica impostata!",
        description: "Riceverai una notifica quando si libererà un posto.",
      });
    }, 1000);
  };
  
  const handleViewDetails = () => {
    navigate(`/match/${match.id}`);
  };
  
  // Calcolo della data in formato italiano
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  if (isCompact) {
    return (
      <motion.div
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
        onClick={handleViewDetails}
      >
        <div className={`p-3 border-l-4 ${isFull ? 'border-red-300' : 'border-green-200'} flex justify-between items-start`}>
          <div className="flex-grow min-w-0 pr-2">
            <h3 className="font-medium text-sm truncate">{match.field}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="flex-shrink-0">{match.time}</span>
              <span className="mx-1 flex-shrink-0">•</span>
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{match.location}</span>
            </div>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <Badge 
              variant={isFull ? "full" : "success"} 
              className={`whitespace-nowrap ${isFull ? 'min-w-16 text-center justify-center' : ''}`}
            >
              {match.currentParticipants}/{match.totalParticipants}
              {isFull && <span className="ml-1">Completo</span>}
            </Badge>
            <span className="text-xs text-muted-foreground mt-1">€{match.price.toFixed(2)}</span>
          </div>
        </div>
        {!isFull && isGoalkeeperMissing && (
          <div className="px-3 py-1 bg-orange-50 text-orange-600 text-xs flex items-center justify-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>Manca un portiere!</span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <Card className="overflow-hidden animate-slide-up hover:shadow-md transition-all cursor-pointer" onClick={handleViewDetails}>
      <CardContent className="p-0">
        <div className={`${isFull ? 'bg-red-300' : 'bg-green-200'} ${isFull ? 'text-red-800' : 'text-green-800'} p-4`}>
          <div className="flex justify-between items-center">
            <h3 className="font-bold truncate max-w-[70%]">{match.field}</h3>
            <Badge variant={isFull ? "full" : "success"} className={isFull ? "bg-white text-red-500" : ""}>
              {match.currentParticipants}/{match.totalParticipants}
              {isFull && <span className="ml-1">Completo</span>}
            </Badge>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <span className="text-sm capitalize">{formatDate(match.date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm">{match.time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="text-sm truncate">{match.location}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm">Organizz.: {match.organizer}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-green-600" />
            <span className="text-sm">Quota: €{match.price.toFixed(2)}</span>
          </div>
          
          {!isFull && isGoalkeeperMissing && (
            <Alert variant="destructive" className="py-2 bg-orange-50 border-orange-200 text-orange-600">
              <AlertDescription className="text-xs font-medium flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>Manca un portiere!</span>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between p-4 pt-0 gap-2">
        <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-1" 
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
          >
            <Info className="h-4 w-4" />
            <span>Info</span>
          </Button>
        </motion.div>
        <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          {isUserParticipating() ? (
            <Button 
              variant="destructive"
              className="w-full flex items-center gap-1"
              onClick={handleCancelParticipation}
              disabled={isCancelling}
            >
              <UserPlus className="h-4 w-4" />
              {isCancelling ? "Disiscrizione..." : "Cancella iscrizione"}
            </Button>
          ) : isFull ? (
            <Button 
              variant="secondary"
              className="w-full flex items-center gap-1"
              onClick={handleNotify}
              disabled={isNotifying}
            >
              <Bell className="h-4 w-4" />
              {isNotifying ? "Impostando..." : "Notificami"}
            </Button>
          ) : (
            <Button 
              variant="default"
              className="w-full flex items-center gap-1"
              disabled={isJoining || !isAuthenticated}
              onClick={handleJoin}
            >
              <UserPlus className="h-4 w-4" />
              {isJoining ? "Iscrizione..." : 
               !isAuthenticated ? "Accedi" : "Partecipa"}
            </Button>
          )}
        </motion.div>
      </CardFooter>
    </Card>
  );
};

export default MatchCard;
