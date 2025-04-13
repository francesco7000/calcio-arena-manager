import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import { format } from "date-fns";
import { enUS, it } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MatchCard from "@/components/MatchCard";
import Header from "@/components/Header";
import { Match, ViewMode } from "@/types";
import { DateRange } from "react-day-picker";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*');

      if (error) {
        console.error("Error fetching matches:", error);
        return;
      }

      // Fetch participants for each match
      const matchesWithParticipants = await Promise.all(
        data.map(async (matchData) => {
          const { data: participants, error: participantsError } = await supabase
            .from('participants')
            .select('*')
            .eq('match_id', matchData.id);

          if (participantsError) {
            console.error(`Error fetching participants for match ${matchData.id}:`, participantsError);
            return { ...matchData, participants: [] }; // Return match with empty participants array in case of error
          }

          const fullMatch: Match = {
            ...matchData,
            totalParticipants: matchData.max_participants,
            currentParticipants: matchData.current_participants,
            participants: participants || [],
          };

          return fullMatch;
        })
      );

      setMatches(matchesWithParticipants as Match[]);
    } catch (error) {
      console.error("Unexpected error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = () => {
    navigate("/create-match");
  };

  const sortedMatches = [...matches].sort((a, b) => {
    const aValue = typeof a[sortBy as keyof Match] === 'string' ? (a[sortBy as keyof Match] as string).toLowerCase() : a[sortBy as keyof Match];
    const bValue = typeof b[sortBy as keyof Match] === 'string' ? (b[sortBy as keyof Match] as string).toLowerCase() : b[sortBy as keyof Match];

    if (aValue < bValue) {
      return sortOrder === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === "asc" ? 1 : -1;
    }
    return 0;
  });

  const filteredMatches = sortedMatches.filter(match => {
    const matchDate = new Date(match.date);
    const isWithinRange = (!date?.from || matchDate >= date.from) && (!date?.to || matchDate <= date.to);
    const matchesSearchQuery =
      match.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.address.toLowerCase().includes(searchQuery.toLowerCase());

    return isWithinRange && matchesSearchQuery;
  });

  const availableMatches = filteredMatches.filter(match => {
    const currentParticipants = match.currentParticipants !== undefined 
      ? match.currentParticipants 
      : match.current_participants || 0;
      
    const totalParticipants = match.totalParticipants !== undefined 
      ? match.totalParticipants 
      : match.max_participants || 0;
      
    return currentParticipants < totalParticipants;
  });

  const fullMatches = filteredMatches.filter(match => {
    const currentParticipants = match.currentParticipants !== undefined 
      ? match.currentParticipants 
      : match.current_participants || 0;
      
    const totalParticipants = match.totalParticipants !== undefined 
      ? match.totalParticipants 
      : match.max_participants || 0;
      
    return currentParticipants >= totalParticipants;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 flex flex-col md:flex-row items-center justify-between gap-3"
        >
          <div className="flex flex-col md:flex-row items-center gap-3">
            <Input
              type="text"
              placeholder="Cerca per campo, luogo o indirizzo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      `${format(date.from, "dd/MM/yyyy", { locale: it })} - ${format(date.to, "dd/MM/yyyy", { locale: it })}`
                    ) : (
                      format(date.from, "dd/MM/yyyy", { locale: it })
                    )
                  ) : (
                    <span>Seleziona una data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center" side="bottom">
                <Calendar
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  locale={it}
                  fromYear={2024}
                  toYear={2025}
                  className="border-0 rounded-md overflow-hidden"
                  classNames={{
                    head_cell: "text-muted-foreground",
                    day: "rounded-md",
                    day_selected:
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordina per..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="time">Ora</SelectItem>
                <SelectItem value="location">Luogo</SelectItem>
                <SelectItem value="price">Prezzo</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? (
                <>
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  Ascendente
                </>
              ) : (
                <>
                  <ArrowUpToLine className="mr-2 h-4 w-4" />
                  Discendente
                </>
              )}
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-4 flex items-center justify-between"
        >
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Partite Disponibili
          </h2>
          {isAuthenticated && isAdmin && (
            <Button onClick={handleCreateMatch}>Crea Partita</Button>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center">
            <motion.div
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, ease: "linear", repeat: Infinity }}
            />
          </div>
        ) : (
          <>
            {availableMatches.length > 0 ? (
              <motion.div
                layout
                className={`grid ${viewMode === 'list' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-4`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delayChildren: 0.2, staggerChildren: 0.1 }}
              >
                {availableMatches.map((match) => (
                  <MatchCard key={match.id} match={match} isCompact={viewMode === 'compact'} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <p className="text-lg text-gray-500">Nessuna partita disponibile al momento.</p>
              </motion.div>
            )}

            {fullMatches.length > 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="mt-8 mb-4 flex items-center justify-between"
                >
                  <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Partite Complete
                  </h2>
                </motion.div>

                <motion.div
                  layout
                  className={`grid ${viewMode === 'list' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-4`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delayChildren: 0.2, staggerChildren: 0.1 }}
                >
                  {fullMatches.map((match) => (
                    <MatchCard key={match.id} match={match} isCompact={viewMode === 'compact'} />
                  ))}
                </motion.div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
