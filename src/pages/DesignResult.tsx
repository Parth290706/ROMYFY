import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Home, ArrowLeft, Download, Sparkles, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import ShareDesignButton from '@/components/ShareDesignButton';

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

interface SignedUrls {
  originalSignedUrl?: string;
  generatedSignedUrl?: string;
}

const DesignResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [design, setDesign] = useState<DesignResult | null>(null);
  const [signedUrls, setSignedUrls] = useState<SignedUrls>({});
  const [loading, setLoading] = useState(true);
  const [showBefore, setShowBefore] = useState(false);
  const [retrying, setRetrying] = useState(false);

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
        async (payload) => {
          const updatedDesign = payload.new as DesignResult;
          setDesign(updatedDesign);
          // Refresh signed URLs when design is updated
          await generateSignedUrls(updatedDesign);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const generateSignedUrls = async (designData: DesignResult) => {
    const urls: SignedUrls = {};

    // Get signed URL for original image
    if (designData.original_image_url && !designData.original_image_url.startsWith('http')) {
      const { data } = await supabase.storage
        .from('room-images')
        .createSignedUrl(designData.original_image_url, 3600);
      urls.originalSignedUrl = data?.signedUrl;
    } else {
      urls.originalSignedUrl = designData.original_image_url;
    }

    // Get signed URL for generated image
    if (designData.generated_image_url && !designData.generated_image_url.startsWith('http')) {
      const { data } = await supabase.storage
        .from('room-images')
        .createSignedUrl(designData.generated_image_url, 3600);
      urls.generatedSignedUrl = data?.signedUrl;
    } else {
      urls.generatedSignedUrl = designData.generated_image_url || undefined;
    }

    setSignedUrls(urls);
  };

  const fetchDesign = async () => {
    const { data, error } = await supabase
      .from('room_designs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Silent fail - redirect to dashboard without logging sensitive info
      navigate('/dashboard');
    } else {
      setDesign(data);
      await generateSignedUrls(data);
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    if (!signedUrls.generatedSignedUrl) return;

    try {
      const response = await fetch(signedUrls.generatedSignedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roomyfy-design-${design?.id}.jpg`;
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

  const handleRetryGeneration = async () => {
    if (!design || retrying) return;

    try {
      setRetrying(true);

      const { data: fnData, error: fnErr } = await supabase.functions.invoke('generate-design', {
        body: {
          designId: design.id,
          roomType: design.room_type,
          styleMood: design.style_mood,
          styleType: design.style_type,
          budget: design.budget,
        },
      });

      if (fnErr) throw fnErr;

      if (fnData?.success === false) {
        toast({
          variant: 'destructive',
          title: fnData?.error_code === 'AI_CREDITS_REQUIRED' ? 'AI credits required' : 'Retry failed',
          description: fnData?.error || 'Please try again in a moment.',
        });
        return;
      }

      toast({
        title: 'Retry started',
        description: 'Generating a new image now…',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Retry failed',
        description: 'Please try again in a moment.',
      });
    } finally {
      setRetrying(false);
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
  const isFailed = design.status === 'failed';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl roomyfy-gradient flex items-center justify-center">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground hidden sm:inline">ROOMYFY</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ShareDesignButton designId={design.id} roomType={design.room_type} />
            {signedUrls.generatedSignedUrl && (
              <Button onClick={handleDownload} className="roomyfy-gradient text-sm sm:text-base px-3 sm:px-4">
                <Download className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Design Info */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 capitalize">{design.room_type.replace('-', ' ')} Design</h1>
            <p className="text-sm sm:text-base text-muted-foreground capitalize">
              {design.style_mood} • {design.style_type} • {design.budget} Budget
            </p>
          </div>

          {isProcessing ? (
            /* Processing State */
            <Card className="mb-6 sm:mb-8">
              <CardContent className="p-8 sm:p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl roomyfy-gradient flex items-center justify-center"
                >
                  <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
                </motion.div>
                <h2 className="text-lg sm:text-xl font-semibold mb-2">Design in Progress</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Our AI is working on your design. This may take a minute...
                </p>

                <div className="mt-4 sm:mt-6 flex flex-col items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRetryGeneration}
                    disabled={retrying}
                    className="w-full max-w-xs"
                  >
                    <RefreshCw className={"mr-2 h-4 w-4" + (retrying ? " animate-spin" : "")} />
                    {retrying ? 'Retrying…' : 'Retry generation'}
                  </Button>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    If it looks stuck, retrying will re-run generation.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : isFailed ? (
            /* Failed State with prominent retry */
            <div className="space-y-6 mb-6 sm:mb-8">
              <Card className="border-destructive/30">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-destructive" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-2">Image Generation Failed</h2>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6">
                    Something went wrong during generation. You can retry and we'll try again.
                  </p>
                  <Button
                    onClick={handleRetryGeneration}
                    disabled={retrying}
                    className="roomyfy-gradient text-primary-foreground px-8"
                    size="lg"
                  >
                    <RefreshCw className={"mr-2 h-5 w-5" + (retrying ? " animate-spin" : "")} />
                    {retrying ? 'Retrying…' : 'Retry Generation'}
                  </Button>
                </CardContent>
              </Card>

              {/* Still show original image */}
              <Card className="overflow-hidden roomyfy-card-shadow">
                <CardContent className="p-0">
                  <div className="p-3 sm:p-4 bg-muted/50">
                    <h3 className="font-semibold text-sm sm:text-base">Your Original Photo</h3>
                  </div>
                  <div className="aspect-[4/3]">
                    {signedUrls.originalSignedUrl ? (
                      <img src={signedUrls.originalSignedUrl} alt="Original room" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Loading image...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Before/After Comparison */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="overflow-hidden roomyfy-card-shadow">
                <CardContent className="p-0">
                  <div className="p-3 sm:p-4 bg-muted/50 flex items-center justify-between">
                    <h3 className="font-semibold text-sm sm:text-base">Before</h3>
                  </div>
                  <div className="aspect-[4/3]">
                    {signedUrls.originalSignedUrl ? (
                      <img src={signedUrls.originalSignedUrl} alt="Original room" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Loading image...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden roomyfy-card-shadow">
                <CardContent className="p-0">
                  <div className="p-3 sm:p-4 bg-primary/10 flex items-center justify-between">
                    <h3 className="font-semibold text-sm sm:text-base text-primary">After</h3>
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="aspect-[4/3]">
                    {signedUrls.generatedSignedUrl ? (
                      <img src={signedUrls.generatedSignedUrl} alt="AI generated design" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">No generated image</p>
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
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-semibold">AI Design Suggestions</h2>
                </div>
                <div className="prose prose-sm max-w-none text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">
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
