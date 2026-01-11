import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft, Sparkles, Crown, Laptop, Leaf, MapPin, Globe, Minimize, Palette } from 'lucide-react';

interface StepStyleProps {
  selectedMood: string;
  selectedType: string;
  customPrompt?: string;
  onSelectMood: (mood: string) => void;
  onSelectType: (type: string) => void;
  onCustomPromptChange?: (prompt: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const moods = [
  { id: 'calm', label: 'Calm', icon: Leaf, description: 'Peaceful & relaxing' },
  { id: 'luxury', label: 'Luxury', icon: Crown, description: 'Elegant & premium' },
  { id: 'modern', label: 'Modern', icon: Laptop, description: 'Clean & contemporary' },
  { id: 'traditional', label: 'Traditional', icon: Sparkles, description: 'Classic & timeless' },
];

const types = [
  { id: 'indian', label: 'Indian', icon: MapPin, description: 'Rich cultural elements' },
  { id: 'western', label: 'Western', icon: Globe, description: 'European & American' },
  { id: 'minimal', label: 'Minimal', icon: Minimize, description: 'Less is more' },
  { id: 'custom', label: 'Custom', icon: Palette, description: 'Mix & match styles' },
];

const StepStyle: React.FC<StepStyleProps> = ({
  selectedMood,
  selectedType,
  customPrompt = '',
  onSelectMood,
  onSelectType,
  onCustomPromptChange,
  onNext,
  onBack,
}) => {
  const isCustomSelected = selectedType === 'custom';
  const canContinue = selectedMood && selectedType && (!isCustomSelected || customPrompt.trim().length > 0);
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Choose Your Style</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Select the mood and design type you prefer</p>
      </div>

      {/* Mood Selection */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Mood</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {moods.map((mood) => (
            <Card
              key={mood.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedMood === mood.id
                  ? 'ring-2 ring-primary roomyfy-card-shadow'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onSelectMood(mood.id)}
            >
              <CardContent className="p-3 sm:p-4 text-center">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors ${
                    selectedMood === mood.id
                      ? 'roomyfy-gradient'
                      : 'bg-muted'
                  }`}
                >
                  <mood.icon
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      selectedMood === mood.id ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  />
                </div>
                <h3 className="font-semibold text-sm sm:text-base">{mood.label}</h3>
                <p className="text-xs text-muted-foreground hidden sm:block">{mood.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Type Selection */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Design Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {types.map((type) => (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedType === type.id
                  ? 'ring-2 ring-primary roomyfy-card-shadow'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onSelectType(type.id)}
            >
              <CardContent className="p-3 sm:p-4 text-center">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors ${
                    selectedType === type.id
                      ? 'roomyfy-gradient'
                      : 'bg-muted'
                  }`}
                >
                  <type.icon
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      selectedType === type.id ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  />
                </div>
                <h3 className="font-semibold text-sm sm:text-base">{type.label}</h3>
                <p className="text-xs text-muted-foreground hidden sm:block">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Prompt Input */}
      {isCustomSelected && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Describe Your Custom Style</h2>
          <Textarea
            placeholder="Describe your dream room style... E.g., 'A cozy bohemian living room with warm earth tones, hanging plants, woven textures, and vintage furniture pieces'"
            value={customPrompt}
            onChange={(e) => onCustomPromptChange?.(e.target.value)}
            className="min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Be specific about colors, materials, furniture styles, and atmosphere you want.
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0">
        <Button variant="outline" size="lg" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
          Back
        </Button>
        <Button
          size="lg"
          className="roomyfy-gradient w-full sm:w-auto"
          disabled={!canContinue}
          onClick={onNext}
        >
          Continue
          <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
        </Button>
      </div>
    </div>
  );
};

export default StepStyle;
