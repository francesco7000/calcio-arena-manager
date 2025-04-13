import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import FootballField from "@/components/FootballField";
import Header from "@/components/Header";
import { Match, Participant } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const FormationEditor = () => {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatedPositions, setUpdatedPositions] = useState<{[key: string]: {x: number, y: number}} | null>(null);

  const fetchMatch = async () => {
    if (!matchId) return;
    
    setLoading(true);
    try {
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();
      
      if (matchError) throw matchError;
      if (!matchData) throw new Error('Match not found');
      
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('match_id', matchId);
      
      if (participantsError) throw participantsError;
      
      const fullMatch: Match = {
        ...matchData,
        totalParticipants: matchData.max_participants,
        currentParticipants: participants?.length || 0,
        participants: participants || [],
      };
      
      // Fetch existing formation if it exists
      const { data: formationData, error: formationError } = await supabase
        .from('formations')
        .select('positions')
        .eq('match_id', matchId)
        .single();
      
      if (formationError && formationError.code !== 'PGRST116') {
        console.error('Error fetching formation:', formationError);
      }
      
      if (formationData && formationData.positions) {
        try {
          setUpdatedPositions(JSON.parse(formationData.positions as string));
        } catch (parseError) {
          console.error('Error parsing formation positions:', parseError);
        }
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
  };

  useEffect(() => {
    fetchMatch();
  }, [matchId]);

  const handlePositionChange = (participantId: string, x: number, y: number) => {
    setUpdatedPositions(prevPositions => {
      const newPositions = { ...prevPositions, [participantId]: { x, y } };
      return newPositions;
    });
  };

  const saveFormation = async () => {
    if (!matchId || !updatedPositions) return;
    
    setSaving(true);
    
    try {
      const stringifiedPositions = JSON.stringify(updatedPositions);
      
      const { data: existingFormation, error: fetchError } = await supabase
        .from('formations')
        .select('*')
        .eq('match_id', matchId)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      if (existingFormation) {
        // Update existing formation
        const { error: updateError } = await supabase
          .from('formations')
          .update({ positions: stringifiedPositions })
          .eq('id', existingFormation.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new formation
        const { error: insertError } = await supabase
          .from('formations')
          .insert({
            match_id: matchId,
            positions: stringifiedPositions
          });
        
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Formazione salvata",
        description: "La formazione è stata salvata con successo",
      });
      
      navigate(`/match/${matchId}`);
    } catch (error) {
      console.error('Error saving formation:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio della formazione.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
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
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Editor Formazione
            </h2>
            <p className="text-muted-foreground">
              Disponi i giocatori sul campo.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="overflow-hidden border-none shadow-lg">
              <CardContent className="p-6">
                <FootballField 
                  participants={match.participants}
                  onPositionChange={handlePositionChange}
                  initialPositions={updatedPositions}
                  editable={true}
                />
              </CardContent>
            </Card>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="w-full"
                variant="default"
                disabled={saving}
                onClick={saveFormation}
              >
                {saving ? "Salvataggio..." : "Salva Formazione"}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default FormationEditor;
