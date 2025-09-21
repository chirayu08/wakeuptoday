// Simple pushup detection using device motion and timing

export interface MotionData {
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  timestamp: number;
}

export interface SimpleDetectionMetrics {
  isValidMotion: boolean;
  intensity: number;
  isDown: boolean;
}

// Simple pushup detector using motion patterns and timing
export class PushupDetector {
  private isInDownPosition: boolean = false;
  private lastMotionTime: number = 0;
  private motionHistory: MotionData[] = [];
  private pushupCount: number = 0;
  private onPushupComplete?: () => void;
  private minTimeBetweenPushups: number = 1000; // 1 second
  private lastPushupTime: number = 0;

  constructor(onPushupComplete?: () => void) {
    this.onPushupComplete = onPushupComplete;
  }

  // Process motion sensor data
  processMotionData(motionData: MotionData): {
    metrics: SimpleDetectionMetrics;
    isDown: boolean;
    progress: number;
    count: number;
  } {
    this.motionHistory.push(motionData);
    
    // Keep only recent motion data (last 2 seconds)
    const twoSecondsAgo = Date.now() - 2000;
    this.motionHistory = this.motionHistory.filter(data => data.timestamp > twoSecondsAgo);

    // Calculate motion intensity (total acceleration magnitude)
    const totalAccel = Math.sqrt(
      motionData.acceleration.x ** 2 + 
      motionData.acceleration.y ** 2 + 
      motionData.acceleration.z ** 2
    );

    // Detect pushup pattern based on motion intensity
    const isValidMotion = totalAccel > 12 && totalAccel < 25; // Reasonable motion range
    const intensity = Math.min(100, (totalAccel / 25) * 100);

    // Simple state machine: alternating high/low motion periods
    const currentTime = Date.now();
    const isHighMotion = totalAccel > 15;
    
    if (isHighMotion && !this.isInDownPosition && 
        currentTime - this.lastPushupTime > this.minTimeBetweenPushups) {
      this.isInDownPosition = true;
      this.lastMotionTime = currentTime;
    } else if (!isHighMotion && this.isInDownPosition && 
               currentTime - this.lastMotionTime > 500) { // Minimum down time
      this.isInDownPosition = false;
      this.pushupCount++;
      this.lastPushupTime = currentTime;
      
      if (this.onPushupComplete) {
        this.onPushupComplete();
      }
    }

    return {
      metrics: {
        isValidMotion,
        intensity,
        isDown: this.isInDownPosition
      },
      isDown: this.isInDownPosition,
      progress: intensity,
      count: this.pushupCount
    };
  }

  // Manual pushup count (for tap-to-count mode)
  addManualPushup(): void {
    const currentTime = Date.now();
    if (currentTime - this.lastPushupTime > this.minTimeBetweenPushups) {
      this.pushupCount++;
      this.lastPushupTime = currentTime;
      
      if (this.onPushupComplete) {
        this.onPushupComplete();
      }
    }
  }

  // Reset the detector state
  reset(): void {
    this.isInDownPosition = false;
    this.lastMotionTime = 0;
    this.motionHistory = [];
    this.pushupCount = 0;
    this.lastPushupTime = 0;
  }

  // Get current pushup count
  getCount(): number {
    return this.pushupCount;
  }
}