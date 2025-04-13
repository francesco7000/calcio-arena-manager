import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Euro } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

const CreateMatch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [field, setField] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const newMatch = {
        field: field,
        location: location,
        address: address,
        date: date,
        time: time,
        price: Number(price),
        max_participants: Number(maxParticipants), // Fixed property name
        organizer: organizer
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
      
      <main className="flex-1 container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 group">
            Indietro
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="overflow-hidden border-none shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold tracking-tight mb-4">Crea una nuova partita</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="field">Campo</Label>
                    <Input
                      type="text"
                      id="field"
                      value={field}
                      onChange={(e) => setField(e.target.value)}
                      placeholder="Nome del campo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Luogo</Label>
                    <Input
                      type="text"
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Città"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Indirizzo</Label>
                  <Input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Via e numero civico"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date" className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Data
                    </Label>
                    <Input
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time" className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Orario
                    </Label>
                    <Input
                      type="time"
                      id="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price" className="flex items-center">
                      <Euro className="mr-2 h-4 w-4" />
                      Quota
                    </Label>
                    <Input
                      type="number"
                      id="price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Costo di partecipazione"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxParticipants">Numero massimo di partecipanti</Label>
                    <Input
                      type="number"
                      id="maxParticipants"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                      placeholder="Numero massimo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="organizer">Organizzatore</Label>
                    <Input
                      type="text"
                      id="organizer"
                      value={organizer}
                      onChange={(e) => setOrganizer(e.target.value)}
                      placeholder="Nome dell'organizzatore"
                      required
                    />
                  </div>
                </div>
                
                <Button disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Creazione in corso..." : "Crea partita"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateMatch;
