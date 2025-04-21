import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, UserPlus, Users, Pencil, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  username: string;
  admin: boolean;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin: userIsAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isNewUserAdmin, setIsNewUserAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stati per la modifica dell'utente
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Stati per l'eliminazione dell'utente
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Verifica se l'utente è admin
    if (!userIsAdmin) {
      toast({
        title: "Accesso negato",
        description: "Solo gli amministratori possono accedere a questa pagina.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    // Carica la lista degli utenti
    fetchUsers();
  }, [userIsAdmin, navigate, toast]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, admin');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Errore nel caricamento degli utenti:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare la lista degli utenti.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Verifica se l'username esiste già
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', newUsername)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingUser) {
        toast({
          title: "Username già in uso",
          description: "Scegli un altro username.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Crea il nuovo utente
      const { error } = await supabase
        .from('users')
        .insert([{
          username: newUsername,
          password: newPassword,
          admin: isNewUserAdmin
        }]);

      if (error) throw error;

      toast({
        title: "Utente creato",
        description: `L'utente ${newUsername} è stato creato con successo.`,
      });

      // Reset form e aggiorna la lista
      setNewUsername("");
      setNewPassword("");
      setIsNewUserAdmin(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Errore nella creazione dell\'utente:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione dell'utente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Funzione per aprire il dialog di modifica
  const openEditDialog = (user: User) => {
    // Impedisci la modifica dell'utente admin
    if (user.username === 'admin') {
      toast({
        title: "Operazione non consentita",
        description: "L'utente admin non può essere modificato.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingUser(user);
    setEditUsername(user.username);
    setEditPassword(""); // Password vuota per default
    setEditIsAdmin(user.admin);
    setEditDialogOpen(true);
  };
  
  // Funzione per salvare le modifiche all'utente
  const handleEditUser = async () => {
    if (!editingUser) return;
    
    // Ulteriore controllo di sicurezza per impedire la modifica dell'utente admin
    if (editingUser.username === 'admin') {
      toast({
        title: "Operazione non consentita",
        description: "L'utente admin non può essere modificato.",
        variant: "destructive"
      });
      setEditDialogOpen(false);
      return;
    }
    
    setIsEditing(true);
    
    try {
      // Verifica se il nuovo username è già in uso (solo se è cambiato)
      if (editUsername !== editingUser.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('username')
          .eq('username', editUsername)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingUser) {
          toast({
            title: "Username già in uso",
            description: "Scegli un altro username.",
            variant: "destructive"
          });
          setIsEditing(false);
          return;
        }
      }
      
      // Prepara i dati da aggiornare
      const updateData: any = {
        username: editUsername,
        admin: editIsAdmin
      };
      
      // Aggiungi la password solo se è stata inserita
      if (editPassword.trim() !== "") {
        updateData.password = editPassword;
      }
      
      // Aggiorna l'utente
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', editingUser.id);

      if (error) throw error;

      toast({
        title: "Utente aggiornato",
        description: `L'utente ${editUsername} è stato aggiornato con successo.`,
      });

      // Chiudi il dialog e aggiorna la lista
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Errore nell\'aggiornamento dell\'utente:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dell'utente.",
        variant: "destructive"
      });
    } finally {
      setIsEditing(false);
    }
  };
  
  // Funzione per aprire il dialog di eliminazione
  const openDeleteDialog = (user: User) => {
    // Impedisci l'eliminazione dell'utente admin
    if (user.username === 'admin') {
      toast({
        title: "Operazione non consentita",
        description: "L'utente admin non può essere eliminato.",
        variant: "destructive"
      });
      return;
    }
    
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  
  // Funzione per eliminare l'utente
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    // Ulteriore controllo di sicurezza per impedire l'eliminazione dell'utente admin
    if (userToDelete.username === 'admin') {
      toast({
        title: "Operazione non consentita",
        description: "L'utente admin non può essere eliminato.",
        variant: "destructive"
      });
      setDeleteDialogOpen(false);
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Elimina l'utente
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userToDelete.id);

      if (error) throw error;

      toast({
        title: "Utente eliminato",
        description: `L'utente ${userToDelete.username} è stato eliminato con successo.`,
      });

      // Chiudi il dialog e aggiorna la lista
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Errore nell\'eliminazione dell\'utente:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione dell'utente.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="mb-6 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Torna alla home
          </Button>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Form per creare un nuovo utente */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Crea nuovo utente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Inserisci username"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Inserisci password"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="admin" 
                      checked={isNewUserAdmin}
                      onCheckedChange={(checked) => setIsNewUserAdmin(checked as boolean)}
                    />
                    <Label htmlFor="admin" className="cursor-pointer">Amministratore</Label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creazione in corso..." : "Crea utente"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Lista degli utenti */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Utenti registrati
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-4 text-muted-foreground">Caricamento utenti...</p>
                ) : users.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">Nessun utente trovato.</p>
                ) : (
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div key={user.id} className="p-3 border rounded-md flex justify-between items-center">
                        <div>
                          <p className="font-medium">{user.username}</p>
                          {user.admin && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => openEditDialog(user)}
                            className="h-8 w-8"
                            disabled={user.username === 'admin'}
                            title={user.username === 'admin' ? 'Non è possibile modificare l\'utente admin' : 'Modifica utente'}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            onClick={() => openDeleteDialog(user)}
                            className="h-8 w-8"
                            disabled={user.username === 'admin'}
                            title={user.username === 'admin' ? 'Non è possibile eliminare l\'utente admin' : 'Elimina utente'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      {/* Dialog per la modifica dell'utente */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica utente</DialogTitle>
            <DialogDescription>
              Modifica i dati dell'utente. Lascia vuoto il campo password se non vuoi cambiarla.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Inserisci username"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password (lascia vuoto per non modificarla)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Nuova password"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edit-admin" 
                checked={editIsAdmin}
                onCheckedChange={(checked) => setEditIsAdmin(checked as boolean)}
              />
              <Label htmlFor="edit-admin" className="cursor-pointer">Amministratore</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Annulla</Button>
            <Button onClick={handleEditUser} disabled={isEditing}>
              {isEditing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Salvataggio...
                </>
              ) : "Salva modifiche"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog per la conferma dell'eliminazione */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione eliminerà permanentemente l'utente {userToDelete?.username} e non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Eliminazione...
                </div>
              ) : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;