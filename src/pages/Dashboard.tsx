import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Home, Plus, LogOut, Sparkles, Clock, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface RoomDesign {
  id: string;
  room_type: string;
  style_mood: string;
  style_type: string;
  original_image_url: string;
  generated_image_url: string | null;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [designs, setDesigns] = useState<RoomDesign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    const { data, error } = await supabase
      .from('room_designs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching designs:', error);
    } else {
      setDesigns(data || []);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteDesign = async (id: string) => {
    const { error } = await supabase
      .from('room_designs')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete design.',
      });
    } else {
      toast({
        title: 'Deleted',
        description: 'Design removed successfully.',
      });
      fetchDesigns();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl roomyfy-gradient flex items-center justify-center">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ROOMYFY</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-muted-foreground">Ready to design your next dream space?</p>
        </motion.div>

        {/* New Design CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Link to="/design/new">
            <Card className="roomyfy-gradient border-0 cursor-pointer hover:opacity-95 transition-opacity">
              <CardContent className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                    <Plus className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-primary-foreground">New Design</h2>
                    <p className="text-primary-foreground/80">Start designing a new room</p>
                  </div>
                </div>
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Previous Designs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Your Designs</h2>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted rounded-t-lg" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : designs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first room design to get started
                </p>
                <Link to="/design/new">
                  <Button className="roomyfy-gradient">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Design
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design, index) => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden roomyfy-card-shadow hover:shadow-lg transition-shadow group">
                    <div className="aspect-[4/3] bg-muted relative">
                      {design.generated_image_url ? (
                        <img
                          src={design.generated_image_url}
                          alt="Generated design"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={design.original_image_url}
                          alt="Original room"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {design.status === 'pending' && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <div className="text-center">
                            <Clock className="h-8 w-8 mx-auto mb-2 text-primary animate-pulse" />
                            <p className="text-sm font-medium">Processing...</p>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteDesign(design.id)}
                        className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold capitalize">{design.room_type}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {design.style_mood} • {design.style_type}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
