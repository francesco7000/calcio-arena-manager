
import { useNavigate } from "react-router-dom";
import { Menu, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
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
              </nav>
            </SheetContent>
          </Sheet>
          <h1 
            className="ml-2 text-xl font-bold tracking-tight cursor-pointer" 
            onClick={() => navigate('/')}
          >
            Calcio Arena
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/profile')}
          >
            <User className="h-5 w-5" />
            <span className="sr-only">Profilo</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
