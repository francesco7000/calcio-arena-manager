
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, MapPin } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Il tuo profilo
        </h2>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-calcio-green flex items-center justify-center text-white text-3xl font-bold">
                  MC
                </div>
              </div>
              
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-xl font-semibold">Mario Calcetti</h3>
                <p className="text-gray-500">Attaccante</p>
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-calcio-green" />
                <span>mario.calcetti@example.com</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-calcio-green" />
                <span>+39 123 456 7890</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-calcio-green" />
                <span>Milano, Italia</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <h3 className="text-lg font-semibold mb-4">Le tue prossime partite</h3>
        
        <div className="text-center py-8 bg-white rounded-lg border">
          <p className="text-gray-500">
            Non sei iscritto a nessuna partita.
          </p>
          <Button 
            onClick={() => window.location.href = '/'} 
            className="mt-4"
          >
            Trova partite
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
