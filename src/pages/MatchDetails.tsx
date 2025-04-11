
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Users, Calendar, Clock, Euro, ArrowLeft, User } from "lucide-react";
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 container py-6 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-calcio-green border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 container py-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Indietro
          </Button>
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              Partita non trovata.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isFull = match.currentParticipants >= match.totalParticipants;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Indietro
        </Button>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              {match.field}
            </h2>
            <div className="flex items-center text-muted-foreground">
              <Users className="mr-1 h-4 w-4" />
              <span>
                {match.currentParticipants}/{match.totalParticipants} partecipanti
              </span>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Dettagli della partita</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-calcio-green" />
                        <span className="capitalize">{formatDate(match.date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-calcio-green" />
                        <span>{match.time}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-calcio-green" />
                        <span>{match.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-calcio-green" />
                        <span>Organizz.: {match.organizer}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-calcio-green" />
                        <span>Quota: €{match.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
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
                  </div>
                </div>
                
                <div className="md:pt-6">
                  <h3 className="font-medium mb-4">Giocatori iscritti</h3>
                  <FootballField participants={match.participants} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MatchDetails;
