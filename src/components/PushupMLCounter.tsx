import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Smartphone, Zap, Activity, Hand } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PushupDetector, type MotionData } from '@/lib/pushupDetection';

interface PushupMLCounterProps {
  onPushupDetected: () => void;
  targetCount: number;
  currentCount: number;
}

const PushupMLCounter: React.FC<PushupMLCounterProps> = ({
  onPushupDetected,
  targetCount,
  currentCount
}) => {
  const detectorRef = useRef<PushupDetector | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [motionIntensity, setMotionIntensity] = useState(0);
  const [isInDownPosition, setIsInDownPosition] = useState(false);
  const [feedback, setFeedback] = useState<string>('Ready to start');
  const [detectionMode, setDetectionMode] = useState<'motion' | 'manual'>('motion');
  const [hasMotionPermission, setHasMotionPermission] = useState(false);

  // Initialize the pushup detector
  useEffect(() => {
    detectorRef.current = new PushupDetector(() => {
      onPushupDetected();
    });
  }, [onPushupDetected]);

  // Check if device motion is available
  useEffect(() => {
    if (typeof DeviceMotionEvent !== 'undefined') {
      // Check if permission is needed (iOS 13+)
      const motionEvent = DeviceMotionEvent as any;
      if (motionEvent.requestPermission) {
        // iOS 13+ requires permission
        setDetectionMode('manual');
      } else {
        // Android or older iOS
        setHasMotionPermission(true);
      }
    } else {
      setDetectionMode('manual');
    }
  }, []);

  // Handle device motion events
  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    if (!detectorRef.current || !isDetecting) return;

    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const motionData: MotionData = {
      acceleration: {
        x: acceleration.x || 0,
        y: acceleration.y || 0,
        z: acceleration.z || 0
      },
      timestamp: Date.now()
    };

    const detection = detectorRef.current.processMotionData(motionData);
    
    // Update UI state
    setMotionIntensity(detection.progress);
    setIsInDownPosition(detection.isDown);
    
    // Provide feedback
    if (!detection.metrics.isValidMotion) {
      setFeedback('Place device under you and start pushups');
    } else if (detection.isDown) {
      setFeedback('Down position detected - push back up!');
    } else {
      setFeedback('Ready for next pushup!');
    }
  }, [isDetecting]);

  // Request motion permission (iOS)
  const requestMotionPermission = async () => {
    try {
      const motionEvent = DeviceMotionEvent as any;
      if (motionEvent.requestPermission) {
        const permission = await motionEvent.requestPermission();
        if (permission === 'granted') {
          setHasMotionPermission(true);
          setDetectionMode('motion');
          setError(null);
        } else {
          setError('Motion permission denied. Using manual mode.');
          setDetectionMode('manual');
        }
      }
    } catch (err) {
      console.error('Error requesting motion permission:', err);
      setError('Could not access motion sensors. Using manual mode.');
      setDetectionMode('manual');
    }
  };

  // Start motion detection
  const startMotionDetection = () => {
    if (detectionMode === 'motion' && hasMotionPermission) {
      window.addEventListener('devicemotion', handleDeviceMotion);
      setIsDetecting(true);
      setFeedback('Motion detection active - start doing pushups!');
      setError(null);
    } else {
      setIsDetecting(true);
      setFeedback('Tap the button below for each pushup you complete');
    }
  };

  // Stop motion detection
  const stopMotionDetection = () => {
    window.removeEventListener('devicemotion', handleDeviceMotion);
    setIsDetecting(false);
    setFeedback('Detection stopped');
  };

  // Manual pushup count
  const addManualPushup = () => {
    if (detectorRef.current) {
      detectorRef.current.addManualPushup();
      setFeedback('Pushup counted! Keep going!');
    }
  };

  // Reset detection
  const resetDetection = () => {
    if (detectorRef.current) {
      detectorRef.current.reset();
    }
    setMotionIntensity(0);
    setIsInDownPosition(false);
    setFeedback('Reset complete - ready to start');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [handleDeviceMotion]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Smart Pushup Counter
        </CardTitle>
        <CardDescription>
          Simple pushup detection using your device's motion sensors or manual counting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status indicators */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant={detectionMode === 'motion' ? "default" : "secondary"}>
            {detectionMode === 'motion' ? "Motion Mode" : "Manual Mode"}
          </Badge>
          <Badge variant={isDetecting ? "default" : "secondary"}>
            {isDetecting ? "Active" : "Inactive"}
          </Badge>
          <Badge variant={isInDownPosition ? "destructive" : "default"}>
            {isInDownPosition ? "DOWN" : "UP"}
          </Badge>
        </div>

        {/* Mode selection */}
        <div className="flex gap-2">
          <Button
            variant={detectionMode === 'motion' ? "default" : "outline"}
            size="sm"
            onClick={() => setDetectionMode('motion')}
            disabled={!hasMotionPermission}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Motion Detection
          </Button>
          <Button
            variant={detectionMode === 'manual' ? "default" : "outline"}
            size="sm"
            onClick={() => setDetectionMode('manual')}
          >
            <Hand className="h-4 w-4 mr-2" />
            Manual Count
          </Button>
        </div>

        {/* Request permission for iOS */}
        {!hasMotionPermission && detectionMode === 'motion' && (DeviceMotionEvent as any).requestPermission && (
          <Button onClick={requestMotionPermission} className="w-full">
            Enable Motion Detection
          </Button>
        )}

        {/* Feedback */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Activity className="h-4 w-4" />
          <span className="text-sm font-medium">{feedback}</span>
        </div>

        {/* Motion intensity (for motion mode) */}
        {detectionMode === 'motion' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Motion Intensity</span>
              <span>{Math.round(motionIntensity)}%</span>
            </div>
            <Progress value={motionIntensity} className="h-2" />
          </div>
        )}

        {/* Error display */}
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!isDetecting ? (
            <Button 
              onClick={startMotionDetection}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Start Detection
            </Button>
          ) : (
            <Button onClick={stopMotionDetection} variant="destructive">
              Stop Detection
            </Button>
          )}
          <Button onClick={resetDetection} variant="outline">
            Reset Count
          </Button>
        </div>

        {/* Manual pushup button (for manual mode or as backup) */}
        {(detectionMode === 'manual' || isDetecting) && (
          <Button 
            onClick={addManualPushup} 
            size="lg"
            className="w-full h-16 text-xl font-bold"
            disabled={!isDetecting}
          >
            <Hand className="h-6 w-6 mr-2" />
            Tap for Each Pushup
          </Button>
        )}

        {/* Progress display */}
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-3xl font-bold text-primary">
            {currentCount} / {targetCount}
          </div>
          <p className="text-sm text-muted-foreground">Pushups Completed</p>
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Instructions:</strong></p>
          {detectionMode === 'motion' ? (
            <ul className="list-disc pl-5 space-y-1">
              <li>Place your phone/tablet on the floor under your chest area</li>
              <li>Start in plank position above the device</li>
              <li>The motion sensors will detect when you go down and back up</li>
              <li>Perform steady, controlled pushups - the device detects the vertical movement</li>
              <li>Each complete down-to-up movement counts as one pushup</li>
            </ul>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              <li>Tap the "Tap for Each Pushup" button after completing each pushup</li>
              <li>Make sure to maintain proper form</li>
              <li>Don't tap too quickly - there's a minimum time between counts</li>
              <li>You can also use this as a backup if motion detection isn't working</li>
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PushupMLCounter;