import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Bed, Briefcase, ChefHat, ArrowRight } from 'lucide-react';

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
];

const StepRoomType: React.FC<StepRoomTypeProps> = ({ selected, onSelect, onNext }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Select Room Type</h1>
        <p className="text-muted-foreground">Choose the type of room you want to redesign</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
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
            <CardContent className="p-6 text-center">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center transition-colors ${
                  selected === room.id
                    ? 'roomyfy-gradient'
                    : 'bg-muted'
                }`}
              >
                <room.icon
                  className={`h-8 w-8 ${
                    selected === room.id ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}
                />
              </div>
              <h3 className="font-semibold text-lg">{room.label}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          className="roomyfy-gradient"
          disabled={!selected}
          onClick={onNext}
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default StepRoomType;
