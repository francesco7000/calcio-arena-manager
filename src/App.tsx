
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import NotificationDialog from "./components/NotificationDialog";
import { PushNotificationService } from "@/services/PushNotificationService";
import Index from "./pages/Index";
import MatchDetails from "./pages/MatchDetails";
import Profile from "./pages/Profile";
import CreateMatch from "./pages/CreateMatch";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import FormationEditor from "./pages/FormationEditor";
import "./App.css";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

function App() {
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [notificationUser, setNotificationUser] = useState<{userId?: string, userObject?: any}>({});

  useEffect(() => {
    // Registrar el service worker para PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
        }, function(err) {
          console.error('ServiceWorker registration failed: ', err);
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
        
        
        // Ottieni l'utente dal localStorage
        const storedUser = localStorage.getItem('user');
        let userId = null;
        let userObject = null;
        
        if (storedUser) {
          try {
            userObject = JSON.parse(storedUser);
            userId = userObject.id;
          } catch (error) {
            console.error('Errore nel parsing dell\'utente dal localStorage:', error);
          }
        }
        
        // Inizializza il servizio di notifiche push senza richiedere permessi
        // (i permessi verranno richiesti tramite il dialog dedicato)
        await PushNotificationService.initialize(userId, userObject);
      } catch (error) {
        console.error('Errore durante l\'inizializzazione delle notifiche push:', error);
      }
    };
    
    initPushNotifications();

    // Listener per l'evento di login che mostra il dialog delle notifiche
    const handleShowNotificationDialog = (event: CustomEvent) => {
      const { userId, userObject } = event.detail;
      setNotificationUser({ userId, userObject });
      setShowNotificationDialog(true);
    };

    // Registra il listener per l'evento personalizzato
    window.addEventListener('showNotificationDialog', handleShowNotificationDialog as EventListener);

    // Cleanup del listener quando il componente viene smontato
    return () => {
      window.removeEventListener('showNotificationDialog', handleShowNotificationDialog as EventListener);
    };
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
          {showNotificationDialog && (
            <NotificationDialog 
              userId={notificationUser.userId} 
              userObject={notificationUser.userObject} 
              onClose={() => setShowNotificationDialog(false)}
            />
          )}
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
