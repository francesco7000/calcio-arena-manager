import { useState } from "react";
import { Calendar, Clock, MapPin, Euro, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditMatchDialogProps {
  match: Match;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMatchUpdated: () => void;
}

const EditMatchDialog = ({ match, open, onOpenChange, onMatchUpdated }: EditMatchDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [field, setField] = useState(match.field);
  const [address, setAddress] = useState(match.address);
  const [date, setDate] = useState(match.date);
  const [time, setTime] = useState(match.time);
  const [price, setPrice] = useState(match.price.toString());
  const [maxParticipants, setMaxParticipants] = useState(match.totalParticipants.toString());
  const [organizer, setOrganizer] = useState(match.organizer || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validazione
      if (!field || !address || !date || !time || !price || !maxParticipants) {
        throw new Error("Tutti i campi sono obbligatori");
      }

      // Verifica che il numero massimo di partecipanti non sia inferiore al numero attuale
      if (parseInt(maxParticipants) < match.currentParticipants) {
        throw new Error(`Il numero massimo di partecipanti non può essere inferiore al numero attuale (${match.currentParticipants})`);
      }
      
      // Aggiorna la partita nel database
      const { error } = await supabase
        .from('matches')
        .update({
          field: field,
          address: address,
          date: date,
          time: time,
          price: parseFloat(price),
          max_participants: parseInt(maxParticipants),
          organizer: organizer || match.organizer
        })
        .eq('id', match.id);
      
      if (error) throw error;
      
      toast({
        title: "Partita aggiornata",
        description: "Le informazioni della partita sono state aggiornate con successo.",
      });
      
      // Chiudi il dialog e aggiorna i dati
      onOpenChange(false);
      onMatchUpdated();
    } catch (error: any) {
      console.error("Error updating match:", error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento della partita.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifica partita</DialogTitle>
          <DialogDescription>
            Modifica i dettagli della partita. Tutti i campi sono obbligatori.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="field" className="text-base mb-1.5 block">Nome campo</Label>
            <Input
              id="field"
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="Nome del campo"
              required
              className="h-10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address" className="text-base mb-1.5 block">Indirizzo</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Via e numero civico"
              required
              className="h-10"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center text-base mb-1.5">
                <Calendar className="mr-2 h-5 w-5" />
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center text-base mb-1.5">
                <Clock className="mr-2 h-5 w-5" />
                Orario
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="h-10"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center text-base mb-1.5">
                <Euro className="mr-2 h-5 w-5" />
                Quota
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Costo di partecipazione"
                required
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxParticipants" className="flex items-center text-base mb-1.5">
                <Users className="mr-2 h-5 w-5" />
                Numero massimo di partecipanti
              </Label>
              <Input
                id="maxParticipants"
                type="number"
                min={match.currentParticipants.toString()}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                required
                className="h-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="organizer" className="text-base mb-1.5 block">Organizzatore</Label>
            <Input disabled
              id="organizer"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="Nome dell'organizzatore"
              className="h-10"
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvataggio..." : "Salva modifiche"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMatchDialog;