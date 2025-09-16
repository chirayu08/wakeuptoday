import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, TrendingUp, Clock, Target } from "lucide-react";
import Navigation from "@/components/Navigation";

interface WorkoutLog {
  id: string;
  date: string;
  time: string;
  targetPushups: number;
  completedPushups: number;
  duration: string; // Time taken to complete
  alarmName?: string;
}

const History = () => {
  // Mock data - this would come from Supabase
  const [workoutLogs] = useState<WorkoutLog[]>([
    {
      id: "1",
      date: "2024-01-15",
      time: "07:00",
      targetPushups: 20,
      completedPushups: 20,
      duration: "2m 15s",
      alarmName: "Morning Workout"
    },
    {
      id: "2",
      date: "2024-01-14",
      time: "07:00",
      targetPushups: 15,
      completedPushups: 15,
      duration: "1m 45s",
      alarmName: "Morning Workout"
    },
    {
      id: "3",
      date: "2024-01-13",
      time: "06:30",
      targetPushups: 25,
      completedPushups: 25,
      duration: "3m 20s",
      alarmName: "Early Bird"
    },
    {
      id: "4",
      date: "2024-01-12",
      time: "07:00",
      targetPushups: 20,
      completedPushups: 18,
      duration: "4m 10s",
      alarmName: "Morning Workout"
    }
  ]);

  const totalPushups = workoutLogs.reduce((sum, log) => sum + log.completedPushups, 0);
  const completedAlarms = workoutLogs.filter(log => log.completedPushups >= log.targetPushups).length;
  const successRate = workoutLogs.length > 0 ? (completedAlarms / workoutLogs.length) * 100 : 0;

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
      return date.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

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
            <div className="text-lg font-bold">{totalPushups}</div>
            <div className="text-xs text-muted-foreground">Total Pushups</div>
          </Card>
          
          <Card className="p-3 text-center">
            <Target size={24} className="mx-auto mb-2 text-primary" />
            <div className="text-lg font-bold">{successRate.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </Card>
          
          <Card className="p-3 text-center">
            <TrendingUp size={24} className="mx-auto mb-2 text-success" />
            <div className="text-lg font-bold">{workoutLogs.length}</div>
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
              const isCompleted = log.completedPushups >= log.targetPushups;
              
              return (
                <Card key={log.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">
                        {log.alarmName || `Alarm ${log.time}`}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        {formatDate(log.date)}
                        <Clock size={14} />
                        {log.time}
                      </div>
                    </div>
                    
                    <Badge variant={isCompleted ? "default" : "destructive"}>
                      {isCompleted ? "Completed" : "Incomplete"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-medium text-lg">
                        {log.completedPushups}/{log.targetPushups}
                      </div>
                      <div className="text-muted-foreground">Pushups</div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-lg">{log.duration}</div>
                      <div className="text-muted-foreground">Duration</div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-lg">
                        {((log.completedPushups / log.targetPushups) * 100).toFixed(0)}%
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
            {successRate >= 80 
              ? "Excellent consistency! You're crushing your goals!"
              : successRate >= 50
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