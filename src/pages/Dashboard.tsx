import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Trash2, Edit, Play } from "lucide-react";
import Navigation from "@/components/Navigation";

interface Alarm {
  id: string;
  time: string;
  pushups: number;
  enabled: boolean;
  name?: string;
}

const Dashboard = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([
    {
      id: "1",
      time: "07:00",
      pushups: 20,
      enabled: true,
      name: "Morning Workout"
    }
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="p-4 text-center bg-gradient-to-b from-primary/10 to-background">
        <h1 className="text-2xl font-bold text-foreground mb-2">WakeUp Now</h1>
        <p className="text-sm text-muted-foreground mb-4">{formatDate(currentTime)}</p>
        
        {/* Current Time Display */}
        <div className="bg-card rounded-lg p-6 mb-4 shadow-sm border">
          <div className="text-4xl font-mono font-bold text-primary">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>

      {/* Alarms List */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Alarms</h2>
          <Link to="/set-alarm">
            <Button size="sm" className="flex items-center gap-2">
              <Plus size={16} />
              Add Alarm
            </Button>
          </Link>
        </div>

        {alarms.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No alarms set</h3>
            <p className="text-muted-foreground mb-4">
              Create your first alarm to get started with your workout routine.
            </p>
            <Link to="/set-alarm">
              <Button>
                <Plus size={16} className="mr-2" />
                Create Alarm
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {alarms.map((alarm) => (
              <Card key={alarm.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-mono font-bold text-primary">
                        {alarm.time}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {alarm.pushups} pushups
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">
                        {alarm.name || `Alarm ${alarm.time}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Complete {alarm.pushups} pushups to dismiss
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant={alarm.enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAlarm(alarm.id)}
                    >
                      {alarm.enabled ? "ON" : "OFF"}
                    </Button>
                    
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/set-alarm?edit=${alarm.id}`}>
                        <Edit size={16} />
                      </Link>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlarm(alarm.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Test Button */}
        <div className="mt-6 text-center">
          <Link to="/alarm-active">
            <Button variant="outline" className="flex items-center gap-2">
              <Play size={16} />
              Test Alarm (Demo)
            </Button>
          </Link>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Dashboard;