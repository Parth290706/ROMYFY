import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StepRoomType from '@/components/design/StepRoomType';
import StepUpload from '@/components/design/StepUpload';
import StepStyle from '@/components/design/StepStyle';
import StepBudget from '@/components/design/StepBudget';
import StepProcessing from '@/components/design/StepProcessing';
import DesignHeader from '@/components/design/DesignHeader';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DesignData {
  roomType: string;
  imageFile: File | null;
  imagePreview: string;
  styleMood: string;
  styleType: string;
  customPrompt: string;
  budget: string;
}

const NewDesign = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [designData, setDesignData] = useState<DesignData>({
    roomType: '',
    imageFile: null,
    imagePreview: '',
    styleMood: '',
    styleType: '',
    customPrompt: '',
    budget: '',
  });

  const totalSteps = 4;

  const updateDesignData = (data: Partial<DesignData>) => {
    setDesignData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!designData.imageFile) return;

    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please sign in or create an account to save your design.',
      });
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      // Upload original image to storage
      const fileExt = designData.imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('room-images')
        .upload(fileName, designData.imageFile);

      if (uploadError) throw uploadError;

      // Create signed URL for the AI to access (1 hour expiry)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('room-images')
        .createSignedUrl(fileName, 3600);

      if (signedUrlError) throw signedUrlError;

      // Create design record - store the path, not the URL
      const { data: design, error: insertError } = await supabase
        .from('room_designs')
        .insert({
          user_id: user.id,
          room_type: designData.roomType,
          style_mood: designData.styleMood,
          style_type: designData.styleType,
          budget: designData.budget,
          original_image_url: fileName, // Store path instead of URL
          status: 'processing',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Call AI edge function with signed URL
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('generate-design', {
        body: {
          designId: design.id,
          imageUrl: signedUrlData.signedUrl, // Use signed URL for AI access
          roomType: designData.roomType,
          styleMood: designData.styleMood,
          styleType: designData.styleType,
          customPrompt: designData.customPrompt,
          budget: designData.budget,
        },
      });

      if (aiError || aiResult?.success === false) {
        toast({
          variant: 'destructive',
          title: aiResult?.error_code === 'AI_CREDITS_REQUIRED' ? 'AI credits required' : 'Generation issue',
          description:
            aiResult?.error ||
            'We saved your design, but the AI image could not be generated. You can retry from the results page.',
        });
      } else {
        toast({
          title: 'Design created!',
          description: 'Generating your AI design… redirecting to results.',
        });
      }

      navigate(`/design/${design.id}`);
    } catch {
      // Silent fail - show user-friendly error without logging sensitive details
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create design. Please try again.',
      });
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return <StepProcessing />;
  }

  return (
    <div className="min-h-screen bg-background">
      <DesignHeader currentStep={currentStep} totalSteps={totalSteps} onBack={() => navigate('/dashboard')} />

      <main className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <StepRoomType
                selected={designData.roomType}
                onSelect={(roomType) => updateDesignData({ roomType })}
                onNext={nextStep}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <StepUpload
                imagePreview={designData.imagePreview}
                onUpload={(file, preview) => updateDesignData({ imageFile: file, imagePreview: preview })}
                onNext={nextStep}
                onBack={prevStep}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <StepStyle
                selectedMood={designData.styleMood}
                selectedType={designData.styleType}
                customPrompt={designData.customPrompt}
                onSelectMood={(mood) => updateDesignData({ styleMood: mood })}
                onSelectType={(type) => updateDesignData({ styleType: type, customPrompt: type === 'custom' ? designData.customPrompt : '' })}
                onCustomPromptChange={(prompt) => updateDesignData({ customPrompt: prompt })}
                onNext={nextStep}
                onBack={prevStep}
              />
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <StepBudget
                selected={designData.budget}
                onSelect={(budget) => updateDesignData({ budget })}
                onSubmit={handleSubmit}
                onBack={prevStep}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default NewDesign;
