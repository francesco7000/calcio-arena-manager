
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import MatchCard from "@/components/MatchCard";
import { Match, ViewMode } from "@/types";
import { mockMatches } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { 
  List, 
  LayoutList,
  Filter, 
  CheckCircle2, 
  CircleDashed,
  Calendar,
  UserCheck 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FilterOption = 'all' | 'available' | 'full';
type ViewTab = 'weekly' | 'participating';

const Index = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [viewTab, setViewTab] = useState<ViewTab>("weekly");

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

  const handleFilterChange = (option: FilterOption) => {
    setFilterOption(option);
  };

  const filteredMatches = matches.filter(match => {
    if (filterOption === 'available') {
      return match.currentParticipants < match.totalParticipants;
    } else if (filterOption === 'full') {
      return match.currentParticipants >= match.totalParticipants;
    }
    return true;
  });

  // Matches you're participating in (for demo purposes, let's assume you're in matches with ID ending in '1')
  const participatingMatches = matches.filter(match => match.id.endsWith('1'));

  const currentMatches = viewTab === "weekly" ? filteredMatches : participatingMatches;

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

    if (currentMatches.length === 0) {
      return (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg text-gray-500">
            {viewTab === "weekly" 
              ? "Non ci sono partite che corrispondono ai criteri selezionati."
              : "Non stai partecipando a nessuna partita al momento."}
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
            {currentMatches.map((match, index) => (
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

        {viewMode === "compact" && (
          <motion.div 
            key="compact-view"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {currentMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MatchCard match={match} isCompact={true} />
              </motion.div>
            ))}
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
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title and description in their own section */}
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
          
          {/* Tabs to switch between weekly matches and participating matches */}
          <Tabs 
            value={viewTab} 
            onValueChange={(value) => setViewTab(value as ViewTab)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Partite della settimana</span>
              </TabsTrigger>
              <TabsTrigger value="participating" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span>Le mie partite</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly">
              {/* Controls for weekly matches view */}
              <div className="flex items-center gap-2 justify-end">
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
                    <span className="text-xs">Lista</span>
                  </Button>
                  <Button 
                    variant={viewMode === "compact" ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode("compact")}
                    className="rounded-md"
                  >
                    <LayoutList className="h-4 w-4 mr-1" />
                    <span className="text-xs">Compatta</span>
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="ml-2">
                        <Filter className="h-4 w-4 mr-1" />
                        <span className="text-xs">Filtri</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel>Filtra partite</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem 
                          onClick={() => handleFilterChange('all')} 
                          className="cursor-pointer"
                        >
                          <div className="flex items-center w-full">
                            {filterOption === 'all' && <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />}
                            {filterOption !== 'all' && <CircleDashed className="h-4 w-4 mr-2 text-muted-foreground" />}
                            <span>Tutte le partite</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleFilterChange('available')} 
                          className="cursor-pointer"
                        >
                          <div className="flex items-center w-full">
                            {filterOption === 'available' && <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />}
                            {filterOption !== 'available' && <CircleDashed className="h-4 w-4 mr-2 text-muted-foreground" />}
                            <span>Partite con posti</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleFilterChange('full')} 
                          className="cursor-pointer"
                        >
                          <div className="flex items-center w-full">
                            {filterOption === 'full' && <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />}
                            {filterOption !== 'full' && <CircleDashed className="h-4 w-4 mr-2 text-muted-foreground" />}
                            <span>Partite al completo</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              </div>
            </TabsContent>
            
            <TabsContent value="participating">
              {/* View controls for participating matches */}
              <div className="flex items-center gap-2 justify-end">
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
                    <span className="text-xs">Lista</span>
                  </Button>
                  <Button 
                    variant={viewMode === "compact" ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode("compact")}
                    className="rounded-md"
                  >
                    <LayoutList className="h-4 w-4 mr-1" />
                    <span className="text-xs">Compatta</span>
                  </Button>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>

          {renderMatches()}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
