
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogIn, Calendar, Plus } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/components/ui/use-toast";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    // Simulación de API call
    setTimeout(() => {
      setIsLoggingIn(false);
      if (username === "admin" && password === "admin") {
        setIsLoggedIn(true);
        toast({
          title: "Login effettuato",
          description: "Benvenuto nell'area amministrativa",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Errore di accesso",
          description: "Credenziali non valide. Prova con admin/admin",
        });
      }
    }, 1000);
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Header />
        
        <main className="flex-1 container py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Torna alla home
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Pannello Amministrativo
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Card className="border-none shadow-lg h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Gestione Partite
                    </CardTitle>
                    <CardDescription>
                      Visualizza e gestisci tutte le partite
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center pt-4">
                    <p className="text-gray-500 mb-4 text-center">
                      Accedi alla lista completa delle partite per modificare, eliminare o notificare i partecipanti.
                    </p>
                    <Button 
                      onClick={() => navigate('/')} 
                      className="w-full"
                    >
                      Gestisci partite
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Card className="border-none shadow-lg h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5 text-primary" />
                      Crea Nuova Partita
                    </CardTitle>
                    <CardDescription>
                      Aggiungi una nuova partita al calendario
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center pt-4">
                    <p className="text-gray-500 mb-4 text-center">
                      Crea una nuova partita specificando data, ora, luogo e altre informazioni.
                    </p>
                    <Button 
                      onClick={() => navigate('/create-match')} 
                      className="w-full"
                    >
                      Crea partita
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Indietro
          </Button>
        </motion.div>
        
        <div className="flex-1 flex items-center justify-center py-6">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="shadow-lg border-none">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Area Amministrativa
                </CardTitle>
                <CardDescription className="text-center">
                  Accedi per gestire le partite e gli utenti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        placeholder="admin" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="pt-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className="w-full"
                        type="submit"
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn ? (
                          <div className="flex items-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Login in corso...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <LogIn className="mr-2 h-4 w-4" />
                            Accedi
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-center w-full text-muted-foreground">
                  Per scopi dimostrativi, usa "admin" come username e password
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
