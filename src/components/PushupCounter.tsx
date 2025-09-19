import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PushupMLCounter from './PushupMLCounter';

interface PushupCounterProps {
  onPushupDetected: () => void;
  targetCount: number;
  currentCount: number;
}

const PushupCounter = ({ onPushupDetected, targetCount, currentCount }: PushupCounterProps) => {
  const [useMLCounter, setUseMLCounter] = useState(true);

  if (useMLCounter) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setUseMLCounter(false)}
          >
            Use Simple Counter
          </Button>
        </div>
        <PushupMLCounter 
          onPushupDetected={onPushupDetected}
          targetCount={targetCount}
          currentCount={currentCount}
        />
      </div>
    );
  }

  // Fallback simple counter
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Simple Pushup Counter
        </CardTitle>
        <CardDescription>
          Manual pushup counter for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setUseMLCounter(true)}
          >
            Use AI Counter
          </Button>
        </div>
        
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-3xl font-bold text-primary">
            {currentCount} / {targetCount}
          </div>
          <p className="text-sm text-muted-foreground">Pushups Completed</p>
        </div>

        <Button 
          onClick={onPushupDetected}
          className="w-full"
          size="lg"
        >
          Count Pushup (+1)
        </Button>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is a simple manual counter. Switch to "AI Counter" for automatic detection using machine learning.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PushupCounter;