import { useEffect, useRef, useState } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { Pose } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface PushupCounterProps {
  onPushupDetected: () => void;
  targetCount: number;
  currentCount: number;
}

const PushupCounter = ({ onPushupDetected, targetCount, currentCount }: PushupCounterProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [poseState, setPoseState] = useState<'up' | 'down' | 'transitioning'>('up');
  const [confidence, setConfidence] = useState(0);

  // Pushup detection logic
  const detectPushup = (landmarks: any[]) => {
    // Key landmarks for pushup detection
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow || !leftWrist || !rightWrist) {
      return;
    }

    // Calculate angles and positions
    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const elbowY = (leftElbow.y + rightElbow.y) / 2;
    const wristY = (leftWrist.y + rightWrist.y) / 2;

    // Simple pushup detection based on relative positions
    const isDown = elbowY > shoulderY && wristY > shoulderY;
    const isUp = elbowY < shoulderY && wristY < shoulderY;

    // Update confidence based on pose detection
    const avgVisibility = (leftShoulder.visibility + rightShoulder.visibility + 
                          leftElbow.visibility + rightElbow.visibility + 
                          leftWrist.visibility + rightWrist.visibility) / 6;
    setConfidence(Math.round(avgVisibility * 100));

    // State machine for pushup counting
    if (isDown && poseState === 'up') {
      setPoseState('down');
    } else if (isUp && poseState === 'down') {
      setPoseState('up');
      onPushupDetected();
      toast({
        title: "Pushup detected! 💪",
        description: `${currentCount + 1} / ${targetCount}`,
      });
    }
  };

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults((results) => {
      if (!canvasRef.current) return;
      
      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw the video frame
      canvasCtx.globalCompositeOperation = 'source-over';
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

      // Draw pose landmarks
      if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 4
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: '#FF0000',
          lineWidth: 2
        });

        // Detect pushup
        detectPushup(results.poseLandmarks);
      }

      canvasCtx.restore();
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await pose.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480
    });

    camera.start().then(() => {
      setIsInitialized(true);
    }).catch((error) => {
      console.error('Camera initialization failed:', error);
      toast({
        title: "Camera Error",
        description: "Failed to initialize camera for pose detection.",
        variant: "destructive"
      });
    });

    return () => {
      camera.stop();
    };
  }, [onPushupDetected, currentCount, targetCount, poseState]);

  if (!isInitialized) {
    return (
      <Card className="p-6 text-center">
        <div className="animate-pulse">
          <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
          <p className="text-muted-foreground">Initializing camera and pose detection...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Camera Feed */}
      <div className="relative">
        <video
          ref={videoRef}
          className="absolute invisible w-full h-auto"
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-lg border bg-black"
          width={640}
          height={480}
        />
        
        {/* Overlay Info */}
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
          State: {poseState.toUpperCase()}
        </div>
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
          Confidence: {confidence}%
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Position yourself in the camera view and start doing pushups
        </p>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          poseState === 'up' ? 'bg-accent text-accent-foreground' :
          poseState === 'down' ? 'bg-primary text-primary-foreground' :
          'bg-muted text-muted-foreground'
        }`}>
          {poseState === 'up' ? '⬆️ UP Position' : 
           poseState === 'down' ? '⬇️ DOWN Position' : 
           '🔄 Transitioning'}
        </div>
      </div>
    </div>
  );
};

export default PushupCounter;