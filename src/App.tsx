
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
        await PushNotificationService.initialize();
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
