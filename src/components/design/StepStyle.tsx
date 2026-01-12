import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Sparkles, Crown, Laptop, Leaf, Check, Palette } from 'lucide-react';

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

// Ready-made style templates with descriptions
const styleTemplates = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    mood: 'modern',
    type: 'minimal',
    icon: Laptop,
    prompt: 'Clean lines, neutral colors (white, grey, beige), sleek furniture, open space, minimal decor, natural light emphasis',
    tags: ['Clean', 'Sleek', 'Contemporary'],
    color: 'from-slate-400 to-slate-600',
  },
  {
    id: 'indian-traditional',
    name: 'Indian Traditional',
    mood: 'traditional',
    type: 'indian',
    icon: Sparkles,
    prompt: 'Rich wooden furniture, brass accents, colorful textiles (red, gold, orange), carved details, diyas, rangoli patterns, warm lighting',
    tags: ['Cultural', 'Warm', 'Classic'],
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'pooja-sacred',
    name: 'Pooja Room Sacred',
    mood: 'traditional',
    type: 'indian',
    icon: Sparkles,
    prompt: 'Marble or wooden mandir, brass idols, bell, incense holder, lotus motifs, saffron and gold colors, LED diya lights, sacred symbols',
    tags: ['Spiritual', 'Sacred', 'Divine'],
    color: 'from-yellow-500 to-red-500',
  },
  {
    id: 'luxury-royal',
    name: 'Luxury Royal',
    mood: 'luxury',
    type: 'western',
    icon: Crown,
    prompt: 'Velvet upholstery, crystal chandeliers, gold accents, marble floors, ornate mirrors, rich jewel tones (emerald, sapphire, ruby)',
    tags: ['Premium', 'Elegant', 'Grand'],
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'calm-zen',
    name: 'Calm & Zen',
    mood: 'calm',
    type: 'minimal',
    icon: Leaf,
    prompt: 'Natural materials (bamboo, wood, stone), indoor plants, water features, soft earth tones, low furniture, diffused natural lighting',
    tags: ['Peaceful', 'Natural', 'Relaxing'],
    color: 'from-green-400 to-teal-500',
  },
  {
    id: 'bohemian-eclectic',
    name: 'Bohemian Chic',
    mood: 'calm',
    type: 'custom',
    icon: Palette,
    prompt: 'Layered textiles, macrame, vintage furniture, houseplants, warm earthy colors with pops of vibrant hues, global-inspired patterns',
    tags: ['Artistic', 'Eclectic', 'Cozy'],
    color: 'from-pink-400 to-orange-400',
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    mood: 'modern',
    type: 'western',
    icon: Laptop,
    prompt: 'White walls, light wood floors, functional furniture, cozy textiles, plants, black accents, hygge atmosphere',
    tags: ['Nordic', 'Cozy', 'Functional'],
    color: 'from-sky-300 to-blue-400',
  },
  {
    id: 'custom',
    name: 'Custom Style',
    mood: '',
    type: 'custom',
    icon: Palette,
    prompt: '',
    tags: ['Your Vision', 'Personalized'],
    color: 'from-primary to-primary/70',
  },
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
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const isCustomSelected = selectedTemplate === 'custom';
  
  const handleTemplateSelect = (template: typeof styleTemplates[0]) => {
    setSelectedTemplate(template.id);
    
    if (template.id === 'custom') {
      onSelectMood('modern');
      onSelectType('custom');
      onCustomPromptChange?.('');
    } else {
      onSelectMood(template.mood);
      onSelectType(template.type);
      onCustomPromptChange?.(template.prompt);
    }
  };
  
  const canContinue = selectedTemplate && (!isCustomSelected || customPrompt.trim().length > 0);

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-0">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Choose Your Design Style</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Select a ready-made style template or create your own custom design
        </p>
      </div>

      {/* Style Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {styleTemplates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-lg group relative overflow-hidden ${
              selectedTemplate === template.id
                ? 'ring-2 ring-primary roomyfy-card-shadow'
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <CardContent className="p-4">
              {/* Icon with gradient background */}
              <div
                className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-br ${template.color} shadow-lg`}
              >
                <template.icon className="h-6 w-6 text-white" />
              </div>
              
              {/* Template name */}
              <h3 className="font-semibold text-center mb-2">{template.name}</h3>
              
              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-1 mb-3">
                {template.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="text-xs px-2 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {/* Preview prompt (truncated) */}
              {template.prompt && (
                <p className="text-xs text-muted-foreground text-center line-clamp-2">
                  {template.prompt}
                </p>
              )}
              
              {template.id === 'custom' && (
                <p className="text-xs text-muted-foreground text-center">
                  Describe your own unique style vision
                </p>
              )}
              
              {/* Selected indicator */}
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Style Preview */}
      {selectedTemplate && selectedTemplate !== 'custom' && (
        <div className="mb-6 sm:mb-8 p-4 bg-muted/50 rounded-xl border">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Style Preview
          </h3>
          <p className="text-sm text-muted-foreground">
            {styleTemplates.find(t => t.id === selectedTemplate)?.prompt}
          </p>
          <p className="text-xs text-muted-foreground mt-2 italic">
            This style will be applied to your room design
          </p>
        </div>
      )}

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
