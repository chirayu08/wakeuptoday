// Advanced pushup detection algorithms and utilities

export interface PoseKeypoints {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PushupMetrics {
  shoulderAngle: number;
  elbowAngle: number;
  bodyAlignment: number;
  range: number;
  isValidPosition: boolean;
}

// Calculate angle between three points
export function calculateAngle(
  point1: PoseKeypoints,
  point2: PoseKeypoints,
  point3: PoseKeypoints
): number {
  const vector1 = {
    x: point1.x - point2.x,
    y: point1.y - point2.y
  };
  
  const vector2 = {
    x: point3.x - point2.x,
    y: point3.y - point2.y
  };

  const dot = vector1.x * vector2.x + vector1.y * vector2.y;
  const mag1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
  const mag2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
  
  const cos = dot / (mag1 * mag2);
  return Math.acos(Math.max(-1, Math.min(1, cos))) * (180 / Math.PI);
}

// Calculate distance between two points
export function calculateDistance(point1: PoseKeypoints, point2: PoseKeypoints): number {
  return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
}

// Analyze pushup form and position
export function analyzePushupForm(landmarks: PoseKeypoints[]): PushupMetrics {
  // Key landmarks indices for MediaPipe Pose
  const LEFT_SHOULDER = 11;
  const RIGHT_SHOULDER = 12;
  const LEFT_ELBOW = 13;
  const RIGHT_ELBOW = 14;
  const LEFT_WRIST = 15;
  const RIGHT_WRIST = 16;
  const LEFT_HIP = 23;
  const RIGHT_HIP = 24;
  const LEFT_KNEE = 25;
  const RIGHT_KNEE = 26;

  const leftShoulder = landmarks[LEFT_SHOULDER];
  const rightShoulder = landmarks[RIGHT_SHOULDER];
  const leftElbow = landmarks[LEFT_ELBOW];
  const rightElbow = landmarks[RIGHT_ELBOW];
  const leftWrist = landmarks[LEFT_WRIST];
  const rightWrist = landmarks[RIGHT_WRIST];
  const leftHip = landmarks[LEFT_HIP];
  const rightHip = landmarks[RIGHT_HIP];
  const leftKnee = landmarks[LEFT_KNEE];
  const rightKnee = landmarks[RIGHT_KNEE];

  // Check if all required landmarks are visible
  const requiredLandmarks = [
    leftShoulder, rightShoulder, leftElbow, rightElbow,
    leftWrist, rightWrist, leftHip, rightHip
  ];

  const allVisible = requiredLandmarks.every(
    landmark => landmark && landmark.visibility > 0.5
  );

  if (!allVisible) {
    return {
      shoulderAngle: 0,
      elbowAngle: 0,
      bodyAlignment: 0,
      range: 0,
      isValidPosition: false
    };
  }

  // Calculate elbow angles (left and right)
  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

  // Calculate shoulder line angle (should be level)
  const shoulderAngle = Math.abs(Math.atan2(
    rightShoulder.y - leftShoulder.y,
    rightShoulder.x - leftShoulder.x
  ) * (180 / Math.PI));

  // Calculate body alignment (shoulder-hip-knee)
  const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const avgHipY = (leftHip.y + rightHip.y) / 2;
  const avgKneeY = (leftKnee.y + rightKnee.y) / 2;

  // Body should be in a straight line
  const shoulderHipDiff = Math.abs(avgShoulderY - avgHipY);
  const hipKneeDiff = Math.abs(avgHipY - avgKneeY);
  const bodyAlignment = Math.max(shoulderHipDiff, hipKneeDiff);

  // Calculate range of motion (distance from shoulders to ground)
  const shoulderGroundDistance = avgShoulderY;

  // Valid pushup position criteria
  const isValidPosition = 
    avgElbowAngle > 60 && avgElbowAngle < 180 && // Arms bent appropriately
    shoulderAngle < 15 && // Shoulders level
    bodyAlignment < 0.15 && // Body aligned
    allVisible; // All landmarks visible

  return {
    shoulderAngle,
    elbowAngle: avgElbowAngle,
    bodyAlignment,
    range: shoulderGroundDistance,
    isValidPosition
  };
}

// Pushup state detection class
export class PushupDetector {
  private minRange: number = Infinity;
  private maxRange: number = -Infinity;
  private isInDownPosition: boolean = false;
  private consecutiveValidFrames: number = 0;
  private pushupCount: number = 0;
  private onPushupComplete?: () => void;

  constructor(onPushupComplete?: () => void) {
    this.onPushupComplete = onPushupComplete;
  }

  // Process a new frame of pose data
  processPoseData(landmarks: PoseKeypoints[]): {
    metrics: PushupMetrics;
    isDown: boolean;
    progress: number;
    count: number;
  } {
    const metrics = analyzePushupForm(landmarks);

    if (!metrics.isValidPosition) {
      this.consecutiveValidFrames = 0;
      return {
        metrics,
        isDown: this.isInDownPosition,
        progress: 0,
        count: this.pushupCount
      };
    }

    this.consecutiveValidFrames++;

    // Update range calibration
    this.minRange = Math.min(this.minRange, metrics.range);
    this.maxRange = Math.max(this.maxRange, metrics.range);

    const rangeSpan = this.maxRange - this.minRange;
    
    if (rangeSpan < 0.05) {
      // Not enough range calibrated yet
      return {
        metrics,
        isDown: false,
        progress: 0,
        count: this.pushupCount
      };
    }

    // Calculate progress through range of motion
    const progress = Math.min(100, Math.max(0, 
      ((metrics.range - this.minRange) / rangeSpan) * 100
    ));

    // Determine if in down position
    const downThreshold = 70; // 70% of range = down position
    const upThreshold = 30;   // 30% of range = up position
    
    const isCurrentlyDown = progress > downThreshold && metrics.elbowAngle < 120;
    const isCurrentlyUp = progress < upThreshold && metrics.elbowAngle > 140;

    // State machine for pushup counting
    if (isCurrentlyDown && !this.isInDownPosition && this.consecutiveValidFrames > 10) {
      this.isInDownPosition = true;
    } else if (isCurrentlyUp && this.isInDownPosition && this.consecutiveValidFrames > 10) {
      this.isInDownPosition = false;
      this.pushupCount++;
      
      if (this.onPushupComplete) {
        this.onPushupComplete();
      }
    }

    return {
      metrics,
      isDown: this.isInDownPosition,
      progress,
      count: this.pushupCount
    };
  }

  // Reset the detector state
  reset(): void {
    this.minRange = Infinity;
    this.maxRange = -Infinity;
    this.isInDownPosition = false;
    this.consecutiveValidFrames = 0;
    this.pushupCount = 0;
  }

  // Get current pushup count
  getCount(): number {
    return this.pushupCount;
  }
}