
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, MapPin, Users, Euro } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  date: z.string().min(1, { message: "La data è richiesta" }),
  time: z.string().min(1, { message: "L'ora è richiesta" }),
  location: z.string().min(1, { message: "Il luogo è richiesto" }),
  address: z.string().min(1, { message: "L'indirizzo è richiesto" }),
  field: z.string().min(1, { message: "Il campo è richiesto" }),
  totalParticipants: z.string().min(1, { message: "Il numero di partecipanti è richiesto" }),
  price: z.string().min(1, { message: "Il prezzo è richiesto" }),
});

type FormValues = z.infer<typeof formSchema>;

const CreateMatch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      time: "",
      location: "",
      address: "",
      field: "",
      totalParticipants: "",
      price: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convertire i dati nel formato corretto per il database
      const matchData = {
        date: data.date,
        time: data.time,
        location: data.location,
        address: data.address,
        field: data.field,
        total_participants: parseInt(data.totalParticipants),
        price: parseFloat(data.price),
        current_participants: 0,
      };
      
      // Salvare i dati in Supabase
      const { data: insertedMatch, error } = await supabase
        .from('matches')
        .insert(matchData)
        .select()
        .single();
      
      if (error) {
        console.error("Errore durante l'inserimento:", error);
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Si è verificato un errore durante la creazione della partita",
        });
        setIsSubmitting(false);
        return;
      }
      
      toast({
        title: "Partita creata",
        description: "La partita è stata creata con successo",
      });
      
      // Reindirizzare alla pagina della partita appena creata
      navigate(`/match/${insertedMatch.id}`);
      
    } catch (error) {
      console.error("Errore:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un errore durante la creazione della partita",
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4 group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Torna al pannello admin
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Crea Nuova Partita
          </h2>
          
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Informazioni Partita</CardTitle>
              <CardDescription>
                Inserisci tutti i dettagli per la nuova partita
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <Input type="date" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ora</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Input type="time" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Luogo</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Centro Sportivo San Siro" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Indirizzo</FormLabel>
                          <FormControl>
                            <Input placeholder="Via del Campo, 10, Milano" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="field"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campo</FormLabel>
                          <FormControl>
                            <Input placeholder="Campo A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="totalParticipants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numero partecipanti</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <Input type="number" min="2" placeholder="10" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Inserisci il numero totale di giocatori per questa partita
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prezzo</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Euro className="h-4 w-4 text-muted-foreground" />
                              <Input type="number" min="0" step="0.01" placeholder="10.00" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Creazione in corso...
                        </div>
                      ) : "Crea Partita"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateMatch;
