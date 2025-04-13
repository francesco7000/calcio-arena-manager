import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FootballField from "@/components/FootballField";
import Header from "@/components/Header";
import { Match, Participant } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const FormationEditor = () => {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const editable = true; // TODO: Implement editable option
  const { user } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [playerPositions, setPlayerPositions] = useState<{ [key: string]: { x: number, y: number } }>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch match data and formations
  const fetchMatch = useCallback(async () => {
    if (!matchId) return;

    setLoading(true);
    try {
      // Fetch match details
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;
      if (!matchData) throw new Error('Match not found');

      // Fetch participants
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

      // Fetch saved formation
      const { data: formationData, error: formationError } = await supabase
        .from('formations')
        .select('positions')
        .eq('match_id', matchId)
        .single();

      // Handle formation data
      if (formationData && formationData.positions) {
        try {
          const positions = JSON.parse(formationData.positions as string);
          setPlayerPositions(positions);
        } catch (parseError) {
          console.error('Error parsing formation positions:', parseError);
          setPlayerPositions({});
        }
      } else {
        setPlayerPositions({});
      }

      setMatch(fullMatch);
      setHasChanges(false);
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
  }, [matchId, toast]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  // Handle position changes
  const handlePositionChange = (participantId: string, x: number, y: number) => {
    setPlayerPositions(prev => {
      const newPositions = {
        ...prev,
        [participantId]: { x, y }
      };
      
      // Sempre marca le modifiche quando cambia una posizione
      setHasChanges(true);
      return newPositions;
    });
  };

  // Save formation to database
  const saveFormation = async () => {
    if (!matchId || !hasChanges) return;

    setSaving(true);

    try {
      const stringifiedPositions = JSON.stringify(playerPositions);

      // Check if formation exists
      const { data: existingFormation, error: fetchError } = await supabase
        .from('formations')
        .select('id')
        .eq('match_id', matchId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let result;
      
      // Update or insert based on existence
      if (existingFormation) {
        result = await supabase
          .from('formations')
          .update({ 
            positions: stringifiedPositions,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingFormation.id);
      } else {
        result = await supabase
          .from('formations')
          .insert({
            match_id: matchId,
            positions: stringifiedPositions,
            created_by: user?.id,
            updated_at: new Date().toISOString()
          });
      }

      if (result.error) throw result.error;

      toast({
        title: "Formazione salvata",
        description: "La formazione è stata salvata con successo",
      });

      setHasChanges(false);
      
      // Navigate back after successful save
      setTimeout(() => {
        navigate(`/match/${matchId}`);
      }, 800);
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

  // Reset formation positions
  const resetFormation = () => {
    // Imposta positions a un oggetto vuoto per tornare al layout di default
    setPlayerPositions({});
    setHasChanges(true);
    toast({
      title: "Formazione reimpostata",
      description: "Le posizioni dei giocatori sono state reimpostate"
    });
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
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Indietro
          </Button>
          
          <Button 
            variant="outline" 
            onClick={resetFormation}
            className="text-sm"
          >
            Reimposta
          </Button>
        </div>

        <div className="bg-white p-2 sm:p-4 rounded-xl shadow-md mb-4">
          <h1 className="text-xl font-bold text-center mb-2">{match.location || 'Campo'}</h1>
          
          <div className="rounded-xl overflow-hidden shadow border border-gray-200">
            <FootballField
              participants={match.participants}
              onPositionChange={handlePositionChange}
              initialPositions={playerPositions}
              editable={editable}
            />
          </div>
          
          <p className="text-sm text-gray-500 mt-2 text-center">
            {editable 
              ? "Trascina i giocatori per posizionarli sul campo" 
              : "Visualizzazione formazione"}
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            className="w-full"
            variant="default"
            disabled={saving || !hasChanges}
            onClick={saveFormation}
          >
            {saving ? "Salvataggio in corso..." : "Salva Formazione"}
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default FormationEditor;