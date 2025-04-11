
import { Participant } from "@/types";

interface FootballFieldProps {
  participants: Participant[];
}

const FootballField = ({ participants }: FootballFieldProps) => {
  // Filtramos a los participantes por posición
  const goalkeepers = participants.filter(p => p.position === 'GK');
  const defenders = participants.filter(p => p.position === 'DEF');
  const midfielders = participants.filter(p => p.position === 'MID');
  const forwards = participants.filter(p => p.position === 'FWD');

  return (
    <div className="relative w-full aspect-[2/3] bg-calcio-green rounded-lg overflow-hidden border-2 border-white">
      {/* Líneas del campo */}
      <div className="absolute inset-0">
        {/* Línea central */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -translate-y-1/2" />
        
        {/* Círculo central */}
        <div className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2" />
        
        {/* Área pequeña superior */}
        <div className="absolute top-0 left-1/2 w-24 h-6 border-b-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
        
        {/* Área grande superior */}
        <div className="absolute top-0 left-1/2 w-40 h-16 border-b-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
        
        {/* Área pequeña inferior */}
        <div className="absolute bottom-0 left-1/2 w-24 h-6 border-t-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
        
        {/* Área grande inferior */}
        <div className="absolute bottom-0 left-1/2 w-40 h-16 border-t-2 border-l-2 border-r-2 border-white transform -translate-x-1/2" />
      </div>

      {/* Jugadores */}
      <div className="absolute inset-0 flex flex-col">
        {/* Delanteros */}
        <div className="relative flex-1 flex justify-center pt-8">
          <div className="flex flex-wrap justify-center gap-4 max-w-xs">
            {forwards.map((player) => (
              <PlayerMarker key={player.id} player={player} color="red" />
            ))}
          </div>
        </div>
        
        {/* Mediocampistas */}
        <div className="relative flex-1 flex justify-center">
          <div className="flex flex-wrap justify-center gap-4 max-w-xs">
            {midfielders.map((player) => (
              <PlayerMarker key={player.id} player={player} color="blue" />
            ))}
          </div>
        </div>
        
        {/* Defensas */}
        <div className="relative flex-1 flex justify-center">
          <div className="flex flex-wrap justify-center gap-4 max-w-xs">
            {defenders.map((player) => (
              <PlayerMarker key={player.id} player={player} color="green" />
            ))}
          </div>
        </div>
        
        {/* Portero */}
        <div className="relative flex-1 flex justify-center pb-4">
          <div className="flex justify-center">
            {goalkeepers.map((player) => (
              <PlayerMarker key={player.id} player={player} color="yellow" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface PlayerMarkerProps {
  player: Participant;
  color: string;
}

const PlayerMarker = ({ player, color }: PlayerMarkerProps) => {
  // Mapa de colores a clases de Tailwind
  const colorClasses = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-600",
    yellow: "bg-yellow-400"
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`${colorClasses[color as keyof typeof colorClasses]} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold relative mb-1`}
      >
        {player.number}
      </div>
      <span className="text-xs text-white bg-black/50 px-1 rounded whitespace-nowrap">
        {player.name}
      </span>
    </div>
  );
};

export default FootballField;
