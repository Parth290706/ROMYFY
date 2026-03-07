import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Home, Plus, Sparkles, Clock, Trash2, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

interface DesignWithSignedUrls extends RoomDesign {
  originalSignedUrl?: string;
  generatedSignedUrl?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [designs, setDesigns] = useState<DesignWithSignedUrls[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDesigns();
    } else {
      setDesigns([]);
      setLoading(false);
    }
  }, [user]);

  const fetchDesigns = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('room_designs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setLoading(false);
      return;
    }
    
    const designsWithUrls = await Promise.all(
      (data || []).map(async (design) => {
        const result: DesignWithSignedUrls = { ...design };
        
        if (design.original_image_url && !design.original_image_url.startsWith('http')) {
          const { data: signedData } = await supabase.storage
            .from('room-images')
            .createSignedUrl(design.original_image_url, 3600);
          result.originalSignedUrl = signedData?.signedUrl;
        } else {
          result.originalSignedUrl = design.original_image_url;
        }
        
        if (design.generated_image_url && !design.generated_image_url.startsWith('http')) {
          const { data: signedData } = await supabase.storage
            .from('room-images')
            .createSignedUrl(design.generated_image_url, 3600);
          result.generatedSignedUrl = signedData?.signedUrl;
        } else {
          result.generatedSignedUrl = design.generated_image_url || undefined;
        }
        
        return result;
      })
    );
    
    setDesigns(designsWithUrls);
    setLoading(false);
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl roomyfy-gradient flex items-center justify-center">
              <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">ROOMYFY</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/design/new">
              <Button size="sm" className="roomyfy-gradient text-primary-foreground">
                <Plus className="mr-1 h-4 w-4" /> New Design
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-1 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Welcome, {user?.user_metadata?.full_name || 'Designer'}!</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Ready to design your next dream space?</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 sm:mb-12"
        >
          <Link to="/design/new">
            <Card className="roomyfy-gradient border-0 cursor-pointer hover:opacity-95 transition-opacity">
              <CardContent className="p-4 sm:p-8 flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                    <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-primary-foreground">New Design</h2>
                    <p className="text-sm sm:text-base text-primary-foreground/80">Start designing a new room</p>
                  </div>
                </div>
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Recent Designs</h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted rounded-t-lg" />
                  <CardContent className="p-3 sm:p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : designs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">No designs yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {designs.map((design, index) => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden roomyfy-card-shadow hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => navigate(`/design/${design.id}`)}>
                    <div className="aspect-[4/3] bg-muted relative">
                      {design.generatedSignedUrl ? (
                        <img src={design.generatedSignedUrl} alt="Generated design" className="w-full h-full object-cover" />
                      ) : design.originalSignedUrl ? (
                        <img src={design.originalSignedUrl} alt="Original room" className="w-full h-full object-cover" />
                      ) : null}
                      {design.status === 'pending' && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <div className="text-center">
                            <Clock className="h-8 w-8 mx-auto mb-2 text-primary animate-pulse" />
                            <p className="text-sm font-medium">Processing...</p>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteDesign(design.id); }}
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
