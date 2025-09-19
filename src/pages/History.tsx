import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, TrendingUp, Clock, Target } from "lucide-react";
import Navigation from "@/components/Navigation";
import { getWorkoutLogs, calculateWorkoutStats, type WorkoutLog } from "@/lib/database";
import { useAuth } from "@/hooks/useAuth";

const History = () => {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadWorkoutHistory();
    }
  }, [user]);

  const loadWorkoutHistory = async () => {
    try {
      setLoading(true);
      const logs = await getWorkoutLogs();
      setWorkoutLogs(logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workout history');
      console.error('Error loading workout history:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = calculateWorkoutStats(workoutLogs);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return format(date, "MMM d, yyyy");
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 z-40">
          <h1 className="text-xl font-semibold text-center">Workout History</h1>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 z-40">
          <h1 className="text-xl font-semibold text-center">Workout History</h1>
        </div>
        <div className="p-4">
          <Card className="p-8 text-center border-destructive/50">
            <p className="text-destructive">{error}</p>
          </Card>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 z-40">
        <h1 className="text-xl font-semibold text-center">Workout History</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <Trophy size={24} className="mx-auto mb-2 text-accent" />
            <div className="text-lg font-bold">{stats.totalPushups}</div>
            <div className="text-xs text-muted-foreground">Total Pushups</div>
          </Card>
          
          <Card className="p-3 text-center">
            <Target size={24} className="mx-auto mb-2 text-primary" />
            <div className="text-lg font-bold">{stats.successRate}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </Card>
          
          <Card className="p-3 text-center">
            <TrendingUp size={24} className="mx-auto mb-2 text-success" />
            <div className="text-lg font-bold">{stats.totalWorkouts}</div>
            <div className="text-xs text-muted-foreground">Total Alarms</div>
          </Card>
        </div>

        {/* Workout Logs */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Recent Workouts</h2>
          
          {workoutLogs.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No workout history</h3>
              <p className="text-muted-foreground mb-4">
                Complete some alarms to see your workout history here.
              </p>
            </Card>
          ) : (
            workoutLogs.map((log) => {
              const isCompleted = log.completed_pushups >= log.target_pushups;
              
              return (
                <Card key={log.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">
                        {log.alarm_name || `Alarm ${formatTime(log.completed_at)}`}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        {formatDate(log.completed_at)}
                        <Clock size={14} />
                        {formatTime(log.completed_at)}
                      </div>
                    </div>
                    
                    <Badge variant={isCompleted ? "default" : "destructive"}>
                      {isCompleted ? "Completed" : "Incomplete"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-medium text-lg">
                        {log.completed_pushups}/{log.target_pushups}
                      </div>
                      <div className="text-muted-foreground">Pushups</div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-lg">{formatDuration(log.duration_seconds)}</div>
                      <div className="text-muted-foreground">Duration</div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-lg">
                        {((log.completed_pushups / log.target_pushups) * 100).toFixed(0)}%
                      </div>
                      <div className="text-muted-foreground">Progress</div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Motivational Message */}
        <Card className="p-4 bg-primary/5 border-primary/20 text-center">
          <h3 className="font-medium mb-2">Keep Going! 💪</h3>
          <p className="text-sm text-muted-foreground">
            {stats.successRate >= 80 
              ? "Excellent consistency! You're crushing your goals!"
              : stats.successRate >= 50
              ? "Good progress! Keep pushing yourself!"
              : "Every pushup counts! Stay consistent for better results."
            }
          </p>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default History;