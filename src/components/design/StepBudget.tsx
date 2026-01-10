import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Wallet, DollarSign, Gem } from 'lucide-react';

interface StepBudgetProps {
  selected: string;
  onSelect: (budget: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const budgets = [
  { 
    id: 'low', 
    label: 'Budget Friendly', 
    icon: Wallet, 
    description: 'Smart choices that look great',
    range: '₹50K - ₹2L'
  },
  { 
    id: 'medium', 
    label: 'Mid Range', 
    icon: DollarSign, 
    description: 'Balance of quality & value',
    range: '₹2L - ₹5L'
  },
  { 
    id: 'high', 
    label: 'Premium', 
    icon: Gem, 
    description: 'Luxury without limits',
    range: '₹5L+'
  },
];

const StepBudget: React.FC<StepBudgetProps> = ({ selected, onSelect, onSubmit, onBack }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Set Your Budget</h1>
        <p className="text-muted-foreground">Choose a budget range for your room makeover</p>
      </div>

      <div className="space-y-4 mb-8">
        {budgets.map((budget) => (
          <Card
            key={budget.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selected === budget.id
                ? 'ring-2 ring-primary roomyfy-card-shadow'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelect(budget.id)}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                  selected === budget.id
                    ? 'roomyfy-gradient'
                    : 'bg-muted'
                }`}
              >
                <budget.icon
                  className={`h-7 w-7 ${
                    selected === budget.id ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{budget.label}</h3>
                <p className="text-sm text-muted-foreground">{budget.description}</p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-primary">{budget.range}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button
          size="lg"
          className="roomyfy-gradient"
          disabled={!selected}
          onClick={onSubmit}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Generate Design
        </Button>
      </div>
    </div>
  );
};

export default StepBudget;
