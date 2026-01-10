import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Home, ArrowLeft, Download, Sparkles, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface DesignResult {
  id: string;
  room_type: string;
  style_mood: string;
  style_type: string;
  budget: string;
  original_image_url: string;
  generated_image_url: string | null;
  ai_suggestions: string | null;
  status: string;
  created_at: string;
}

const DesignResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [design, setDesign] = useState<DesignResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBefore, setShowBefore] = useState(false);

  useEffect(() => {
    fetchDesign();
    
    // Set up realtime subscription for status updates
    const channel = supabase
      .channel(`design-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'room_designs',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setDesign(payload.new as DesignResult);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchDesign = async () => {
    const { data, error } = await supabase
      .from('room_designs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching design:', error);
      navigate('/dashboard');
    } else {
      setDesign(data);
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!design?.generated_image_url) return;

    try {
      const response = await fetch(design.generated_image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roomyfy-design-${design.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download failed',
        description: 'Could not download the image.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <RefreshCw className="h-8 w-8 text-primary" />
        </div>
      </div>
    );
  }

  if (!design) {
    return null;
  }

  const isProcessing = design.status === 'processing' || design.status === 'pending';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl roomyfy-gradient flex items-center justify-center">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">ROOMYFY</span>
            </Link>
          </div>
          {design.generated_image_url && (
            <Button onClick={handleDownload} className="roomyfy-gradient">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Design Info */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 capitalize">{design.room_type.replace('-', ' ')} Design</h1>
            <p className="text-muted-foreground capitalize">
              {design.style_mood} • {design.style_type} • {design.budget} Budget
            </p>
          </div>

          {isProcessing ? (
            /* Processing State */
            <Card className="mb-8">
              <CardContent className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl roomyfy-gradient flex items-center justify-center"
                >
                  <Clock className="h-10 w-10 text-primary-foreground" />
                </motion.div>
                <h2 className="text-xl font-semibold mb-2">Design in Progress</h2>
                <p className="text-muted-foreground">
                  Our AI is working on your design. This may take a minute...
                </p>
              </CardContent>
            </Card>
          ) : (
            /* Before/After Comparison */
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card className="overflow-hidden roomyfy-card-shadow">
                <CardContent className="p-0">
                  <div className="p-4 bg-muted/50 flex items-center justify-between">
                    <h3 className="font-semibold">Before</h3>
                  </div>
                  <div className="aspect-[4/3]">
                    <img
                      src={design.original_image_url}
                      alt="Original room"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden roomyfy-card-shadow">
                <CardContent className="p-0">
                  <div className="p-4 bg-primary/10 flex items-center justify-between">
                    <h3 className="font-semibold text-primary">After</h3>
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="aspect-[4/3]">
                    {design.generated_image_url ? (
                      <img
                        src={design.generated_image_url}
                        alt="AI generated design"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <p className="text-muted-foreground">Image generation failed</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI Suggestions */}
          {design.ai_suggestions && (
            <Card className="roomyfy-card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">AI Design Suggestions</h2>
                </div>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                  {design.ai_suggestions}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DesignResult;
