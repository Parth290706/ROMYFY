import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DesignHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}

const DesignHeader: React.FC<DesignHeaderProps> = ({ currentStep, totalSteps, onBack }) => {
  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl roomyfy-gradient flex items-center justify-center">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">ROOMYFY</span>
            </Link>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-colors ${
                  index + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {currentStep}/{totalSteps}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesignHeader;
