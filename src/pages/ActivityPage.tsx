
import React, { useState, useEffect } from "react";
import MobileContainer from "@/components/layout/MobileContainer";
import BottomNav from "@/components/navigation/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ActivityData, 
  getActivityData, 
  getTodayActivity,
  saveActivityData,
  getSettings
} from "@/utils/storage";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ActivitySquare, Flame, Footprints, Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ActivityPage = () => {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [todayActivity, setTodayActivity] = useState<ActivityData | null>(null);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "workouts" | "trends">("overview");
  const [targetActiveMinutes, setTargetActiveMinutes] = useState(30);
  
  const { toast } = useToast();
  
  useEffect(() => {
    // Load activity data
    const allActivity = getActivityData();
    const today = getTodayActivity();
    const settings = getSettings();
    
    setActivityData(allActivity);
    setTodayActivity(today);
    setTargetActiveMinutes(settings.targetActiveMinutes);
  }, []);
  
  const handleAddWorkout = (workoutData: {
    type: string;
    duration: number;
    caloriesBurned: number;
  }) => {
    if (!todayActivity) return;
    
    const updatedWorkouts = [
      ...todayActivity.workouts,
      workoutData
    ];
    
    const updatedCaloriesBurned = todayActivity.caloriesBurned + workoutData.caloriesBurned;
    const updatedActiveMinutes = todayActivity.activeMinutes + workoutData.duration;
    
    const updatedActivity = saveActivityData({
      workouts: updatedWorkouts,
      caloriesBurned: updatedCaloriesBurned,
      activeMinutes: updatedActiveMinutes
    });
    
    setTodayActivity(updatedActivity);
    
    // Update the activity data array
    const updatedActivityData = activityData.map(activity => {
      const activityDate = new Date(activity.date);
      const todayDate = new Date();
      
      if (
        activityDate.getDate() === todayDate.getDate() &&
        activityDate.getMonth() === todayDate.getMonth() &&
        activityDate.getFullYear() === todayDate.getFullYear()
      ) {
        return updatedActivity;
      }
      
      return activity;
    });
    
    if (!updatedActivityData.some(activity => {
      const activityDate = new Date(activity.date);
      const todayDate = new Date();
      return (
        activityDate.getDate() === todayDate.getDate() &&
        activityDate.getMonth() === todayDate.getMonth() &&
        activityDate.getFullYear() === todayDate.getFullYear()
      );
    })) {
      updatedActivityData.push(updatedActivity);
    }
    
    setActivityData(updatedActivityData);
    setShowWorkoutForm(false);
    
    toast({
      title: "Workout added",
      description: `${workoutData.type} (${workoutData.caloriesBurned} kcal) added successfully.`,
    });
  };
  
  const getChartData = () => {
    // Get the last 7 days of data
    const last7Days = [...activityData]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);
    
    return last7Days.map(day => ({
      date: new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' }),
      calories: day.caloriesBurned,
      activeMinutes: day.activeMinutes,
      steps: day.steps
    }));
  };
  
  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Activity Tracker</h1>
          <p className="text-muted-foreground">Monitor your daily movement</p>
        </header>
        
        {/* Today's Activity Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <ActivityMetricCard 
            title="Calories" 
            value={todayActivity?.caloriesBurned || 0} 
            unit="kcal"
            icon={<Flame className="text-honey-500" />} 
          />
          <ActivityMetricCard 
            title="Active Min" 
            value={todayActivity?.activeMinutes || 0} 
            unit="min"
            target={targetActiveMinutes}
            icon={<ActivitySquare className="text-accent" />} 
          />
          <ActivityMetricCard 
            title="Steps" 
            value={todayActivity?.steps || 0} 
            unit=""
            icon={<Footprints className="text-teal-500" />} 
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">7-Day Activity</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <defs>
                        <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFC107" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#FFC107" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="#FFC107" 
                        fillOpacity={1} 
                        fill="url(#calorieGradient)" 
                        name="Calories Burned"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => setShowWorkoutForm(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus size={16} className="mr-2" />
                Add Workout
              </Button>
            </div>
          </TabsContent>
          
          {/* Workouts Tab */}
          <TabsContent value="workouts" className="space-y-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Today's Workouts</h3>
              <Button 
                size="sm"
                onClick={() => setShowWorkoutForm(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus size={16} className="mr-1" />
                Add
              </Button>
            </div>
            
            {todayActivity && todayActivity.workouts.length > 0 ? (
              <div className="space-y-3">
                {todayActivity.workouts.map((workout, index) => (
                  <WorkoutCard key={index} workout={workout} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-2">No workouts recorded for today</p>
                  <Button 
                    onClick={() => setShowWorkoutForm(true)}
                    className="bg-primary hover:bg-primary/90 mt-2"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Your First Workout
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Active Minutes (Last 7 Days)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <defs>
                        <linearGradient id="activeMinutesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#009688" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#009688" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="activeMinutes" 
                        stroke="#009688" 
                        fillOpacity={1} 
                        fill="url(#activeMinutesGradient)" 
                        name="Active Minutes"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Steps (Last 7 Days)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <defs>
                        <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#26A69A" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#26A69A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="steps" 
                        stroke="#26A69A" 
                        fillOpacity={1} 
                        fill="url(#stepsGradient)" 
                        name="Steps"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNav />
      
      <WorkoutForm 
        open={showWorkoutForm}
        onClose={() => setShowWorkoutForm(false)}
        onSave={handleAddWorkout}
      />
    </MobileContainer>
  );
};

// Helper component for activity metric
const ActivityMetricCard = ({ 
  title, 
  value, 
  unit, 
  icon,
  target
}: { 
  title: string; 
  value: number; 
  unit: string;
  icon: React.ReactNode;
  target?: number;
}) => {
  const progress = target ? Math.min((value / target) * 100, 100) : 100;
  
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs text-muted-foreground">{title}</h3>
          {icon}
        </div>
        <div className="flex items-baseline">
          <span className="text-xl font-bold">{value.toLocaleString()}</span>
          {unit && <span className="text-xs ml-1">{unit}</span>}
        </div>
        
        {target && (
          <div className="mt-2">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs">{Math.round(progress)}%</span>
              <span className="text-xs text-muted-foreground">Goal: {target}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper component for workout card
const WorkoutCard = ({ workout }: { 
  workout: { type: string; duration: number; caloriesBurned: number }
}) => {
  const getWorkoutIcon = (type: string) => {
    // You could return different icons based on workout type
    return <ActivitySquare className="text-accent" />;
  };
  
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-3">
            {getWorkoutIcon(workout.type)}
          </div>
          <div>
            <h4 className="font-medium">{workout.type}</h4>
            <p className="text-sm text-muted-foreground">{workout.duration} minutes</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-medium">{workout.caloriesBurned} kcal</div>
        </div>
      </CardContent>
    </Card>
  );
};

// Workout form component
interface WorkoutFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (workoutData: {
    type: string;
    duration: number;
    caloriesBurned: number;
  }) => void;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ open, onClose, onSave }) => {
  const [workoutType, setWorkoutType] = useState("Walking");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  
  const workoutTypes = ["Walking", "Running", "Cycling", "Swimming", "Weight Training", "Yoga", "HIIT", "Other"];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (workoutType && duration && calories) {
      onSave({
        type: workoutType,
        duration: parseInt(duration, 10),
        caloriesBurned: parseInt(calories, 10)
      });
      
      // Reset form
      setWorkoutType("Walking");
      setDuration("");
      setCalories("");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Add Workout</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="workoutType" className="text-sm font-medium">
              Workout Type
            </label>
            <select
              id="workoutType"
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              className="w-full border border-input rounded-md py-2 px-3 bg-background"
            >
              {workoutTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="duration" className="text-sm font-medium">
              Duration (minutes)
            </label>
            <Input
              id="duration"
              type="number"
              placeholder="E.g., 30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="calories" className="text-sm font-medium">
              Calories Burned
            </label>
            <Input
              id="calories"
              type="number"
              placeholder="E.g., 150"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            Save Workout
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityPage;
