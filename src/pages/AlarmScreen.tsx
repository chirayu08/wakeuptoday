import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, CameraOff, RotateCcw, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PushupMLCounter from "@/components/PushupMLCounter";
import CameraView from "@/components/CameraView";
import { createWorkoutLog } from "@/lib/database";
import { useAuth } from "@/hooks/useAuth";

const AlarmScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [pushupCount, setPushupCount] = useState(0);
  const [targetPushups] = useState(20); // This would come from the alarm data
  const [alarmTime] = useState("07:00"); // This would come from the alarm data
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const audioRef = useRef<HTMLAudioElement>(null);

  // Simulate alarm sound (you'd use a real alarm sound file)
  const playAlarmSound = () => {
    // Create audio context for alarm sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    oscillator.start();
    setTimeout(() => oscillator.stop(), 500);
  };

  useEffect(() => {
    // Play alarm sound every 2 seconds until dismissed
    if (!isCompleted) {
      const interval = setInterval(playAlarmSound, 2000);
      return () => clearInterval(interval);
    }
  }, [isCompleted]);

  useEffect(() => {
    if (pushupCount >= targetPushups) {
      setIsCompleted(true);
      
      // Save workout log to database
      const saveWorkout = async () => {
        try {
          const duration = Math.round((Date.now() - startTime) / 1000);
          await createWorkoutLog({
            target_pushups: targetPushups,
            completed_pushups: pushupCount,
            duration_seconds: duration,
            completed_at: new Date().toISOString(),
            alarm_name: "Morning Boost"
          });
          
          toast({
            title: "Alarm Dismissed! 🎉",
            description: `Great job! You completed ${targetPushups} pushups in ${Math.round(duration / 60)} minutes.`,
          });
        } catch (error) {
          console.error('Error saving workout:', error);
          toast({
            title: "Alarm dismissed!",
            description: "Note: Could not save to history, but you did great!",
            variant: "destructive",
          });
        }
      };

      saveWorkout();
      
      // Auto-navigate after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [pushupCount, targetPushups, navigate, startTime, toast]);

  const enableCamera = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraEnabled(true);
      toast({
        title: "Camera enabled",
        description: "Get in position and start doing pushups!"
      });
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to track your pushups.",
        variant: "destructive"
      });
    }
  };

  const resetCount = () => {
    setPushupCount(0);
    toast({
      title: "Counter reset",
      description: "Starting over. You can do this!"
    });
  };

  const progress = (pushupCount / targetPushups) * 100;

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <CheckCircle size={64} className="mx-auto mb-4 text-accent" />
          <h1 className="text-2xl font-bold mb-2">Alarm Dismissed!</h1>
          <p className="text-muted-foreground mb-4">
            Congratulations! You completed {targetPushups} pushups.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to dashboard in 3 seconds...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-destructive/10 relative">
      {/* Alarm Header - Always visible */}
      <div className="sticky top-0 bg-destructive text-destructive-foreground p-4 text-center z-50">
        <h1 className="text-2xl font-bold animate-pulse">🚨 ALARM ACTIVE 🚨</h1>
        <p className="text-lg">{alarmTime}</p>
        <p className="text-sm opacity-90">Complete pushups to dismiss</p>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Progress Card */}
        <Card className="p-6 text-center">
          <div className="mb-4">
            <div className="text-4xl font-bold text-primary mb-2">
              {pushupCount} / {targetPushups}
            </div>
            <Progress value={progress} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">
              {targetPushups - pushupCount} pushups remaining
            </p>
          </div>
          
          <div className="flex justify-center gap-2">
            <Button onClick={resetCount} variant="outline" size="sm">
              <RotateCcw size={16} className="mr-2" />
              Reset
            </Button>
          </div>
        </Card>

        {/* Camera & Detection Section */}
        {!cameraEnabled ? (
          <Card className="p-6 text-center">
            <CameraOff size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Enable Camera & Detection</h3>
            <p className="text-muted-foreground mb-4">
              Allow camera access to see your body and track pushups automatically.
            </p>
            <Button onClick={enableCamera} className="w-full">
              <Camera size={16} className="mr-2" />
              Enable Camera & Start Detection
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Camera View */}
            <CameraView 
              isActive={cameraEnabled}
              onCameraReady={(ready) => console.log('Camera ready:', ready)}
            />
            
            {/* Pushup Detection */}
            <Card className="p-4">
              <h3 className="font-medium mb-4 text-center">Smart Pushup Detection</h3>
              <PushupMLCounter 
                onPushupDetected={() => setPushupCount(prev => prev + 1)}
                targetCount={targetPushups}
                currentCount={pushupCount}
              />
            </Card>
          </div>
        )}

        {/* Instructions */}
        <Card className="p-4 bg-muted/50">
          <h3 className="font-medium mb-2">Instructions</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Position yourself in the camera view to monitor your form</li>
            <li>• Place your device under your chest area on the floor for motion detection</li>
            <li>• Start in plank position above the device</li>
            <li>• Perform controlled pushups - the device detects down-to-up movement</li>
            <li>• Complete {targetPushups} pushups to dismiss the alarm</li>
          </ul>
        </Card>

        {/* Manual increment for testing */}
        <Card className="p-4 border-dashed border-warning bg-warning/5">
          <p className="text-sm text-center text-muted-foreground mb-2">
            Demo Mode - Manual Counter
          </p>
          <Button 
            onClick={() => setPushupCount(prev => prev + 1)} 
            variant="outline" 
            className="w-full"
            disabled={pushupCount >= targetPushups}
          >
            + Add Pushup (Testing)
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AlarmScreen;