import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { Pose, Results } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Camera as CameraIcon, Zap, Activity } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PushupDetector, type PoseKeypoints } from '@/lib/pushupDetection';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const detectorRef = useRef<PushupDetector | null>(null);

  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poseVisible, setPoseVisible] = useState(false);
  const [pushupProgress, setPushupProgress] = useState(0);
  const [isInDownPosition, setIsInDownPosition] = useState(false);
  const [formFeedback, setFormFeedback] = useState<string>('Position yourself in frame');

  // Initialize the pushup detector
  useEffect(() => {
    detectorRef.current = new PushupDetector(() => {
      onPushupDetected();
    });
  }, [onPushupDetected]);

  // Handle pose results with advanced detection
  const onResults = useCallback((results: Results) => {
    if (!canvasRef.current || !detectorRef.current) return;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');
    if (!canvasCtx) return;

    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw the video frame
    if (results.image) {
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    }

    // Process pose landmarks
    if (results.poseLandmarks) {
      setPoseVisible(true);
      
      // Convert MediaPipe landmarks to our format
      const landmarks: PoseKeypoints[] = results.poseLandmarks.map(landmark => ({
        x: landmark.x,
        y: landmark.y,
        z: landmark.z || 0,
        visibility: landmark.visibility || 1
      }));

      // Process with advanced detector
      const detection = detectorRef.current.processPoseData(landmarks);
      
      // Update UI state
      setPushupProgress(detection.progress);
      setIsInDownPosition(detection.isDown);
      
      // Provide form feedback
      if (!detection.metrics.isValidPosition) {
        setFormFeedback('Position yourself in plank position');
      } else if (detection.metrics.elbowAngle < 90) {
        setFormFeedback('Good form - go lower!');
      } else if (detection.isDown) {
        setFormFeedback('Great! Now push up');
      } else {
        setFormFeedback('Perfect form - keep going!');
      }

      // Draw pose landmarks and connections
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: detection.metrics.isValidPosition ? '#00FF00' : '#FFFF00',
        lineWidth: 2
      });
      
      drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: detection.isDown ? '#FF6B6B' : '#4ECDC4',
        lineWidth: 2,
        radius: 3
      });

      // Draw additional UI overlay
      canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      canvasCtx.fillRect(10, 10, 200, 100);
      canvasCtx.fillStyle = 'white';
      canvasCtx.font = '14px Arial';
      canvasCtx.fillText(`Elbow Angle: ${Math.round(detection.metrics.elbowAngle)}°`, 20, 30);
      canvasCtx.fillText(`Body Alignment: ${detection.metrics.isValidPosition ? 'Good' : 'Adjust'}`, 20, 50);
      canvasCtx.fillText(`Position: ${detection.isDown ? 'DOWN' : 'UP'}`, 20, 70);
      canvasCtx.fillText(`Progress: ${Math.round(detection.progress)}%`, 20, 90);

    } else {
      setPoseVisible(false);
      setFormFeedback('Step into camera view');
    }

    canvasCtx.restore();
  }, [onPushupDetected]);

  // Initialize MediaPipe Pose
  useEffect(() => {
    const initializePose = async () => {
      try {
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

        pose.onResults(onResults);
        poseRef.current = pose;

        await pose.initialize();
        setIsModelLoaded(true);
      } catch (err) {
        console.error('Error initializing pose:', err);
        setError('Failed to load pose detection model');
      }
    };

    initializePose();

    return () => {
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [onResults]);

  // Start camera
  const startCamera = async () => {
    if (!videoRef.current || !poseRef.current) return;

    try {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });

      await camera.start();
      cameraRef.current = camera;
      setIsDetecting(true);
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please ensure camera permissions are granted.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    setIsDetecting(false);
  };

  // Reset calibration
  const resetCalibration = () => {
    if (detectorRef.current) {
      detectorRef.current.reset();
    }
    setPushupProgress(0);
    setIsInDownPosition(false);
    setFormFeedback('Position yourself in frame');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          AI Pushup Counter
        </CardTitle>
        <CardDescription>
          Using machine learning to detect and count your pushups in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status indicators */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant={isModelLoaded ? "default" : "secondary"}>
            {isModelLoaded ? "Model Loaded" : "Loading Model..."}
          </Badge>
          <Badge variant={isDetecting ? "default" : "secondary"}>
            {isDetecting ? "Camera Active" : "Camera Inactive"}
          </Badge>
          <Badge variant={poseVisible ? "default" : "secondary"}>
            {poseVisible ? "Pose Detected" : "No Pose"}
          </Badge>
          <Badge variant={isInDownPosition ? "destructive" : "default"}>
            {isInDownPosition ? "DOWN" : "UP"}
          </Badge>
        </div>

        {/* Form feedback */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Activity className="h-4 w-4" />
          <span className="text-sm font-medium">{formFeedback}</span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Range of Motion</span>
            <span>{Math.round(pushupProgress)}%</span>
          </div>
          <Progress value={pushupProgress} className="h-2" />
        </div>

        {/* Error display */}
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Camera controls */}
        <div className="flex gap-2">
          {!isDetecting ? (
            <Button 
              onClick={startCamera} 
              disabled={!isModelLoaded}
              className="flex items-center gap-2"
            >
              <CameraIcon className="h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <Button onClick={stopCamera} variant="destructive">
              Stop Camera
            </Button>
          )}
          <Button onClick={resetCalibration} variant="outline">
            Reset Calibration
          </Button>
        </div>

        {/* Progress display */}
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-3xl font-bold text-primary">
            {currentCount} / {targetCount}
          </div>
          <p className="text-sm text-muted-foreground">Pushups Completed</p>
        </div>

        {/* Video and canvas container */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-auto"
            style={{ display: 'none' }}
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full h-auto"
            style={{ maxHeight: '400px' }}
          />
          
          {!isDetecting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <div className="text-center">
                <CameraIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Click "Start Camera" to begin</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Position yourself in a plank position facing the camera</li>
            <li>Ensure your full body is visible in the frame</li>
            <li>Perform pushups with proper form</li>
            <li>The AI will automatically detect and count valid pushups</li>
            <li>Green lines show detected body pose</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PushupMLCounter;