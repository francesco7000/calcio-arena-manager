import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import MatchCard from "@/components/MatchCard";
import { Match, ViewMode } from "@/types";
import { mockMatches } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { List, LayoutList, Filter, CheckCircle2, CircleDashed, Calendar, UserCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
type FilterOption = 'all' | 'available' | 'full';
type ViewTab = 'weekly' | 'participating';
const Index = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [viewTab, setViewTab] = useState<ViewTab>("weekly");
  const { user, isAuthenticated } = useAuth();
  const [myMatches, setMyMatches] = useState<Match[]>([]);
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        // Fetch real data from Supabase
        const { data, error } = await supabase
          .from('matches')
          .select('*');
        
        if (error) throw error;
        
        // Transform data to match our frontend model if needed
        const transformedMatches = data.map(match => ({
          ...match,
          totalParticipants: match.max_participants,
          currentParticipants: match.current_participants || 0,
          participants: []
        }));
        
        // For each match, fetch its participants
        for (const match of transformedMatches) {
          const { data: participants, error: participantsError } = await supabase
            .from('participants')
            .select('*')
            .eq('match_id', match.id);
          
          if (!participantsError && participants) {
            match.participants = participants;
          }
        }
        
        setMatches(transformedMatches);
        
        // Se l'utente è autenticato, recupera le partite a cui è iscritto
        if (isAuthenticated && user) {
          const userMatches = transformedMatches.filter(match => 
            match.participants.some(p => p.user_id === user.id)
          );
          setMyMatches(userMatches);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
        // Fallback to mock data if there's an error
        setMatches(mockMatches);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, [isAuthenticated, user]);
  const handleFilterChange = (option: FilterOption) => {
    setFilterOption(option);
  };
  // Filtra le partite in base all'opzione selezionata e rimuovi quelle a cui l'utente è già iscritto dalla tab "weekly"
  const filteredMatches = matches.filter(match => {
    // Se l'utente è autenticato, verifica se è già iscritto a questa partita
    const isUserParticipating = isAuthenticated && user && 
      match.participants.some(p => p.user_id === user.id);
    
    // Nella tab settimanale, escludiamo le partite a cui l'utente è già iscritto
    if (viewTab === "weekly" && isUserParticipating) {
      return false;
    }
    
    // Applica i filtri standard
    if (filterOption === 'available') {
      return match.currentParticipants < match.totalParticipants;
    } else if (filterOption === 'full') {
      return match.currentParticipants >= match.totalParticipants;
    }
    
    return true;
  });

  // Usa le partite a cui l'utente è effettivamente iscritto
  const currentMatches = viewTab === "weekly" ? filteredMatches : myMatches;
  const renderMatches = () => {
    if (loading) {
      return <div className="space-y-4 mt-6">
          {[1, 2, 3].map(i => <motion.div key={i} className="h-64 bg-gray-200 rounded-md" initial={{
          opacity: 0.6
        }} animate={{
          opacity: [0.6, 0.8, 0.6]
        }} transition={{
          duration: 1.5,
          repeat: Infinity
        }} />)}
        </div>;
    }
    if (currentMatches.length === 0) {
      return <motion.div className="text-center py-12" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }}>
          <p className="text-lg text-gray-500">
            {viewTab === "weekly" ? "Non ci sono partite che corrispondono ai criteri selezionati." : "Non stai partecipando a nessuna partita al momento."}
          </p>
        </motion.div>;
    }
    return <AnimatePresence mode="wait">
        {viewMode === "list" && <motion.div key="list-view" className="space-y-4 mt-6" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }}>
            {currentMatches.map((match, index) => <motion.div key={match.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1
        }}>
                <MatchCard match={match} />
              </motion.div>)}
          </motion.div>}

        {viewMode === "compact" && <motion.div key="compact-view" className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }}>
            {currentMatches.map((match, index) => <motion.div key={match.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.05
        }}>
                <MatchCard match={match} isCompact={true} />
              </motion.div>)}
          </motion.div>}
      </AnimatePresence>;
  };
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <motion.div className="space-y-6" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          {/* Title and description in their own section */}
          <div>
            <motion.h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.2
          }}>
              Partite della settimana
            </motion.h2>
            
            <motion.p className="text-muted-foreground" initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.3
          }}>
              Trova e partecipa alle partite nella tua zona.
            </motion.p>
          </div>
          
          {/* Tabs to switch between weekly matches and participating matches */}
          <Tabs value={viewTab} onValueChange={value => setViewTab(value as ViewTab)} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Partite settimanali</span>
              </TabsTrigger>
              <TabsTrigger value="participating" className="flex items-center gap-2" disabled={!isAuthenticated}>
                <UserCheck className="h-4 w-4" />
                <span>{isAuthenticated ? "Le mie partite" : "Accedi"}</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly">
              {/* Controls for weekly matches view */}
              <div className="flex items-center gap-2 justify-end">
                <motion.div className="flex bg-white p-1 rounded-lg shadow-sm border space-x-1" initial={{
                opacity: 0,
                x: 20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: 0.4
              }}>
                  <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="rounded-md">
                    <List className="h-4 w-4 mr-1" />
                    <span className="text-xs">Lista</span>
                  </Button>
                  <Button variant={viewMode === "compact" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("compact")} className="rounded-md">
                    <LayoutList className="h-4 w-4 mr-1" />
                    <span className="text-xs">Compatta</span>
                  </Button>
                </motion.div>
                
                <motion.div initial={{
                opacity: 0,
                x: 20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: 0.5
              }}>
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
                        <DropdownMenuItem onClick={() => handleFilterChange('all')} className="cursor-pointer">
                          <div className="flex items-center w-full">
                            {filterOption === 'all' && <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />}
                            {filterOption !== 'all' && <CircleDashed className="h-4 w-4 mr-2 text-muted-foreground" />}
                            <span>Tutte le partite</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterChange('available')} className="cursor-pointer">
                          <div className="flex items-center w-full">
                            {filterOption === 'available' && <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />}
                            {filterOption !== 'available' && <CircleDashed className="h-4 w-4 mr-2 text-muted-foreground" />}
                            <span>Partite con posti</span>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFilterChange('full')} className="cursor-pointer">
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
                <motion.div className="flex bg-white p-1 rounded-lg shadow-sm border space-x-1" initial={{
                opacity: 0,
                x: 20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: 0.4
              }}>
                  <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="rounded-md">
                    <List className="h-4 w-4 mr-1" />
                    <span className="text-xs">Lista</span>
                  </Button>
                  <Button variant={viewMode === "compact" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("compact")} className="rounded-md">
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
    </div>;
};
export default Index;