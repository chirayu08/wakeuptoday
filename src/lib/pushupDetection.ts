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

// Pushup detector for device placed under person (plank to down to up)
export class PushupDetector {
  private isInDownPosition: boolean = false;
  private isInitialized: boolean = false;
  private baselineZ: number = 0;
  private motionHistory: MotionData[] = [];
  private pushupCount: number = 0;
  private onPushupComplete?: () => void;
  private minTimeBetweenPushups: number = 800; // 0.8 seconds
  private lastPushupTime: number = 0;
  private downThreshold: number = 2.5; // Acceleration threshold for detecting person coming down
  private upThreshold: number = 1.5; // Threshold for detecting person going back up

  constructor(onPushupComplete?: () => void) {
    this.onPushupComplete = onPushupComplete;
  }

  // Process motion sensor data for device placed under person
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

    // Initialize baseline Z-axis acceleration (person in plank position above device)
    if (!this.isInitialized && this.motionHistory.length > 10) {
      this.baselineZ = this.motionHistory
        .slice(-10)
        .reduce((sum, data) => sum + Math.abs(data.acceleration.z), 0) / 10;
      this.isInitialized = true;
    }

    // Calculate Z-axis acceleration change (vertical movement relative to device)
    const zAccel = Math.abs(motionData.acceleration.z);
    const zChange = this.isInitialized ? Math.abs(zAccel - this.baselineZ) : 0;
    
    // Calculate total motion intensity for display
    const totalAccel = Math.sqrt(
      motionData.acceleration.x ** 2 + 
      motionData.acceleration.y ** 2 + 
      motionData.acceleration.z ** 2
    );
    const intensity = Math.min(100, (zChange / 5) * 100);

    const currentTime = Date.now();
    const isValidMotion = this.isInitialized && zChange > 0.5;
    
    // Detect person coming down (increased Z acceleration)
    if (zChange > this.downThreshold && !this.isInDownPosition && 
        currentTime - this.lastPushupTime > this.minTimeBetweenPushups) {
      this.isInDownPosition = true;
    } 
    // Detect person pushing up (decreased Z acceleration, completing pushup)
    else if (zChange < this.upThreshold && this.isInDownPosition) {
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
    this.isInitialized = false;
    this.baselineZ = 0;
    this.motionHistory = [];
    this.pushupCount = 0;
    this.lastPushupTime = 0;
  }

  // Get current pushup count
  getCount(): number {
    return this.pushupCount;
  }
}