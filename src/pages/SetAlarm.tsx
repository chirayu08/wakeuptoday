import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlideToggle } from "@/components/ui/slide-toggle";
import { ArrowLeft, Save, Clock } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";

const SetAlarm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditing = searchParams.get('edit');

  const [formData, setFormData] = useState({
    name: "",
    time: "",
    pushups: 5,
    enabled: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.time) {
      toast({
        title: "Invalid time",
        description: "Please select a valid time for your alarm.",
        variant: "destructive"
      });
      return;
    }

    if (formData.pushups < 1 || formData.pushups > 100) {
      toast({
        title: "Invalid pushup count",
        description: "Please enter a number between 1 and 100.",
        variant: "destructive"
      });
      return;
    }

    // Here you would save to Supabase
    console.log("Saving alarm:", formData);
    
    toast({
      title: "Alarm saved!",
      description: `Your alarm has been set for ${formData.time} with ${formData.pushups} pushups.`
    });

    navigate("/");
  };

  const pushupPresets = [5, 10, 15, 20, 25, 30];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm border-b border-primary/20 p-4 z-40">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="rounded-full h-10 w-10 p-0">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold text-primary">
            {isEditing ? "✏️ Edit Alarm" : "⏰ Set New Alarm"}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="p-4">
        <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Alarm Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-lg font-semibold">Alarm Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Morning Workout 💪"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="h-12 text-lg rounded-2xl border-2 focus:border-primary transition-all duration-300"
              />
            </div>

            {/* Time Selection */}
            <div className="space-y-3">
              <Label htmlFor="time" className="text-lg font-semibold">Alarm Time</Label>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-2xl border-2 border-primary/20">
                <Clock size={24} className="text-primary" />
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="font-mono text-2xl border-0 bg-transparent focus:ring-0 p-0"
                  required
                />
              </div>
            </div>

            {/* Pushup Count */}
            <div className="space-y-4">
              <Label htmlFor="pushups" className="text-lg font-semibold">Number of Pushups</Label>
              
              {/* Interactive Counter */}
              <div className="flex items-center justify-center space-x-4 p-4 bg-muted/50 rounded-2xl">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setFormData({...formData, pushups: Math.max(1, formData.pushups - 1)})}
                  className="h-12 w-12 rounded-full border-2 border-primary/30 hover:bg-primary/10 transition-all duration-300"
                >
                  <span className="text-xl font-bold">-</span>
                </Button>
                
                <div className="bg-primary/10 rounded-3xl px-8 py-4 min-w-24 text-center border-2 border-primary/30">
                  <span className="text-3xl font-bold text-primary">{formData.pushups}</span>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setFormData({...formData, pushups: Math.min(100, formData.pushups + 1)})}
                  className="h-12 w-12 rounded-full border-2 border-primary/30 hover:bg-primary/10 transition-all duration-300"
                >
                  <span className="text-xl font-bold">+</span>
                </Button>
              </div>
              
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2 justify-center">
                {pushupPresets.map((count) => (
                  <Button
                    key={count}
                    type="button"
                    variant={formData.pushups === count ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({...formData, pushups: count})}
                    className="rounded-full font-semibold transition-all duration-300 hover:scale-105"
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-6 bg-muted/30 rounded-2xl border-2 border-primary/20">
              <div>
                <Label htmlFor="enabled" className="text-lg font-semibold">Enable Alarm</Label>
                <p className="text-sm text-muted-foreground">Turn this alarm on or off</p>
              </div>
              <SlideToggle
                checked={formData.enabled}
                onCheckedChange={(enabled) => setFormData({...formData, enabled})}
              />
            </div>

            {/* Preview */}
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 border-2">
              <h3 className="font-bold mb-3 text-lg text-primary">📱 Alarm Preview</h3>
              <div className="space-y-2 text-foreground">
                <p className="flex justify-between">
                  <span className="font-medium">⏰ Time:</span> 
                  <span className="font-mono text-lg">{formData.time || "Not set"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">📛 Name:</span> 
                  <span>{formData.name || `Alarm ${formData.time}`}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">💪 Pushups:</span> 
                  <span className="font-bold text-primary">{formData.pushups}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">🔔 Status:</span> 
                  <span className={formData.enabled ? "text-ios-green font-bold" : "text-ios-gray"}>
                    {formData.enabled ? "ENABLED" : "DISABLED"}
                  </span>
                </p>
              </div>
            </Card>

            {/* Save Button */}
            <Button 
              type="submit" 
              className="w-full h-16 text-xl font-bold rounded-2xl bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02] shadow-lg" 
              size="lg"
            >
              <Save size={24} className="mr-3" />
              {isEditing ? "💾 Update Alarm" : "✅ Save Alarm"}
            </Button>
          </form>
        </Card>

        {/* Instructions */}
        <Card className="p-6 mt-6 bg-gradient-to-r from-accent/10 to-success/10 border-2 border-accent/30">
          <h3 className="font-bold mb-3 text-lg text-primary">🔥 How it works</h3>
          <ul className="space-y-2 text-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Set your desired wake-up time and pushup count</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>When the alarm goes off, you'll need to complete the pushups</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Use your device's camera to track your pushup form</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span className="font-semibold text-primary">The alarm won't stop until you complete all pushups! 💪</span>
            </li>
          </ul>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default SetAlarm;