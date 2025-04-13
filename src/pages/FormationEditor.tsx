import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Match } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface PlayerPosition {
  id: string;
  x: number;
  y: number;
  color: string;
  lastTap?: number; // Timestamp dell'ultimo tap per gestire il doppio tap su mobile
}

const FormationEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerPositions, setPlayerPositions] = useState<Record<string, PlayerPosition>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Colori disponibili per le magliette
  const jerseyColors = [
    { id: "red", color: "#F99DA3", bgColor: "bg-calcio-red", textColor: "text-white" },
    { id: "blue", color: "#5A9CE0", bgColor: "bg-calcio-darkBlue", textColor: "text-white" },
    { id: "green", color: "#5BA25F", bgColor: "bg-calcio-darkGreen", textColor: "text-white" },
    { id: "yellow", color: "#FFD700", bgColor: "bg-yellow-400", textColor: "text-black" },
    { id: "black", color: "#333333", bgColor: "bg-calcio-darkGray", textColor: "text-white" }
  ];

  // Fetch match data
  useEffect(() => {
    const fetchMatch = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch match data from Supabase
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .eq('id', id)
          .single();
        
        if (matchError) throw matchError;
        if (!matchData) throw new Error('Match not found');
        
        // Fetch participants for this match
        const { data: participants, error: participantsError } = await supabase
          .from('participants')
          .select('*')
          .eq('match_id', id);
        
        if (participantsError) throw participantsError;
        
        // Transform data to match our frontend model
        const fullMatch: Match = {
          ...matchData,
          totalParticipants: matchData.max_participants,
          currentParticipants: participants?.length || 0,
          participants: participants || [],
        };
        
        setMatch(fullMatch);
        
        // Fetch existing formation if available
        const { data: formationData, error: formationError } = await supabase
          .from('formations')
          .select('*')
          .eq('match_id', id)
          .single();
        
        if (!formationError && formationData && formationData.positions) {
          setPlayerPositions(JSON.parse(formationData.positions));
        }
      } catch (error) {
        console.error('Error fetching match details:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare i dati della partita",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id, toast]);

  // Genera un ID univoco per ogni nuova maglietta
  const generateUniqueId = () => {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
  };

  // Funzione per verificare se un punto è all'interno dei limiti del campo
  // Modificata per essere meno restrittiva sui bordi, specialmente sopra e a sinistra
  const isWithinField = (x, y) => {
    // Impostiamo margini più permissivi, specialmente a sinistra e in alto
    const marginLeft = 0.01;
    const marginTop = 0.01;
    const marginRight = 0.03;
    const marginBottom = 0.03;
    
    return x >= marginLeft && x <= (1 - marginRight) && y >= marginTop && y <= (1 - marginBottom);
  };

  // Handle drag end event per le magliette già posizionate
  const handleDragEnd = (playerId, newX, newY) => {
    if (isWithinField(newX, newY)) {
      // Solo se la nuova posizione è all'interno dei limiti del campo, aggiorniamo
      setPlayerPositions(prev => ({
        ...prev,
        [playerId]: { ...prev[playerId], x: newX, y: newY }
      }));
    }
  };
  
  // Crea una nuova maglietta sul campo
  const createNewJersey = (colorId, x, y) => {
    // Verifichiamo che la posizione sia all'interno dei limiti del campo
    if (isWithinField(x, y)) {
      const color = jerseyColors.find(c => c.id === colorId)?.color || "#FFFFFF";
      const newId = generateUniqueId();
      
      setPlayerPositions(prev => ({
        ...prev,
        [newId]: { id: newId, x, y, color }
      }));
    }
  };

  // Save formation
  const saveFormation = async () => {
    if (!match) return;
    
    setIsSaving(true);
    try {
      const formationData = {
        match_id: match.id,
        positions: JSON.stringify(playerPositions),
        updated_at: new Date().toISOString()
      };
      
      // Check if formation already exists
      const { data: existingFormation } = await supabase
        .from('formations')
        .select('id')
        .eq('match_id', match.id)
        .single();
      
      if (existingFormation) {
        // Update existing formation
        const { error } = await supabase
          .from('formations')
          .update(formationData)
          .eq('id', existingFormation.id);
        
        if (error) throw error;
      } else {
        // Create new formation
        const { error } = await supabase
          .from('formations')
          .insert(formationData);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving formation:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Rimuovi una maglietta dal campo
  const removeJersey = (id) => {
    setPlayerPositions(prev => {
      const newPositions = {...prev};
      delete newPositions[id];
      return newPositions;
    });
    
    // Feedback sonoro (opzionale)
    try {
      const audio = new Audio();
      audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDAwMD///////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAAAbA2+aXzAAAAAAAAAAAAAAAAAAAA';
      audio.volume = 0.2;
      audio.play().catch(() => {});
    } catch (e) {
      // Ignora errori di riproduzione audio
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
      
      <main className="flex-1 container py-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(`/match/${id}`)} className="group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Torna ai dettagli
          </Button>
          
          <Button 
            onClick={saveFormation} 
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salva formazione
              </>
            )}
          </Button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col"
        >
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Editor Formazione - {match.field}
          </h2>
          
          {/* Campo da calcio con barra magliette integrata */}
          <div className="flex-1 relative">
            {/* Campo da calcio */}
            <div id="football-field" className="flex-1 relative bg-gradient-to-b from-calcio-green to-calcio-darkGreen rounded-lg overflow-hidden border-2 border-white shadow-xl" style={{ height: 'calc(100vh - 250px)', zIndex: 0 }}>
              {/* Field markings */}
              <div className="absolute inset-0">
                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 w-28 h-28 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                
                {/* Center line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -translate-y-1/2" />
                
                {/* Penalty areas */}
                <div className="absolute top-0 left-1/2 w-44 h-18 border-b-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
                <div className="absolute bottom-0 left-1/2 w-44 h-18 border-t-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
                
                {/* Goal areas */}
                <div className="absolute top-0 left-1/2 w-22 h-7 border-b-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
                <div className="absolute bottom-0 left-1/2 w-22 h-7 border-t-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
                
                {/* Penalty spots */}
                <div className="absolute top-24 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2" />
                <div className="absolute bottom-24 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2" />
                
                {/* Corner arcs */}
                <div className="absolute top-0 left-0 w-5 h-5 border-r-2 border-white rounded-br-full" />
                <div className="absolute top-0 right-0 w-5 h-5 border-l-2 border-white rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-r-2 border-white rounded-tr-full" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-l-2 border-white rounded-tl-full" />
              </div>
              
              {/* Draggable jerseys */}
              {Object.values(playerPositions).map((position) => (
                <motion.div
                  key={position.id}
                  style={{
                    position: 'absolute',
                    left: `${position.x * 100}%`,
                    top: `${position.y * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    touchAction: 'none',
                    backgroundColor: position.color,
                    zIndex: 40,
                    width: '48px',
                    height: '48px',
                    pointerEvents: 'auto'
                  }}
                  className="rounded-full flex items-center justify-center shadow-md cursor-move relative group"
                  whileHover={{ scale: 1.1, boxShadow: '0 0 12px rgba(0,0,0,0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  onPointerDown={(e) => {
                    // Preveniamo il comportamento di default
                    e.preventDefault();
                    
                    const field = document.getElementById('football-field');
                    if (!field) return;
                    
                    // Impostiamo il cursore
                    field.style.cursor = 'grabbing';
                    
                    // Otteniamo le dimensioni e la posizione del campo
                    const fieldRect = field.getBoundingClientRect();
                    
                    // Posizione iniziale per calcolare il movimento relativo
                    const startPositionX = position.x;
                    const startPositionY = position.y;
                    const startClientX = e.clientX;
                    const startClientY = e.clientY;
                    
                    // Funzione per aggiornare la posizione durante il movimento
                    const updatePosition = (moveEvent) => {
                      // Calcoliamo lo spostamento relativo in pixel
                      const deltaX = moveEvent.clientX - startClientX;
                      const deltaY = moveEvent.clientY - startClientY;
                      
                      // Convertiamo lo spostamento in coordinate relative (0-1)
                      const newX = startPositionX + (deltaX / fieldRect.width);
                      const newY = startPositionY + (deltaY / fieldRect.height);
                      
                      // Verifichiamo che la nuova posizione sia all'interno dei limiti del campo
                      if (isWithinField(newX, newY)) {
                        // Aggiorniamo la posizione solo se è all'interno dei limiti
                        setPlayerPositions(prev => ({
                          ...prev,
                          [position.id]: { ...prev[position.id], x: newX, y: newY }
                        }));
                      }
                    };
                    
                    // Funzione per terminare il trascinamento
                    const endDrag = (upEvent) => {
                      // Ripristiniamo il cursore
                      field.style.cursor = 'default';
                      
                      // Rimuoviamo gli event listener
                      window.removeEventListener('pointermove', updatePosition);
                      window.removeEventListener('pointerup', endDrag);
                      
                      // Calcoliamo lo spostamento finale
                      const deltaX = upEvent.clientX - startClientX;
                      const deltaY = upEvent.clientY - startClientY;
                      
                      // Convertiamo in coordinate relative
                      const newX = startPositionX + (deltaX / fieldRect.width);
                      const newY = startPositionY + (deltaY / fieldRect.height);
                      
                      // Chiamiamo handleDragEnd con la posizione finale
                      handleDragEnd(position.id, newX, newY);
                    };
                    
                    // Aggiungiamo gli event listener
                    window.addEventListener('pointermove', updatePosition);
                    window.addEventListener('pointerup', endDrag);
                  }}
                  onClick={(e) => {
                    // Verifichiamo se è un doppio click
                    if (e.detail === 2) {
                      removeJersey(position.id);
                    }
                  }}
                  onTouchStart={(e) => {
                    // Inizializziamo il contatore per il doppio tap
                    const now = new Date().getTime();
                    const timeSince = now - (position.lastTap || 0);
                    
                    if (timeSince < 300) {
                      // È un doppio tap
                      removeJersey(position.id);
                    }
                    
                    // Aggiorniamo il timestamp dell'ultimo tap
                    setPlayerPositions(prev => ({
                      ...prev,
                      [position.id]: { ...prev[position.id], lastTap: now }
                    }));
                  }}
                >
                  <span className="font-bold text-white">?</span>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/90 text-xs px-2 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap">
                    Doppio click per rimuovere
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Barra magliette fissa in basso */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-white/90 backdrop-blur-sm rounded-t-lg shadow-lg p-3 z-50">
              <h3 className="text-sm font-medium mb-2 text-gray-500">Trascina le magliette sul campo</h3>
              <div className="flex gap-3 items-center">
                {jerseyColors.map((jersey) => (
                  <div 
                    key={jersey.id}
                    className="relative"
                    onMouseDown={(e) => {
                      // Creiamo una copia della maglietta che seguirà il cursore
                      const jerseyElement = e.currentTarget.firstChild as HTMLElement;
                      if (!jerseyElement) return;
                      
                      // Creiamo un elemento clone che seguirà il mouse
                      const clone = document.createElement('div');
                      clone.className = `w-12 h-12 rounded-full flex items-center justify-center shadow-md cursor-grabbing absolute z-[999]`;
                      clone.style.backgroundColor = jersey.color;
                      clone.style.position = 'fixed';
                      clone.style.left = `${e.clientX - 24}px`;
                      clone.style.top = `${e.clientY - 24}px`;
                      clone.style.transform = 'scale(1.2)';
                      clone.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
                      clone.style.pointerEvents = 'none';
                      clone.innerHTML = '<span class="font-bold text-white">?</span>';
                      document.body.appendChild(clone);
                      
                      // Impostiamo il cursore
                      document.body.style.cursor = 'grabbing';
                      
                      // Funzione per spostare il clone con il mouse
                      const moveClone = (moveEvent: MouseEvent) => {
                        clone.style.left = `${moveEvent.clientX - 24}px`;
                        clone.style.top = `${moveEvent.clientY - 24}px`;
                      };
                      
                      // Funzione per gestire il rilascio
                      const releaseClone = (upEvent: MouseEvent) => {
                        document.body.style.cursor = 'default';
                        document.removeEventListener('mousemove', moveClone);
                        document.removeEventListener('mouseup', releaseClone);
                        
                        // Controlliamo se il rilascio è avvenuto sul campo
                        const field = document.getElementById('football-field');
                        if (!field) {
                          document.body.removeChild(clone);
                          return;
                        }
                        
                        const fieldRect = field.getBoundingClientRect();
                        const centerX = upEvent.clientX;
                        const centerY = upEvent.clientY;
                        
                        // Check if released over the field
                        if (
                          centerX > fieldRect.left &&
                          centerX < fieldRect.right &&
                          centerY > fieldRect.top &&
                          centerY < fieldRect.bottom
                        ) {
                          // Calcola la posizione relativa all'interno del campo
                          const x = (centerX - fieldRect.left) / fieldRect.width;
                          const y = (centerY - fieldRect.top) / fieldRect.height;
                          
                          createNewJersey(jersey.id, x, y);
                        }
                        
                        // Rimuoviamo il clone
                        document.body.removeChild(clone);
                      };
                      
                      // Aggiungiamo gli event listener
                      document.addEventListener('mousemove', moveClone);
                      document.addEventListener('mouseup', releaseClone);
                    }}
                    onTouchStart={(e) => {
                      // Preveniamo il comportamento di default per evitare lo scroll
                      e.preventDefault();
                      
                      // Otteniamo le coordinate del touch
                      const touch = e.touches[0];
                      const touchX = touch.clientX;
                      const touchY = touch.clientY;
                      
                      // Creiamo un elemento clone che seguirà il touch
                      const clone = document.createElement('div');
                      clone.className = `w-12 h-12 rounded-full flex items-center justify-center shadow-md absolute z-[999]`;
                      clone.style.backgroundColor = jersey.color;
                      clone.style.position = 'fixed';
                      clone.style.left = `${touchX - 24}px`;
                      clone.style.top = `${touchY - 24}px`;
                      clone.style.transform = 'scale(1.2)';
                      clone.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
                      clone.style.pointerEvents = 'none';
                      clone.innerHTML = '<span class="font-bold text-white">?</span>';
                      document.body.appendChild(clone);
                      
                      // Funzione per spostare il clone con il touch
                      const moveClone = (moveEvent: TouchEvent) => {
                        const moveTouch = moveEvent.touches[0];
                        clone.style.left = `${moveTouch.clientX - 24}px`;
                        clone.style.top = `${moveTouch.clientY - 24}px`;
                      };
                      
                      // Funzione per gestire il rilascio del touch
                      const releaseClone = (endEvent: TouchEvent) => {
                        document.removeEventListener('touchmove', moveClone as any);
                        document.removeEventListener('touchend', releaseClone as any);
                        
                        // Se non ci sono touch, usiamo l'ultimo touch conosciuto
                        const lastTouch = endEvent.changedTouches[0];
                        const endX = lastTouch.clientX;
                        const endY = lastTouch.clientY;
                        
                        // Controlliamo se il rilascio è avvenuto sul campo
                        const field = document.getElementById('football-field');
                        if (!field) {
                          document.body.removeChild(clone);
                          return;
                        }
                        
                        const fieldRect = field.getBoundingClientRect();
                        
                        // Check if released over the field
                        if (
                          endX > fieldRect.left &&
                          endX < fieldRect.right &&
                          endY > fieldRect.top &&
                          endY < fieldRect.bottom
                        ) {
                          // Calcola la posizione relativa all'interno del campo
                          const x = (endX - fieldRect.left) / fieldRect.width;
                          const y = (endY - fieldRect.top) / fieldRect.height;
                          
                          createNewJersey(jersey.id, x, y);
                        }
                        
                        // Rimuoviamo il clone
                        document.body.removeChild(clone);
                      };
                      
                      // Aggiungiamo gli event listener per il touch
                      document.addEventListener('touchmove', moveClone as any);
                      document.addEventListener('touchend', releaseClone as any);
                    }}
                  >
                    <motion.div
                      style={{ backgroundColor: jersey.color }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md cursor-grab ${jersey.textColor}`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="font-bold">?</span>
                    </motion.div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Doppio click su una maglietta per rimuoverla dal campo • Trascina per riposizionare</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default FormationEditor;