import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    pushups: 20,
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

  const pushupPresets = [10, 15, 20, 25, 30, 50];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 z-40">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-semibold">
            {isEditing ? "Edit Alarm" : "Set New Alarm"}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="p-4">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alarm Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Alarm Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Morning Workout"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="time">Alarm Time</Label>
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="font-mono text-lg"
                  required
                />
              </div>
            </div>

            {/* Pushup Count */}
            <div className="space-y-3">
              <Label htmlFor="pushups">Number of Pushups</Label>
              <Input
                id="pushups"
                type="number"
                min="1"
                max="100"
                value={formData.pushups}
                onChange={(e) => setFormData({...formData, pushups: parseInt(e.target.value) || 1})}
                className="font-mono text-lg"
              />
              
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2">
                {pushupPresets.map((count) => (
                  <Button
                    key={count}
                    type="button"
                    variant={formData.pushups === count ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({...formData, pushups: count})}
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h3 className="font-medium mb-2">Alarm Preview</h3>
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Time:</strong> {formData.time || "Not set"}
                </p>
                <p>
                  <strong>Name:</strong> {formData.name || `Alarm ${formData.time}`}
                </p>
                <p>
                  <strong>Pushups required:</strong> {formData.pushups}
                </p>
              </div>
            </Card>

            {/* Save Button */}
            <Button type="submit" className="w-full" size="lg">
              <Save size={20} className="mr-2" />
              {isEditing ? "Update Alarm" : "Save Alarm"}
            </Button>
          </form>
        </Card>

        {/* Instructions */}
        <Card className="p-4 mt-4 bg-muted/30">
          <h3 className="font-medium mb-2">How it works</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Set your desired wake-up time and pushup count</li>
            <li>• When the alarm goes off, you'll need to complete the pushups</li>
            <li>• Use your device's camera to track your pushup form</li>
            <li>• The alarm won't stop until you complete all pushups!</li>
          </ul>
        </Card>
      </div>

      <Navigation />
    </div>
  );
};

export default SetAlarm;