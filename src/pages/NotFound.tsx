
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-6xl font-bold text-calcio-green">404</h1>
        <p className="text-xl text-gray-600 mb-4">Questa pagina non esiste</p>
        <Button onClick={() => navigate("/")} className="font-medium">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
