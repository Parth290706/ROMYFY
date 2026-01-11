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
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl roomyfy-gradient flex items-center justify-center">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground hidden sm:inline">ROOMYFY</span>
            </Link>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 sm:h-2 w-5 sm:w-8 rounded-full transition-colors ${
                  index + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
            <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-muted-foreground">
              {currentStep}/{totalSteps}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesignHeader;
