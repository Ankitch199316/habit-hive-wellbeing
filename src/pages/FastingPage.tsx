
import React, { useState, useEffect } from "react";
import MobileContainer from "@/components/layout/MobileContainer";
import BottomNav from "@/components/navigation/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  FastingSession, 
  getFastingSessions, 
  getCurrentFastingSession,
  getFastingStreak,
  startFasting,
  endFasting,
  getSettings,
  saveSettings
} from "@/utils/storage";
import { Timer, Play, Square, History, Award, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const FastingPage = () => {
  const [activeFast, setActiveFast] = useState<FastingSession | null>(null);
  const [fastingStreak, setFastingStreak] = useState(0);
  const [fastHistory, setFastHistory] = useState<FastingSession[]>([]);
  const [targetHours, setTargetHours] = useState(16);
  const [elapsedTime, setElapsedTime] = useState<{
    hours: number;
    minutes: number;
    percentage: number;
  }>({ hours: 0, minutes: 0, percentage: 0 });
  
  const { toast } = useToast();
  
  useEffect(() => {
    // Load fasting data
    const currentFast = getCurrentFastingSession();
    const streak = getFastingStreak();
    const history = getFastingSessions()
      .filter(session => session.completed)
      .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime());
    
    const settings = getSettings();
    
    setActiveFast(currentFast);
    setFastingStreak(streak);
    setFastHistory(history);
    setTargetHours(settings.fastingSchedule.targetHours);
  }, []);
  
  useEffect(() => {
    if (!activeFast) return;
    
    const calculateElapsed = () => {
      if (!activeFast) return;
      
      const now = new Date();
      const start = new Date(activeFast.startTime);
      const elapsedMs = now.getTime() - start.getTime();
      const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
      const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
      const percentage = Math.min((elapsedMs / (activeFast.targetHours * 60 * 60 * 1000)) * 100, 100);
      
      setElapsedTime({
        hours: elapsedHours,
        minutes: elapsedMinutes,
        percentage
      });
    };
    
    // Initial calculation
    calculateElapsed();
    
    // Update timer every minute
    const timerInterval = setInterval(calculateElapsed, 60000);
    
    return () => clearInterval(timerInterval);
  }, [activeFast]);
  
  const handleStartFast = () => {
    const newFast = startFasting(targetHours);
    setActiveFast(newFast);
    
    toast({
      title: "Fasting started",
      description: `Target: ${targetHours} hours. You can do this!`,
    });
    
    // Update settings if target hours changed
    const settings = getSettings();
    if (settings.fastingSchedule.targetHours !== targetHours) {
      saveSettings({
        fastingSchedule: {
          ...settings.fastingSchedule,
          targetHours
        }
      });
    }
  };
  
  const handleEndFast = () => {
    if (!activeFast) return;
    
    const completedFast = endFasting(activeFast.id);
    if (completedFast) {
      setActiveFast(null);
      setFastHistory([completedFast, ...fastHistory]);
      setFastingStreak(getFastingStreak());
      
      toast({
        title: "Fasting completed",
        description: `Great job! Your current streak is ${fastingStreak + 1} days.`,
      });
    }
  };
  
  // Format time display
  const formatTimeDisplay = (hours: number, minutes: number) => {
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };
  
  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Fasting Timer</h1>
          <p className="text-muted-foreground">Track your intermittent fasting</p>
        </header>
        
        {/* Main Timer */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              {activeFast ? (
                <>
                  <div className="relative w-48 h-48 mx-auto my-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-muted opacity-20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * elapsedTime.percentage) / 100}
                        strokeLinecap="round"
                        className="text-accent transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <div className="text-3xl font-bold">
                        {formatTimeDisplay(elapsedTime.hours, elapsedTime.minutes)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        of {targetHours}:00
                      </div>
                      <div className="text-sm font-medium mt-1">
                        {Math.round(elapsedTime.percentage)}%
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleEndFast}
                    className="bg-destructive hover:bg-destructive/90 mt-4"
                  >
                    <Square size={16} className="mr-2" />
                    End Fast
                  </Button>
                </>
              ) : (
                <div className="py-8">
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-3">Set fasting duration</h3>
                    <div className="flex justify-center items-center gap-4">
                      <span className="font-medium text-lg">{targetHours} hours</span>
                      <Slider
                        value={[targetHours]}
                        min={12}
                        max={24}
                        step={1}
                        onValueChange={(value) => setTargetHours(value[0])}
                        className="max-w-[220px]"
                      />
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>12h</span>
                      <span className="flex-1"></span>
                      <span>16h</span>
                      <span className="flex-1"></span>
                      <span>20h</span>
                      <span className="flex-1"></span>
                      <span>24h</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleStartFast}
                    className="bg-accent hover:bg-accent/90"
                  >
                    <Play size={16} className="mr-2" />
                    Start Fasting
                  </Button>
                </div>
              )}
              
              <div className="flex justify-center items-center mt-6 gap-2">
                <Award size={18} className="text-honey-500" />
                <span className="font-medium">Current streak: {fastingStreak} days</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* History and Stats */}
        <Tabs defaultValue="history">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="history">
              <History size={16} className="mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Calendar size={16} className="mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <div className="space-y-3">
              {fastHistory.length > 0 ? (
                fastHistory.map((fast) => (
                  <FastHistoryCard key={fast.id} fast={fast} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No fasting history yet</p>
                  <p className="text-sm">Start a new fast to build your record</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="grid grid-cols-2 gap-4">
              <StatsCard title="Current Streak" value={`${fastingStreak} days`} icon={<Award className="text-honey-500" />} />
              <StatsCard title="Completed Fasts" value={`${fastHistory.length}`} icon={<Timer className="text-accent" />} />
              
              <StatsCard 
                title="Success Rate" 
                value={`${calculateSuccessRate(fastHistory)}%`} 
                icon={<div className="text-lg">📊</div>} 
              />
              
              <StatsCard 
                title="Longest Fast" 
                value={`${calculateLongestFast(fastHistory)} hrs`}
                icon={<div className="text-lg">🏆</div>}  
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNav />
    </MobileContainer>
  );
};

// Helper component for fasting history card
const FastHistoryCard = ({ fast }: { fast: FastingSession }) => {
  const startDate = new Date(fast.startTime);
  const endDate = new Date(fast.endTime!);
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const successRate = fast.targetHours > 0 
    ? Math.min(Math.round((durationHours / fast.targetHours) * 100), 100)
    : 0;
  
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            successRate >= 95 ? "bg-teal-100 text-teal-700" :
            successRate >= 75 ? "bg-honey-100 text-honey-700" :
            "bg-muted text-muted-foreground"
          }`}>
            <span className="text-sm font-medium">{successRate}%</span>
          </div>
          
          <div>
            <div className="font-medium">
              {durationHours}h {durationMinutes}m
            </div>
            <div className="text-sm text-muted-foreground">
              {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium">Target</div>
          <div>{fast.targetHours}h</div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper component for stats card
const StatsCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <Card className="border-none shadow-sm">
    <CardContent className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm text-muted-foreground">{title}</h3>
        <div>{icon}</div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

// Helper functions for statistics
const calculateSuccessRate = (fastHistory: FastingSession[]): number => {
  if (fastHistory.length === 0) return 0;
  
  const successfulFasts = fastHistory.filter(fast => {
    if (!fast.endTime) return false;
    
    const startDate = new Date(fast.startTime);
    const endDate = new Date(fast.endTime);
    const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    
    return durationHours >= (fast.targetHours * 0.9); // 90% of target is considered successful
  });
  
  return Math.round((successfulFasts.length / fastHistory.length) * 100);
};

const calculateLongestFast = (fastHistory: FastingSession[]): number => {
  if (fastHistory.length === 0) return 0;
  
  return fastHistory.reduce((longest, fast) => {
    if (!fast.endTime) return longest;
    
    const startDate = new Date(fast.startTime);
    const endDate = new Date(fast.endTime);
    const durationHours = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
    
    return Math.max(longest, durationHours);
  }, 0);
};

export default FastingPage;
