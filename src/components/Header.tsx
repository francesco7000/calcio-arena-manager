
import { useNavigate } from "react-router-dom";
import { Menu, User, Calendar, LogIn, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut } = useAuth();

  return (
    <motion.header 
      className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container flex h-14 items-center justify-between">
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.02 }}
        >
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Apri menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 sm:max-w-sm">
              <nav className="grid gap-6 pt-6">
                <Button 
                  variant="ghost" 
                  className="flex items-center justify-start gap-2" 
                  onClick={() => navigate('/')}
                >
                  <Calendar className="h-5 w-5" />
                  Partite
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex items-center justify-start gap-2" 
                  onClick={() => navigate('/profile')}
                >
                  <User className="h-5 w-5" />
                  Profilo
                </Button>
                {!isAuthenticated ? (
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-start gap-2" 
                    onClick={() => navigate('/login')}
                  >
                    <LogIn className="h-5 w-5" />
                    Accedi
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-start gap-2" 
                    onClick={() => signOut().then(() => navigate('/'))}
                  >
                    <LogOut className="h-5 w-5" />
                    Esci
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <motion.h1 
            className="ml-2 text-xl font-bold tracking-tight cursor-pointer bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" 
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Calcio Arena
          </motion.h1>
        </motion.div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-2 hidden sm:inline-block">
              {isAuthenticated ? user?.username : 'Guest'}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-5 w-5" />
                  <ChevronDown className="h-3 w-3 absolute bottom-1 right-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 animate-in slide-in-from-top-2">
                <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profilo</span>
                </DropdownMenuItem>
                {!isAuthenticated ? (
                  <DropdownMenuItem onClick={() => navigate('/login')}>
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Accedi</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => signOut().then(() => navigate('/'))}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Esci</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
