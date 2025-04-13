import React, { useState, useEffect, useRef } from "react";
import { Participant } from "@/types";
import { motion } from "framer-motion";

interface FootballFieldProps {
  participants: Participant[];
  onPositionChange?: (participantId: string, x: number, y: number) => void;
  initialPositions?: {[key: string]: {x: number, y: number}} | null;
  editable?: boolean;
}

const FootballField: React.FC<FootballFieldProps> = ({ 
  participants, 
  onPositionChange,
  initialPositions,
  editable = false 
}) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<{[key: string]: {x: number, y: number}}>({});
  const [fieldSize, setFieldSize] = useState({ width: 0, height: 0 });
  
  // Misura le dimensioni del campo
  useEffect(() => {
    const updateSize = () => {
      if (fieldRef.current) {
        const rect = fieldRef.current.getBoundingClientRect();
        setFieldSize({ width: rect.width, height: rect.height });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Inizializza le posizioni quando cambiano initialPositions o le dimensioni del campo
  useEffect(() => {
    if (fieldSize.width === 0 || fieldSize.height === 0) return;
    
    // Se abbiamo posizioni iniziali, le usiamo
    if (initialPositions && Object.keys(initialPositions).length > 0) {
      setPositions(initialPositions);
      return;
    }
    
    // Altrimenti, creiamo posizioni predefinite
    const defaultPositions: {[key: string]: {x: number, y: number}} = {};
    
    // Organizziamo i giocatori per posizione e squadra
    const teamA = participants.filter(p => !p.team || p.team === 'A');
    const teamB = participants.filter(p => p.team === 'B');
    
    // Funzione per distribuire i giocatori orizzontalmente
    const distributeHorizontally = (players: Participant[], yPosition: number) => {
      const count = players.length;
      if (count === 0) return;
      
      const width = fieldSize.width;
      const spacing = width * 0.8 / Math.max(count, 1);
      const startX = width * 0.1;
      
      players.forEach((player, index) => {
        defaultPositions[player.id] = {
          x: startX + spacing * (index + 0.5),
          y: yPosition
        };
      });
    };
    
    // Posiziona i giocatori della squadra A
    const aGoalkeepers = teamA.filter(p => p.position === 'GK');
    const aDefenders = teamA.filter(p => p.position === 'DEF');
    const aMidfielders = teamA.filter(p => p.position === 'MID');
    const aForwards = teamA.filter(p => p.position === 'FWD');
    
    distributeHorizontally(aGoalkeepers, fieldSize.height * 0.1);
    distributeHorizontally(aDefenders, fieldSize.height * 0.25);
    distributeHorizontally(aMidfielders, fieldSize.height * 0.4);
    distributeHorizontally(aForwards, fieldSize.height * 0.55);
    
    // Posiziona i giocatori della squadra B
    const bGoalkeepers = teamB.filter(p => p.position === 'GK');
    const bDefenders = teamB.filter(p => p.position === 'DEF');
    const bMidfielders = teamB.filter(p => p.position === 'MID');
    const bForwards = teamB.filter(p => p.position === 'FWD');
    
    distributeHorizontally(bGoalkeepers, fieldSize.height * 0.9);
    distributeHorizontally(bDefenders, fieldSize.height * 0.75);
    distributeHorizontally(bMidfielders, fieldSize.height * 0.6);
    distributeHorizontally(bForwards, fieldSize.height * 0.45);
    
    setPositions(defaultPositions);
  }, [fieldSize, initialPositions, participants]);
  
  // Gestisce il trascinamento di un giocatore
  const handleDrag = (playerId: string, dragInfo: any) => {
    if (!editable || !fieldRef.current) return;
    
    const fieldRect = fieldRef.current.getBoundingClientRect();
    const playerElem = document.getElementById(`player-${playerId}`);
    
    if (playerElem) {
      const playerRect = playerElem.getBoundingClientRect();
      const playerCenterX = playerRect.width / 2;
      const playerCenterY = playerRect.height / 2;
      
      // Calcola la posizione relativa al campo, considerando il centro del giocatore
      const x = Math.max(playerCenterX, Math.min(fieldRect.width - playerCenterX, dragInfo.point.x - fieldRect.left));
      const y = Math.max(playerCenterY, Math.min(fieldRect.height - playerCenterY, dragInfo.point.y - fieldRect.top));
      
      // Aggiorna la posizione locale
      setPositions(prev => ({
        ...prev,
        [playerId]: { x, y }
      }));
    }
  };
  
  // Notifica il genitore quando il trascinamento è completato
  const handleDragEnd = (playerId: string, dragInfo: any) => {
    if (!editable || !fieldRef.current || !onPositionChange) return;
    
    const fieldRect = fieldRef.current.getBoundingClientRect();
    const playerElem = document.getElementById(`player-${playerId}`);
    
    if (playerElem) {
      const playerRect = playerElem.getBoundingClientRect();
      const playerCenterX = playerRect.width / 2;
      const playerCenterY = playerRect.height / 2;
      
      const x = Math.max(playerCenterX, Math.min(fieldRect.width - playerCenterX, dragInfo.point.x - fieldRect.left));
      const y = Math.max(playerCenterY, Math.min(fieldRect.height - playerCenterY, dragInfo.point.y - fieldRect.top));
      
      // Notifica il componente genitore
      onPositionChange(playerId, x, y);
    }
  };
  
  return (
    <div 
      ref={fieldRef}
      className="relative w-full h-[500px] sm:h-[600px] bg-gradient-to-b from-calcio-green to-calcio-darkGreen rounded-lg overflow-hidden border-2 border-white shadow-xl"
    >
      {/* Marcature del campo */}
      <FieldMarkings />
      
      {/* Giocatori */}
      {participants.map(player => {
        const pos = positions[player.id] || { x: fieldSize.width / 2, y: fieldSize.height / 2 };
        
        return (
          <Player
            key={player.id}
            id={`player-${player.id}`}
            player={player}
            position={pos}
            fieldRect={fieldRef.current?.getBoundingClientRect()}
            team={player.team || 'A'}
            isGoalkeeper={player.position === 'GK'}
            editable={editable}
            onDrag={(_, info) => handleDrag(player.id, info)}
            onDragEnd={(_, info) => handleDragEnd(player.id, info)}
          />
        );
      })}
    </div>
  );
};

// Componente con le marcature del campo
const FieldMarkings = () => (
  <div className="absolute inset-0 pointer-events-none">
    {/* Cerchio centrale */}
    <div className="absolute top-1/2 left-1/2 w-20 h-20 sm:w-28 sm:h-28 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute top-1/2 left-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
    
    {/* Linea centrale */}
    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -translate-y-1/2" />
    
    {/* Aree di rigore */}
    <div className="absolute top-0 left-1/2 w-36 sm:w-44 h-14 sm:h-16 border-b-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
    <div className="absolute bottom-0 left-1/2 w-36 sm:w-44 h-14 sm:h-16 border-t-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
    
    {/* Aree di porta */}
    <div className="absolute top-0 left-1/2 w-16 sm:w-20 h-5 sm:h-6 border-b-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
    <div className="absolute bottom-0 left-1/2 w-16 sm:w-20 h-5 sm:h-6 border-t-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
    
    {/* Dischetti del rigore */}
    <div className="absolute top-20 sm:top-24 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2" />
    <div className="absolute bottom-20 sm:bottom-24 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2" />
    
    {/* Archi d'angolo */}
    <div className="absolute top-0 left-0 w-5 h-5 border-r-2 border-white rounded-br-full" />
    <div className="absolute top-0 right-0 w-5 h-5 border-l-2 border-white rounded-bl-full" />
    <div className="absolute bottom-0 left-0 w-5 h-5 border-r-2 border-white rounded-tr-full" />
    <div className="absolute bottom-0 right-0 w-5 h-5 border-l-2 border-white rounded-tl-full" />
  </div>
);

// Componente Player
interface PlayerProps {
  id: string;
  player: Participant;
  position: { x: number, y: number };
  fieldRect?: DOMRect;
  team: string;
  isGoalkeeper?: boolean;
  editable?: boolean;
  onDrag?: (e: MouseEvent | TouchEvent, info: any) => void;
  onDragEnd?: (e: MouseEvent | TouchEvent, info: any) => void;
}

const Player: React.FC<PlayerProps> = ({
  id,
  player,
  position,
  team,
  isGoalkeeper = false,
  editable = false,
  onDrag,
  onDragEnd
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Colore della squadra
  const color = team === 'A' ? 'red' : 'blue';
  
  // Classi Tailwind per i colori
  const colorClasses = {
    red: "bg-red-500 hover:bg-red-600",
    blue: "bg-blue-500 hover:bg-blue-600"
  };

  const borderClasses = {
    red: "border-red-700",
    blue: "border-blue-700"
  };
  
  // Dimensioni del marcatore e del nome
  const markerSize = "w-8 h-8 sm:w-10 sm:h-10";
  const nameSize = "text-xs";
  
  // Gestisce il clic per mostrare i dettagli
  const handleClick = (e: React.MouseEvent) => {
    if (!editable) {
      e.stopPropagation();
      setShowDetails(!showDetails);
    }
  };
  
  return (
    <motion.div
      id={id}
      className="absolute flex flex-col items-center pointer-events-auto z-10"
      style={{
        left: position.x + 'px',
        top: position.y + 'px',
        transform: 'translate(-50%, -50%)'
      }}
      drag={editable}
      dragMomentum={false}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
    >
      <motion.div
        className={`
          ${colorClasses[color as keyof typeof colorClasses]} 
          ${isGoalkeeper ? 'ring-2 ring-yellow-300' : ''}
          ${markerSize} rounded-full flex items-center justify-center
          text-white font-bold shadow-md mb-1
          border-2 ${borderClasses[color as keyof typeof borderClasses]}
          ${editable ? 'cursor-move' : 'cursor-pointer'}
        `}
        whileHover={{ scale: 1.1 }}
        onClick={handleClick}
      >
        {player.number}
        
        {showDetails && (
          <motion.div 
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 bg-black/80 text-white text-xs p-1.5 rounded whitespace-nowrap z-20"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="font-semibold">{player.name}</div>
            <div className="text-[10px] opacity-80">{player.position}</div>
          </motion.div>
        )}
      </motion.div>
      
      <motion.span 
        className={`${nameSize} bg-black/60 text-white px-1 py-0.5 rounded-full whitespace-nowrap truncate max-w-full`}
      >
        {player.name.split(' ')[0]}
      </motion.span>
    </motion.div>
  );
};

export default FootballField;