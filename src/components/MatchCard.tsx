
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Calendar, Clock, Euro, Info, UserPlus, Bell, AlertTriangle } from "lucide-react";
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
  const [isJoining, setIsJoining] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  
  const isFull = match.currentParticipants >= match.totalParticipants;
  const isGoalkeeperMissing = !match.participants.some(p => p.position === 'GK');
  
  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
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
        <div className="p-3 border-l-4 border-calcio-green flex justify-between items-center">
          <div>
            <h3 className="font-medium text-sm">{match.field}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{match.time}</span>
              <span className="mx-1">•</span>
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{match.location}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Badge variant={isFull ? "secondary" : "outline"} className={isFull ? "bg-gray-200 hover:bg-gray-300 text-gray-700" : "bg-green-100 text-green-700 hover:bg-green-200"}>
              {match.currentParticipants}/{match.totalParticipants}
              {isFull && <span className="ml-1">Completo</span>}
            </Badge>
            <span className="text-xs text-muted-foreground mt-1">€{match.price.toFixed(2)}</span>
          </div>
        </div>
        {!isFull && isGoalkeeperMissing && (
          <div className="px-3 py-1 bg-orange-50 text-orange-700 text-xs flex items-center justify-center">
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
        <div className="bg-calcio-green text-white p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold truncate max-w-[70%]">{match.field}</h3>
            <Badge variant={isFull ? "secondary" : "success"} className={isFull ? "bg-gray-200 hover:bg-gray-300 text-gray-700" : "bg-green-100 text-green-700 hover:bg-green-200"}>
              {match.currentParticipants}/{match.totalParticipants}
              {isFull && <span className="ml-1">Completo</span>}
            </Badge>
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
          
          {!isFull && isGoalkeeperMissing && (
            <Alert variant="destructive" className="py-2 bg-orange-50 border-orange-200 text-orange-700">
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
          {isFull ? (
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
              disabled={isJoining}
              onClick={handleJoin}
            >
              <UserPlus className="h-4 w-4" />
              {isJoining ? "Iscrizione..." : "Partecipa"}
            </Button>
          )}
        </motion.div>
      </CardFooter>
    </Card>
  );
};

export default MatchCard;
