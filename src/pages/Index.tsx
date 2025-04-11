
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MatchCard from "@/components/MatchCard";
import { Match } from "@/types";
import { mockMatches } from "@/data/mockData";

const Index = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const fetchMatches = () => {
      setLoading(true);
      // Simulación de API call
      setTimeout(() => {
        setMatches(mockMatches);
        setLoading(false);
      }, 1000);
    };

    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Partite della settimana
          </h2>
          
          <p className="text-muted-foreground">
            Trova e partecipa alle partite nella tua zona.
          </p>

          {loading ? (
            <div className="space-y-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="h-64 bg-gray-200 animate-pulse rounded-md"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 mt-6">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
              
              {matches.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-500">
                    Non ci sono partite questa settimana.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
