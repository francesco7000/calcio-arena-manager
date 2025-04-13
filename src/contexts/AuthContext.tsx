import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface CustomUser {
  id: string;
  username: string;
  admin: boolean;
}

type AuthContextType = {
  session: Session | null;
  user: CustomUser | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Imposta lo stato iniziale dell'autenticazione
    const setupAuth = async () => {
      setIsLoading(true);
      
      // Controlla se c'è un utente memorizzato nel localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as CustomUser;
          setUser(parsedUser);
          setIsAuthenticated(true);
          setIsAdmin(parsedUser.admin);
        } catch (error) {
          console.error('Errore nel parsing dell\'utente:', error);
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
    };
    
    setupAuth();
  }, []);

  // Funzione per il login con username e password
  const signIn = async (username: string, password: string) => {
    try {
      // Cerca l'utente nella tabella users
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();
      
      if (error) {
        return { error: { message: 'Credenziali non valide' } };
      }
      
      if (data) {
        const customUser: CustomUser = {
          id: data.id,
          username: data.username,
          admin: data.admin
        };
        
        // Salva l'utente nel localStorage
        localStorage.setItem('user', JSON.stringify(customUser));
        
        // Aggiorna lo stato
        setUser(customUser);
        setIsAuthenticated(true);
        setIsAdmin(data.admin);
        
        return { error: null };
      } else {
        return { error: { message: 'Credenziali non valide' } };
      }
    } catch (error) {
      console.error('Errore durante il login:', error);
      return { error: { message: 'Si è verificato un errore durante il login' } };
    }
  };



  // Funzione per il logout
  const signOut = async () => {
    // Pulisci completamente il localStorage
    localStorage.clear();
    
    // Aggiorna lo stato
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    
    // Forza il refresh della pagina per pulire completamente lo stato
    window.location.reload();
  };

  const value = {
    session,
    user,
    isLoading,
    signIn,

    signOut,
    isAuthenticated,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizzato per utilizzare il contesto di autenticazione
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
}