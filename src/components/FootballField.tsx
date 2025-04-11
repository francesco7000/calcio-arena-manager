import { useState } from "react";
import { Participant } from "@/types";
import { motion } from "framer-motion";

interface FootballFieldProps {
  participants: Participant[];
}

const FootballField = ({ participants }: FootballFieldProps) => {
  // Split participants into teams
  const teamA = participants.filter(p => !p.team || p.team === 'A');
  const teamB = participants.filter(p => p.team === 'B');
  
  // Filter by position within each team
  const goalkeepersA = teamA.filter(p => p.position === 'GK');
  const defendersA = teamA.filter(p => p.position === 'DEF');
  const midfieldersA = teamA.filter(p => p.position === 'MID');
  const forwardsA = teamA.filter(p => p.position === 'FWD');

  const goalkeepersB = teamB.filter(p => p.position === 'GK');
  const defendersB = teamB.filter(p => p.position === 'DEF');
  const midfieldersB = teamB.filter(p => p.position === 'MID');
  const forwardsB = teamB.filter(p => p.position === 'FWD');

  return (
    <div className="relative w-full min-h-[500px] sm:min-h-[600px] bg-gradient-to-b from-calcio-green to-calcio-darkGreen rounded-lg overflow-hidden border-4 border-white shadow-xl">
      {/* Field markings */}
      <div className="absolute inset-0">
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        
        {/* Center line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -translate-y-1/2" />
        
        {/* Penalty areas */}
        <div className="absolute top-0 left-1/2 w-40 sm:w-48 h-16 sm:h-20 border-b-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-40 sm:w-48 h-16 sm:h-20 border-t-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
        
        {/* Goal areas */}
        <div className="absolute top-0 left-1/2 w-20 sm:w-24 h-6 sm:h-8 border-b-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-20 sm:w-24 h-6 sm:h-8 border-t-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
        
        {/* Penalty spots */}
        <div className="absolute top-24 sm:top-28 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2" />
        <div className="absolute bottom-24 sm:bottom-28 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2" />
        
        {/* Corner arcs */}
        <div className="absolute top-0 left-0 w-6 h-6 border-r-2 border-white rounded-br-full" />
        <div className="absolute top-0 right-0 w-6 h-6 border-l-2 border-white rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-r-2 border-white rounded-tr-full" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-l-2 border-white rounded-tl-full" />
      </div>

      {/* Teams */}
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {/* Team A (top half) */}
        <div className="relative flex-1 flex flex-col items-center justify-around pt-4 pb-12">
          {/* Forwards */}
          <div className="w-full px-4">
            <div className="flex justify-around">
              {forwardsA.map((player) => (
                <PlayerMarker key={player.id} player={player} color="red" />
              ))}
            </div>
          </div>
          
          {/* Midfielders */}
          <div className="w-full px-4">
            <div className="flex justify-around">
              {midfieldersA.map((player) => (
                <PlayerMarker key={player.id} player={player} color="red" />
              ))}
            </div>
          </div>
          
          {/* Defenders */}
          <div className="w-full px-4">
            <div className="flex justify-around">
              {defendersA.map((player) => (
                <PlayerMarker key={player.id} player={player} color="red" />
              ))}
            </div>
          </div>
          
          {/* Goalkeeper */}
          <div className="w-full px-4">
            <div className="flex justify-center">
              {goalkeepersA.map((player) => (
                <PlayerMarker key={player.id} player={player} color="red" isGoalkeeper />
              ))}
            </div>
          </div>
        </div>
        
        {/* Team B (bottom half) */}
        <div className="relative flex-1 flex flex-col-reverse items-center justify-around pt-12 pb-4">
          {/* Forwards */}
          <div className="w-full px-4">
            <div className="flex justify-around">
              {forwardsB.map((player) => (
                <PlayerMarker key={player.id} player={player} color="blue" />
              ))}
            </div>
          </div>
          
          {/* Midfielders */}
          <div className="w-full px-4">
            <div className="flex justify-around">
              {midfieldersB.map((player) => (
                <PlayerMarker key={player.id} player={player} color="blue" />
              ))}
            </div>
          </div>
          
          {/* Defenders */}
          <div className="w-full px-4">
            <div className="flex justify-around">
              {defendersB.map((player) => (
                <PlayerMarker key={player.id} player={player} color="blue" />
              ))}
            </div>
          </div>
          
          {/* Goalkeeper */}
          <div className="w-full px-4">
            <div className="flex justify-center">
              {goalkeepersB.map((player) => (
                <PlayerMarker key={player.id} player={player} color="blue" isGoalkeeper />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PlayerMarkerProps {
  player: Participant;
  color: string;
  isGoalkeeper?: boolean;
}

const PlayerMarker = ({ player, color, isGoalkeeper = false }: PlayerMarkerProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Map colors to Tailwind classes
  const colorClasses = {
    red: "bg-red-500 hover:bg-red-600",
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-600 hover:bg-green-700",
    yellow: "bg-yellow-400 hover:bg-yellow-500"
  };

  const borderClasses = {
    red: "border-red-700",
    blue: "border-blue-700",
    green: "border-green-800",
    yellow: "border-yellow-600"
  };

  return (
    <motion.div 
      className="flex flex-col items-center cursor-pointer max-w-[60px] pointer-events-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.random() * 0.5 }}
      whileHover={{ scale: 1.1 }}
      onClick={() => setShowDetails(!showDetails)}
    >
      <motion.div 
        className={`
          ${colorClasses[color as keyof typeof colorClasses]} 
          ${isGoalkeeper ? 'ring-2 ring-yellow-300' : ''}
          w-10 h-10 rounded-full flex items-center justify-center
          text-white font-bold relative mb-1 shadow-md
          border-2 ${borderClasses[color as keyof typeof borderClasses]}
        `}
        whileHover={{ y: -2 }}
      >
        {player.number}
        
        {showDetails && (
          <motion.div 
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 bg-black/80 text-white text-xs p-1.5 rounded whitespace-nowrap z-10"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="font-semibold">{player.name}</div>
            <div className="text-[10px] opacity-80">{player.position}</div>
          </motion.div>
        )}
      </motion.div>
      
      <motion.span 
        className="text-xs bg-black/60 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap truncate max-w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {player.name.split(' ')[0]}
      </motion.span>
    </motion.div>
  );
};

export default FootballField;
