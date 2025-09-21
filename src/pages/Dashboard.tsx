import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlideToggle } from "@/components/ui/slide-toggle";
import { Plus, Clock, Trash2, Edit, Play } from "lucide-react";
import Navigation from "@/components/Navigation";
import { getAlarms, updateAlarm, deleteAlarm as deleteAlarmDb, Alarm } from "@/lib/database";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadAlarms();
  }, []);

  const loadAlarms = async () => {
    try {
      const data = await getAlarms();
      setAlarms(data);
    } catch (error) {
      console.error('Error loading alarms:', error);
      toast({
        title: "Error",
        description: "Failed to load alarms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAlarm = async (id: string) => {
    try {
      const alarm = alarms.find(a => a.id === id);
      if (!alarm) return;
      
      await updateAlarm(id, { enabled: !alarm.enabled });
      setAlarms(alarms.map(alarm => 
        alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
      ));
      
      toast({
        title: "Alarm updated!",
        description: `Alarm ${alarm.enabled ? 'disabled' : 'enabled'}.`
      });
    } catch (error) {
      console.error('Error updating alarm:', error);
      toast({
        title: "Error",
        description: "Failed to update alarm. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteAlarm = async (id: string) => {
    try {
      await deleteAlarmDb(id);
      setAlarms(alarms.filter(alarm => alarm.id !== id));
      
      toast({
        title: "Alarm deleted!",
        description: "Your alarm has been removed."
      });
    } catch (error) {
      console.error('Error deleting alarm:', error);
      toast({
        title: "Error",
        description: "Failed to delete alarm. Please try again.",
        variant: "destructive"
      });
    }
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
      <div className="p-4 text-center bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <h1 className="text-3xl font-bold text-primary mb-2">⏰ WakeUp Now</h1>
        <p className="text-muted-foreground mb-4">{formatDate(currentTime)}</p>
        
        {/* Current Time Display */}
        <div className="bg-gradient-to-r from-card to-primary/5 rounded-3xl p-8 mb-4 shadow-lg border-2 border-primary/20">
          <div className="text-5xl font-mono font-bold text-primary mb-2">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-muted-foreground">Current Time</div>
        </div>
      </div>

      {/* Alarms List */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">🔔 Your Alarms</h2>
          <Link to="/set-alarm">
            <Button size="lg" className="flex items-center gap-2 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
              <Plus size={18} />
              Add Alarm
            </Button>
          </Link>
        </div>

        {loading ? (
          <Card className="p-10 text-center bg-gradient-to-br from-muted/50 to-primary/5 border-2 border-primary/20">
            <div className="text-lg text-primary">Loading alarms...</div>
          </Card>
        ) : alarms.length === 0 ? (
          <Card className="p-10 text-center bg-gradient-to-br from-muted/50 to-primary/5 border-2 border-primary/20">
            <Clock size={64} className="mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2 text-primary">No alarms set</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Create your first alarm to get started with your workout routine! 💪
            </p>
            <Link to="/set-alarm">
              <Button size="lg" className="rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
                <Plus size={18} className="mr-2" />
                Create Your First Alarm
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {alarms.map((alarm) => (
              <Card key={alarm.id} className="p-6 bg-gradient-to-r from-card to-primary/5 border-2 border-primary/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="text-center bg-primary/10 rounded-2xl p-4 border-2 border-primary/30">
                      <div className="text-3xl font-mono font-bold text-primary">
                        {alarm.time}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        {alarm.pushups} pushups 💪
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg text-primary">
                        {alarm.name || `⏰ Alarm ${alarm.time}`}
                      </h3>
                      <p className="text-muted-foreground">
                        Complete {alarm.pushups} pushups to dismiss
                      </p>
                      <p className={`text-sm font-semibold ${alarm.enabled ? 'text-ios-green' : 'text-ios-gray'}`}>
                        {alarm.enabled ? '🟢 ACTIVE' : '🔴 INACTIVE'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <SlideToggle
                      checked={alarm.enabled}
                      onCheckedChange={() => toggleAlarm(alarm.id)}
                    />
                    
                    <Button variant="ghost" size="sm" asChild className="rounded-full h-10 w-10 p-0 hover:bg-primary/10">
                      <Link to={`/set-alarm?edit=${alarm.id}`}>
                        <Edit size={18} />
                      </Link>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlarm(alarm.id)}
                      className="rounded-full h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Test Button */}
        <div className="mt-8 text-center">
          <div className="flex gap-3 justify-center">
            <Link to="/alarm-active">
              <Button variant="outline" className="flex items-center gap-2 rounded-2xl font-semibold h-12 px-6 border-2 border-primary/30 hover:bg-primary/10 transition-all duration-300 hover:scale-105">
                <Play size={18} />
                🚀 Test Alarm (Demo)
              </Button>
            </Link>
            <Link to="/supabase-test">
              <Button variant="outline" className="flex items-center gap-2 rounded-2xl font-semibold h-12 px-6 border-2 border-accent/30 hover:bg-accent/10 transition-all duration-300 hover:scale-105">
                🔍 Verify Supabase
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Dashboard;