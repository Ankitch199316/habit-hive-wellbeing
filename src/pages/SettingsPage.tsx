
import React, { useState, useEffect } from "react";
import MobileContainer from "@/components/layout/MobileContainer";
import BottomNav from "@/components/navigation/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserSettings, getSettings, saveSettings } from "@/utils/storage";
import { useToast } from "@/components/ui/use-toast";
import { UserCog, TimerReset, Goal, Database, BellRing } from "lucide-react";

const SettingsPage = () => {
  const [settings, setSettings] = useState<UserSettings>({
    dailyCalorieGoal: 2000,
    targetActiveMinutes: 30,
    fastingSchedule: {
      targetHours: 16,
    }
  });
  
  const { toast } = useToast();
  
  useEffect(() => {
    // Load settings
    const userSettings = getSettings();
    setSettings(userSettings);
  }, []);
  
  const handleSettingsChange = (settingPath: string, value: any) => {
    // Create a deep copy of the settings object
    const updatedSettings = JSON.parse(JSON.stringify(settings));
    
    // Update the nested property
    const pathParts = settingPath.split(".");
    let current: any = updatedSettings;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
    
    // Update state and save to storage
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };
  
  const handleSaveSettings = () => {
    saveSettings(settings);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };
  
  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your experience</p>
        </header>
        
        <Tabs defaultValue="goals">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="goals">
              <Goal size={16} className="mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="fasting">
              <TimerReset size={16} className="mr-2" />
              Fasting
            </TabsTrigger>
            <TabsTrigger value="data">
              <Database size={16} className="mr-2" />
              Data
            </TabsTrigger>
          </TabsList>
          
          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Targets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="calorieGoal">Daily Calorie Goal</Label>
                    <span className="text-sm font-medium">{settings.dailyCalorieGoal} kcal</span>
                  </div>
                  <Slider
                    id="calorieGoal"
                    min={1200}
                    max={4000}
                    step={50}
                    value={[settings.dailyCalorieGoal]}
                    onValueChange={(value) => handleSettingsChange("dailyCalorieGoal", value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1200</span>
                    <span>2000</span>
                    <span>3000</span>
                    <span>4000</span>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between">
                    <Label htmlFor="activeMinutes">Active Minutes Goal</Label>
                    <span className="text-sm font-medium">{settings.targetActiveMinutes} minutes</span>
                  </div>
                  <Slider
                    id="activeMinutes"
                    min={10}
                    max={120}
                    step={5}
                    value={[settings.targetActiveMinutes]}
                    onValueChange={(value) => handleSettingsChange("targetActiveMinutes", value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>10</span>
                    <span>30</span>
                    <span>60</span>
                    <span>120</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Fasting Tab */}
          <TabsContent value="fasting" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fasting Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="fastingHours">Default Fasting Duration</Label>
                    <span className="text-sm font-medium">{settings.fastingSchedule.targetHours} hours</span>
                  </div>
                  <Slider
                    id="fastingHours"
                    min={12}
                    max={24}
                    step={1}
                    value={[settings.fastingSchedule.targetHours]}
                    onValueChange={(value) => handleSettingsChange("fastingSchedule.targetHours", value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>12h</span>
                    <span>16h</span>
                    <span>20h</span>
                    <span>24h</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="notifications" defaultChecked />
                    <Label htmlFor="notifications">Fasting Reminders</Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Receive notifications for fasting start/end times</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <div>
                    <h3 className="font-medium">Export Your Data</h3>
                    <p className="text-sm text-muted-foreground">Download all your tracking history</p>
                  </div>
                  <Button variant="outline" size="sm">Export</Button>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <div>
                    <h3 className="font-medium">Clear All Data</h3>
                    <p className="text-sm text-muted-foreground">Remove all saved information</p>
                  </div>
                  <Button variant="destructive" size="sm">Clear</Button>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="healthKit" defaultChecked />
                    <Label htmlFor="healthKit">Apple HealthKit Sync</Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Connect to Apple Health for activity data</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Habit Hive is your personal health tracking companion, designed to help you build and maintain healthy habits.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Version 1.0.0
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8">
          <Button 
            onClick={handleSaveSettings}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Save Settings
          </Button>
        </div>
      </div>
      
      <BottomNav />
    </MobileContainer>
  );
};

export default SettingsPage;
