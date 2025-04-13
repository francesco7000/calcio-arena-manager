
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Edit, Calendar, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types";
import MatchCard from "@/components/MatchCard";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserMatches = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        // Ottieni le partite a cui l'utente partecipa
        const { data: participations, error: participationsError } = await supabase
          .from('participants')
          .select('match_id')
          .eq('user_id', user.id);

        if (participationsError) throw participationsError;

        if (participations && participations.length > 0) {
          // Estrai gli ID delle partite
          const matchIds = participations.map(p => p.match_id);

          // Ottieni i dettagli delle partite
          const { data: matches, error: matchesError } = await supabase
            .from('matches')
            .select('*')
            .in('id', matchIds);

          if (matchesError) throw matchesError;

          // Per ogni partita, ottieni i partecipanti
          const matchesWithParticipants = [];
          for (const match of matches || []) {
            const { data: participants, error: participantsError } = await supabase
              .from('participants')
              .select('*')
              .eq('match_id', match.id);

            if (!participantsError) {
              matchesWithParticipants.push({
                ...match,
                participants: participants || [],
                totalParticipants: match.max_participants,
                currentParticipants: match.current_participants || 0
              });
            }
          }

          setUserMatches(matchesWithParticipants);
        }
      } catch (error) {
        console.error('Errore nel recupero delle partite dell\'utente:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMatches();
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Il tuo profilo
          </h2>
          
          <Card className="mb-6 border-none shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <div className="h-32 bg-gradient-to-r from-primary/90 to-secondary/90" />
                
                <div className="px-6 pb-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6 -mt-16">
                    <motion.div 
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-calcio-blue to-primary flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white">
                        MC
                      </div>
                      <button className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md text-primary hover:bg-gray-100 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                    </motion.div>
                    
                    <div className="space-y-2 text-center sm:text-left mt-4 sm:mt-16">
                      <h3 className="text-2xl font-semibold">{user?.username || 'Utente'}</h3>
                      <p className="text-gray-500">{user?.admin ? 'Amministratore' : 'Giocatore'}</p>
                      {isAdmin && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="mt-2"
                        >
                          <Button 
                            onClick={() => navigate('/create-match')} 
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Crea nuova partita
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Le tue prossime partite
            </h3>
            
            {loading ? (
              <Card className="shadow border-none overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-gray-500 mb-4">
                    Caricamento partite...
                  </p>
                </CardContent>
              </Card>
            ) : userMatches.length > 0 ? (
              <div className="space-y-4">
                {userMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <Card className="shadow border-none overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-gray-500 mb-4">
                    Non sei iscritto a nessuna partita.
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      onClick={() => window.location.href = '/'} 
                    >
                      Trova partite
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
