
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Calendar, Clock, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Match } from "@/types";

interface MatchCardProps {
  match: Match;
}

const MatchCard = ({ match }: MatchCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  
  const isFull = match.currentParticipants >= match.totalParticipants;
  
  const handleJoin = () => {
    if (isFull) return;
    
    setIsJoining(true);
    // Simulazione di una chiamata API
    setTimeout(() => {
      setIsJoining(false);
      toast({
        title: "Iscrizione confermata!",
        description: "Ti sei iscritto alla partita con successo.",
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

  return (
    <Card className="overflow-hidden animate-slide-up">
      <CardContent className="p-0">
        <div className="bg-calcio-green text-white p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold truncate max-w-[70%]">{match.field}</h3>
            <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
              {match.currentParticipants}/{match.totalParticipants}
            </span>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-calcio-green" />
            <span className="text-sm capitalize">{formatDate(match.date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-calcio-green" />
            <span className="text-sm">{match.time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-calcio-green" />
            <span className="text-sm truncate">{match.location}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-calcio-green" />
            <span className="text-sm">Organizz.: {match.organizer}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-calcio-green" />
            <span className="text-sm">Quota: €{match.price.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between p-4 pt-0 gap-2">
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={handleViewDetails}
        >
          Info
        </Button>
        <Button 
          variant={isFull ? "secondary" : "default"}
          className={`flex-1 ${isFull ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : ''}`}
          disabled={isFull || isJoining}
          onClick={handleJoin}
        >
          {isFull ? "Completo" : (isJoining ? "Iscrizione..." : "Partecipa")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MatchCard;
