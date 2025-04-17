
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { PushNotificationService } from "@/services/PushNotificationService";
import Index from "./pages/Index";
import MatchDetails from "./pages/MatchDetails";
import Profile from "./pages/Profile";
import CreateMatch from "./pages/CreateMatch";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import FormationEditor from "./pages/FormationEditor";
import "./App.css";
import { useEffect } from "react";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Registrar el service worker para PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
    
    // Prevenir el comportamiento del zoom en doble toque para iOS
    document.addEventListener('gesturestart', function (e) {
      e.preventDefault();
    });
    
    // Inizializza il servizio di notifiche push
    const initPushNotifications = async () => {
      try {
        // Verifica se siamo in Safari e se l'app è in modalità PWA
        const isSafari = PushNotificationService.isSafari();
        const isIOS = PushNotificationService.isIOS();
        const isPWA = PushNotificationService.isPWA();
        
        console.log('Ambiente app:', { isSafari, isIOS, isPWA });
        
        // Ottieni l'utente dal localStorage
        const storedUser = localStorage.getItem('user');
        let userId = null;
        let userObject = null;
        
        if (storedUser) {
          try {
            userObject = JSON.parse(storedUser);
            userId = userObject.id;
            console.log('Utente recuperato per notifiche:', userId);
          } catch (error) {
            console.error('Errore nel parsing dell\'utente dal localStorage:', error);
          }
        }
        
        // Richiedi esplicitamente il permesso per le notifiche all'avvio dell'app
        // Questo è particolarmente importante per Safari che potrebbe non mostrare il popup automaticamente
        if ((isSafari || isIOS) && Notification.permission !== 'granted') {
          console.log('Richiedo permesso notifiche all\'avvio dell\'app');
          // Aggiungiamo un piccolo ritardo per assicurarci che l'app sia completamente caricata
          setTimeout(async () => {
            try {
              const hasPermission = await PushNotificationService.requestNotificationPermission(userId, userObject);
              console.log('Permesso notifiche ottenuto all\'avvio:', hasPermission);
            } catch (permError) {
              console.error('Errore durante la richiesta permesso notifiche:', permError);
            }
          }, 1000);
        }
        
        // Inizializza il servizio di notifiche push
        await PushNotificationService.initialize(userId, userObject);
      } catch (error) {
        console.error('Errore durante l\'inizializzazione delle notifiche push:', error);
      }
    };
    
    initPushNotifications();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/match/:id" element={<MatchDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-match" element={<CreateMatch />} />
                <Route path="/login" element={<Login />} />
                <Route path="/formation/:id" element={<FormationEditor />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
            <Toaster />
            <Sonner />
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
