
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Edit, Calendar } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Il tuo profilo
          </h2>
          
          <Card className="mb-6 border-none shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <div className="h-32 bg-gradient-to-r from-primary/90 to-secondary/90" />
                
                <div className="px-6 pb-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6 -mt-16">
                    <motion.div 
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-calcio-blue to-primary flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white">
                        MC
                      </div>
                      <button className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md text-primary hover:bg-gray-100 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                    </motion.div>
                    
                    <div className="space-y-2 text-center sm:text-left mt-4 sm:mt-16">
                      <h3 className="text-2xl font-semibold">Mario Calcetti</h3>
                      <p className="text-gray-500">Attaccante</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div 
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm"
                      whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    >
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">mario.calcetti@example.com</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm"
                      whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    >
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Telefono</p>
                        <p className="font-medium">+39 123 456 7890</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm sm:col-span-2"
                      whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    >
                      <div className="bg-primary/10 p-2 rounded-full">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Indirizzo</p>
                        <p className="font-medium">Milano, Italia</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Le tue prossime partite
            </h3>
            
            <Card className="shadow border-none overflow-hidden">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <p className="text-gray-500 mb-4">
                  Non sei iscritto a nessuna partita.
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={() => window.location.href = '/'} 
                  >
                    Trova partite
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
