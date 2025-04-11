
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Users, Calendar, Clock, Euro, ArrowLeft, User } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import FootballField from "@/components/FootballField";
import Header from "@/components/Header";
import { Match } from "@/types";
import { mockMatches } from "@/data/mockData";

const MatchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const fetchMatch = () => {
      setLoading(true);
      // Simulación de API call
      setTimeout(() => {
        const foundMatch = mockMatches.find(m => m.id === id);
        if (foundMatch) {
          setMatch(foundMatch);
        }
        setLoading(false);
      }, 1000);
    };

    fetchMatch();
  }, [id]);

  const handleJoin = () => {
    if (!match || match.currentParticipants >= match.totalParticipants) return;
    
    setIsJoining(true);
    // Simulación de API call
    setTimeout(() => {
      setIsJoining(false);
      toast({
        title: "Iscrizione confermata!",
        description: "Ti sei iscritto alla partita con successo.",
      });
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

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
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Indietro
          </Button>
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
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Indietro
          </Button>
        </motion.div>
        
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {match.field}
            </h2>
            <div className="flex items-center text-muted-foreground">
              <Users className="mr-1 h-4 w-4" />
              <span>
                {match.currentParticipants}/{match.totalParticipants} partecipanti
              </span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="overflow-hidden border-none shadow-lg">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="space-y-6 p-6 bg-white">
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Dettagli della partita</h3>
                      
                      <div className="space-y-4">
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
                    </div>
                    
                    <div className="pt-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          className="w-full"
                          variant={isFull ? "secondary" : "default"}
                          disabled={isFull || isJoining}
                          onClick={handleJoin}
                        >
                          {isFull 
                            ? "Partita al completo" 
                            : (isJoining ? "Iscrizione in corso..." : "Partecipa a questa partita")}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6">
                    <h3 className="font-medium text-lg mb-4 text-white">Schieramento Giocatori</h3>
                    <FootballField participants={match.participants} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MatchDetails;
