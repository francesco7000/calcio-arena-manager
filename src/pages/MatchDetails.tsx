
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Users, Calendar, Clock, Euro, ArrowLeft, User, MapPinned, Bell, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import FootballField from "@/components/FootballField";
import Header from "@/components/Header";
import ParticipantsList from "@/components/ParticipantsList";
import { Match, Participant } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

const MatchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const isMobile = useIsMobile();
  const [playerPositions, setPlayerPositions] = useState<{ [key: string]: { x: number, y: number } }>({});

  

    // Fetch match data and formations
    const fetchMatch = useCallback(async () => {
      setPlayerPositions({});
      if (!id) return;
  
      setLoading(true);
      try {
        // Fetch match details
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .eq('id', id)
          .single();
  
        if (matchError) throw matchError;
        if (!matchData) throw new Error('Match not found');
  
        // Fetch participants
        const { data: participants, error: participantsError } = await supabase
          .from('participants')
          .select('*')
          .eq('match_id', id);
  
        if (participantsError) throw participantsError;
  
        const fullMatch: Match = {
          ...matchData,
          totalParticipants: matchData.max_participants,
          currentParticipants: participants?.length || 0,
          participants: participants || [],
        };
  
        // Fetch saved formation
        const { data: formationData, error: formationError } = await supabase
          .from('formations')
          .select('positions')
          .eq('match_id', id)
          .maybeSingle();
  
        // Handle formation data
        if (formationData && formationData.positions) {
          try {
            const positions = typeof formationData.positions === 'string' 
              ? JSON.parse(formationData.positions) 
              : formationData.positions;
              
              console.log('Posizioni recuperate:', positions);
            setPlayerPositions(positions);
            
          } catch (parseError) {
            console.error('Error parsing formation positions:', parseError);
            setPlayerPositions({});
          }
        } else {
          setPlayerPositions({});
        }
  
        setMatch(fullMatch);
      } catch (error) {
        console.error('Error fetching match details:', error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante il caricamento dei dettagli della partita.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, [id, toast]);
  
    useEffect(() => {
      console.log(id);
      if (id) {
        fetchMatch();
      }
    }, [fetchMatch]);

  const isUserParticipating = () => {
    if (!isAuthenticated || !user || !match) return false;
    return match.participants.some(p => p.user_id === user.id);
  };

  const getUserParticipantId = () => {
    if (!isAuthenticated || !user || !match) return null;
    const participant = match.participants.find(p => p.user_id === user.id);
    return participant ? participant.id : null;
  };

  const handleJoin = async () => {
    if (!match || match.currentParticipants >= match.totalParticipants) return;
    
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
      const userId = user.id;
      const { data: existingParticipant, error: checkError } = await supabase
        .from('participants')
        .select('*')
        .eq('match_id', match.id)
        .eq('user_id', userId)
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
      
      const newParticipant = {
        match_id: match.id,
        user_id: userId,
        name: user.username || 'Utente',
        position: 'MID' as const,
      };
      
      const { data, error } = await supabase
        .from('participants')
        .insert(newParticipant)
        .select()
        .single();
      
      if (error) throw error;
      
      if (match && data) {
        setMatch({
          ...match,
          currentParticipants: match.currentParticipants + 1,
          participants: [...match.participants, data]
        });
      }
      
      toast({
        title: "Iscrizione confermata!",
        description: "Ti sei iscritto alla partita con successo.",
      });
      
      fetchMatch();
    } catch (error) {
      console.error('Error joining match:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'iscrizione alla partita.",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancelParticipation = async () => {
    if (!match || !isAuthenticated || !user) return;
    
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
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', participantId);
      
      if (error) throw error;
      
      if (match) {
        setMatch({
          ...match,
          currentParticipants: match.currentParticipants - 1,
          participants: match.participants.filter(p => p.id !== participantId)
        });
      }
      
      toast({
        title: "Disiscrizione completata",
        description: "Ti sei disiscritto dalla partita con successo.",
      });
      
      fetchMatch();
    } catch (error) {
      console.error('Error cancelling participation:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la disiscrizione dalla partita.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleNotify = async () => {
    if (!match) return;
    
    if (!isAuthenticated || !user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi accedere per ricevere notifiche.",
        variant: "default"
      });
      navigate('/login');
      return;
    }
    
    setIsNotifying(true);
    try {
      const userId = user.id;
      
      const { data: existingNotification, error: checkError } = await supabase
        .from('notifications')
        .select('*')
        .eq('match_id', match.id)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingNotification) {
        toast({
          title: "Notifica già impostata",
          description: "Hai già richiesto di essere notificato per questa partita.",
        });
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        toast({
          title: "Notifica impostata!",
          description: "Riceverai una notifica quando si libererà un posto.",
        });
      }
    } catch (error) {
      console.error('Error setting notification:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'impostazione della notifica.",
        variant: "destructive"
      });
    } finally {
      setIsNotifying(false);
    }
  };

  const handleParticipantAdded = (newParticipant: Participant) => {
    if (match) {
      setMatch({
        ...match,
        currentParticipants: match.currentParticipants + 1,
        participants: [...match.participants, newParticipant]
      });
    }
  };

  const handleParticipantRemoved = (participantId: string) => {
    if (match) {
      setMatch({
        ...match,
        currentParticipants: match.currentParticipants - 1,
        participants: match.participants.filter(p => p.id !== participantId)
      });
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };
  
  const isGoalkeeperMissing = match && !match.participants.some(p => p.position === 'GK');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Header />
        <div className="flex-1 container py-6 flex items-center justify-center">
          <motion.div 
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
          />
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Header />
        <div className="flex-1 container py-6">
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-lg text-gray-500">
              Partita non trovata.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const isFull = match.currentParticipants >= match.totalParticipants;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
        </motion.div>
        
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {match.field}
              </h2>
              <Badge 
                variant={isFull ? "secondary" : "outline"}
                className={isFull 
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium" 
                  : "bg-green-100 text-green-700 hover:bg-green-200 font-medium"}
              >
                {match.currentParticipants}/{match.totalParticipants}
                {isFull && <span className="ml-1">Completo</span>}
              </Badge>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Users className="mr-1 h-4 w-4" />
              <span>
                {match.currentParticipants} partecipanti
              </span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="overflow-hidden border-none shadow-lg">
              <CardContent className="p-0">
                <div className="p-6 bg-white">
                  <div className="space-y-5">
                    <h3 className="font-medium text-lg mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Dettagli della partita</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <motion.div 
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm"
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                      >
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Data</p>
                          <p className="font-medium capitalize">{formatDate(match.date)}</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm"
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                      >
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Orario</p>
                          <p className="font-medium">{match.time}</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm"
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                      >
                        <div className="bg-primary/10 p-2 rounded-full">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Luogo</p>
                          <p className="font-medium">{match.location}</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm"
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                      >
                        <div className="bg-primary/10 p-2 rounded-full">
                          <MapPinned className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Indirizzo</p>
                          <p className="font-medium">Via del Campo 123, Milano</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm"
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                      >
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Organizzatore</p>
                          <p className="font-medium">{match.organizer}</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm"
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                      >
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Euro className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Quota</p>
                          <p className="font-medium">€{match.price.toFixed(2)}</p>
                        </div>
                      </motion.div>
                    </div>
                    
                    {!isFull && isGoalkeeperMissing && (
                      <Alert variant="destructive" className="mt-4 bg-orange-50 border-orange-200 text-orange-700">
                        <AlertDescription className="text-sm font-medium flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <span>Attenzione: manca un portiere per questa partita!</span>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="pt-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-4"
                      >
                        {isUserParticipating() ? (
                          <Button 
                            className="w-full"
                            variant="destructive"
                            disabled={isCancelling}
                            onClick={handleCancelParticipation}
                          >
                            <User className="mr-2 h-5 w-5" />
                            {isCancelling ? "Disiscrizione in corso..." : "Cancella partecipazione"}
                          </Button>
                        ) : isFull ? (
                          <Button 
                            className="w-full"
                            variant="secondary"
                            disabled={isNotifying}
                            onClick={handleNotify}
                          >
                            <Bell className="mr-2 h-5 w-5" />
                            {isNotifying ? "Impostazione notifica..." : "Notificami se si libera un posto"}
                          </Button>
                        ) : (
                          <Button 
                            className="w-full"
                            variant="default"
                            disabled={isJoining || !isAuthenticated}
                            onClick={handleJoin}
                          >
                            <User className="mr-2 h-5 w-5" />
                            {isJoining ? "Iscrizione in corso..." : 
                             !isAuthenticated ? "Accedi per partecipare" : "Partecipa a questa partita"}
                          </Button>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Separate card for participants list */}
            <ParticipantsList 
              maxParticipants={match.totalParticipants}
              matchId={match.id}
              participants={match.participants}
              onParticipantAdded={handleParticipantAdded}
              onParticipantRemoved={handleParticipantRemoved}
            />
            
           

         <div className="bg-white p-2 sm:p-4 rounded-xl shadow-md mb-2">  
         <h3 className="font-medium text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Formazione
          </h3>        
          {isAdmin && isUserParticipating() && (
          <Button
            variant="outline"
            onClick={() => navigate(`/formation/${match.id}`)}
          >
            <span className="font-medium">Modifica</span>
          </Button>
        )}
          <div className="football-field-container rounded-xl overflow-hidden shadow border border-gray-200">
            <FootballField
              participants={match.participants}
              initialPositions={playerPositions}
              editable={false}
            />
          </div>
        </div>

                
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MatchDetails;
