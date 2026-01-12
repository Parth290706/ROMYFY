import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Bed, Briefcase, ChefHat, ArrowRight, Flame, Bath, Sofa } from 'lucide-react';

interface StepRoomTypeProps {
  selected: string;
  onSelect: (roomType: string) => void;
  onNext: () => void;
}

const roomTypes = [
  { id: 'living-room', label: 'Living Room', icon: Home },
  { id: 'bedroom', label: 'Bedroom', icon: Bed },
  { id: 'office', label: 'Office', icon: Briefcase },
  { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
  { id: 'pooja-room', label: 'Pooja Room', icon: Flame },
  { id: 'bathroom', label: 'Bathroom', icon: Bath },
  { id: 'balcony', label: 'Balcony/Lobby', icon: Sofa },
];

const StepRoomType: React.FC<StepRoomTypeProps> = ({ selected, onSelect, onNext }) => {
  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-0">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Select Room Type</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Choose the type of room you want to redesign</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {roomTypes.map((room) => (
          <Card
            key={room.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selected === room.id
                ? 'ring-2 ring-primary roomyfy-card-shadow'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelect(room.id)}
          >
            <CardContent className="p-4 sm:p-6 text-center">
              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors ${
                  selected === room.id
                    ? 'roomyfy-gradient'
                    : 'bg-muted'
                }`}
              >
                <room.icon
                  className={`h-6 w-6 sm:h-8 sm:w-8 ${
                    selected === room.id ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}
                />
              </div>
              <h3 className="font-semibold text-base sm:text-lg">{room.label}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          className="roomyfy-gradient w-full sm:w-auto"
          disabled={!selected}
          onClick={onNext}
        >
          Continue
          <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
        </Button>
      </div>
    </div>
  );
};

export default StepRoomType;
