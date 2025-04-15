import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Euro, ArrowLeft, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";


const CreateMatch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, isAuthenticated } = useAuth();
  const [field, setField] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Reindirizza alla pagina di login se l'utente non è autenticato
    if (!isAuthenticated) {
      toast({
        title: "Accesso richiesto",
        description: "Devi accedere per creare una partita.",
        variant: "default"
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per creare una partita.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const newMatch = {
        field: field,
        location: location,
        address: address,
        date: date,
        time: time,
        price: Number(price),
        max_participants: Number(maxParticipants), 
        organizer: user.username
      };
      
      const { data, error } = await supabase
        .from('matches')
        .insert([newMatch])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Partita creata!",
        description: "La partita è stata creata con successo.",
      });
      navigate('/');
    } catch (error) {
      console.error("Error creating match:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione della partita.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 container py-4 px-4 sm:py-6 sm:px-6">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            className="flex items-center gap-1 p-2 -ml-2" 
            onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
            <span>Indietro</span>
          </Button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="overflow-hidden border-none shadow-lg mb-6">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4 text-center sm:text-left">Crea una nuova partita</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="field" className="text-base mb-1.5 block">Campo</Label>
                    <Input
                      type="text"
                      id="field"
                      value={field}
                      onChange={(e) => setField(e.target.value)}
                      placeholder="Nome del campo"
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-base mb-1.5 block">Luogo</Label>
                    <Input
                      type="text"
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Città"
                      required
                      className="h-12 text-base"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address" className="text-base mb-1.5 block">Indirizzo</Label>
                  <Input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Via e numero civico"
                    required
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="date" className="flex items-center text-base mb-1.5">
                      <Calendar className="mr-2 h-5 w-5" />
                      Data
                    </Label>
                    <Input
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time" className="flex items-center text-base mb-1.5">
                      <Clock className="mr-2 h-5 w-5" />
                      Orario
                    </Label>
                    <Input
                      type="time"
                      id="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="price" className="flex items-center text-base mb-1.5">
                      <Euro className="mr-2 h-5 w-5" />
                      Quota
                    </Label>
                    <Input
                      type="number"
                      id="price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Costo di partecipazione"
                      required
                      className="h-12 text-base"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="maxParticipants" className="text-base mb-1.5 block">Numero massimo di partecipanti</Label>
                    <Input
                      type="number"
                      id="maxParticipants"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                      placeholder="Numero massimo"
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="organizer" className="flex items-center text-base mb-1.5">
                      <User className="mr-2 h-5 w-5" />
                      Organizzatore
                    </Label>
                    <div className="h-12 px-3 flex items-center border rounded-md bg-muted/50 text-base">
                      {user?.username || 'Utente non autenticato'}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    disabled={isSubmitting} 
                    className="w-full h-14 text-base font-medium rounded-lg">
                    {isSubmitting ? "Creazione in corso..." : "Crea partita"}
                  </Button>
                </div>
                <div className="text-center">
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="mt-2 text-sm" 
                    onClick={() => navigate('/')}>
                    Annulla
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateMatch;
