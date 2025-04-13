import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  
  // Stati per il form di login
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  


  // Gestione del login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      const { error } = await signIn(loginUsername, loginPassword);
      
      if (error) {
        toast({
          title: "Errore di accesso",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Accesso effettuato",
          description: "Benvenuto nell'app Calcio Arena!",
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'accesso.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };



  return (
    <div className="container max-w-md mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla home
        </Button>
        

            <Card>
              <CardHeader>
                <CardTitle>Accedi</CardTitle>
                <CardDescription>
                  Inserisci le tue credenziali per accedere all'app Calcio Arena.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Inserisci il tuo username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isLoggingIn}>
                      {isLoggingIn ? (
                        <>Accesso in corso...</>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-4 w-4" />
                          Accedi
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
      </motion.div>
    </div>
  );
};

export default Login;