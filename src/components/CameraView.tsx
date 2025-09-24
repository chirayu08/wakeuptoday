import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Maximize2, Minimize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CameraViewProps {
  isActive: boolean;
  onCameraReady?: (isReady: boolean) => void;
  className?: string;
}

const CameraView: React.FC<CameraViewProps> = ({ 
  isActive, 
  onCameraReady,
  className = ""
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Start camera stream with better mobile support
  const startCamera = async () => {
    try {
      setError(null);
      console.log('Starting camera...');
      
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported');
      }

      // Check secure context
      if (!window.isSecureContext) {
        throw new Error('Camera requires HTTPS');
      }

      let stream: MediaStream;
      
      try {
        // Try rear camera first (better for body tracking)
        console.log('Attempting rear camera...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: 'environment' },
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 }
          },
          audio: false
        });
      } catch (rearCameraError) {
        console.log('Rear camera failed, trying front camera:', rearCameraError);
        
        // Fallback to front camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 }
          },
          audio: false
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        onCameraReady?.(true);
        
        console.log('Camera started successfully');
        toast({
          title: "Camera activated",
          description: "Position yourself in view and start doing pushups!"
        });
      }
    } catch (err) {
      console.error('Camera error:', err);
      
      let errorMessage = 'Camera access denied or unavailable';
      
      if (err instanceof Error) {
        if (err.message.includes('HTTPS')) {
          errorMessage = 'Camera requires secure connection (HTTPS)';
        } else if (err.message.includes('not supported')) {
          errorMessage = 'Browser does not support camera';
        } else if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied - please allow access';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found on device';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera busy or hardware error';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints not supported';
        }
      }
      
      setError(errorMessage);
      onCameraReady?.(false);
      
      toast({
        title: "Camera error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    onCameraReady?.(false);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Start camera when component becomes active
  useEffect(() => {
    if (isActive && !isCameraActive) {
      startCamera();
    } else if (!isActive && isCameraActive) {
      stopCamera();
    }
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Card className={`relative overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''} ${className}`}>
      <div className="relative aspect-video bg-black">
        {isCameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror the video for better user experience
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/70">
            <CameraOff size={48} className="mb-4" />
            <p className="text-center px-4">
              {error || 'Camera not active'}
            </p>
          </div>
        )}

        {/* Overlay with guidelines for better pushup detection */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Center guideline */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 border-2 border-primary/50 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 border border-primary/30 rounded-full"></div>
              </div>
            </div>
            
            {/* Instructions overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-3 rounded-lg text-sm">
              <p className="text-center">
                🎯 Position your chest in the center circle and start doing pushups
              </p>
            </div>
          </div>
        )}

        {/* Controls overlay */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isCameraActive && (
            <Button
              size="sm"
              variant="secondary"
              onClick={toggleFullscreen}
              className="bg-black/50 hover:bg-black/70 text-white border-none"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </Button>
          )}
          
          <Button
            size="sm"
            variant={isCameraActive ? "destructive" : "default"}
            onClick={isCameraActive ? stopCamera : startCamera}
            className={isCameraActive ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isCameraActive ? <CameraOff size={16} /> : <Camera size={16} />}
          </Button>
        </div>
      </div>

      {/* Camera info */}
      <div className="p-3 bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Camera Status: {isCameraActive ? '🟢 Active' : '🔴 Inactive'}
          </span>
          {isCameraActive && (
            <span className="text-xs text-muted-foreground">
              Live feed - perform pushups in view
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CameraView;