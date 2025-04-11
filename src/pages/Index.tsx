
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import MatchCard from "@/components/MatchCard";
import { Match, ViewMode } from "@/types";
import { mockMatches } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { GridIcon, List, Calendar } from "lucide-react";

const Index = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

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

  const renderMatches = () => {
    if (loading) {
      return (
        <div className="space-y-4 mt-6">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i} 
              className="h-64 bg-gray-200 rounded-md"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: [0.6, 0.8, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          ))}
        </div>
      );
    }

    if (matches.length === 0) {
      return (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg text-gray-500">
            Non ci sono partite questa settimana.
          </p>
        </motion.div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        {viewMode === "list" && (
          <motion.div 
            key="list-view"
            className="space-y-4 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MatchCard match={match} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {viewMode === "grid" && (
          <motion.div 
            key="grid-view"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex"
              >
                <MatchCard match={match} isCompact />
              </motion.div>
            ))}
          </motion.div>
        )}

        {viewMode === "calendar" && (
          <motion.div 
            key="calendar-view"
            className="mt-6 bg-white rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="p-4 bg-gradient-to-r from-primary/90 to-primary text-white">
              <h3 className="text-lg font-semibold">Calendario Partite</h3>
            </div>
            <div className="divide-y">
              {matches.map((match, index) => {
                const date = new Date(match.date);
                const formattedDate = date.toLocaleDateString('it-IT', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                });
                
                return (
                  <motion.div 
                    key={match.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center cursor-pointer"
                    onClick={() => window.location.href = `/match/${match.id}`}
                  >
                    <div>
                      <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
                      <p className="font-medium">{match.field}</p>
                      <p className="text-sm">{match.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{match.currentParticipants}/{match.totalParticipants}</p>
                      <p className="text-sm text-muted-foreground">€{match.price.toFixed(2)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <motion.h2 
                className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Partite della settimana
              </motion.h2>
              
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Trova e partecipa alle partite nella tua zona.
              </motion.p>
            </div>
            
            <motion.div 
              className="flex bg-white p-1 rounded-lg shadow-sm border space-x-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                variant={viewMode === "list" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode("list")}
                className="rounded-md"
              >
                <List className="h-4 w-4 mr-1" />
                <span className="sr-only sm:not-sr-only sm:text-xs">Lista</span>
              </Button>
              <Button 
                variant={viewMode === "grid" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode("grid")}
                className="rounded-md"
              >
                <GridIcon className="h-4 w-4 mr-1" />
                <span className="sr-only sm:not-sr-only sm:text-xs">Griglia</span>
              </Button>
              <Button 
                variant={viewMode === "calendar" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode("calendar")}
                className="rounded-md"
              >
                <Calendar className="h-4 w-4 mr-1" />
                <span className="sr-only sm:not-sr-only sm:text-xs">Calendario</span>
              </Button>
            </motion.div>
          </div>

          {renderMatches()}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
