
import React, { useEffect, useState } from "react";
import MobileContainer from "@/components/layout/MobileContainer";
import BottomNav from "@/components/navigation/BottomNav";
import CalorieCard from "@/components/dashboard/CalorieCard";
import FastingCard from "@/components/dashboard/FastingCard";
import ActivitySummary from "@/components/dashboard/ActivitySummary";
import MealSummary from "@/components/dashboard/MealSummary";
import MealForm from "@/components/meals/MealForm";
import { 
  Meal, 
  getMealsByDate, 
  saveMeal, 
  getSettings, 
  getTodayActivity, 
  getCurrentFastingSession,
  getFastingStreak,
  initializeDemoData
} from "@/utils/storage";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [targetCalories, setTargetCalories] = useState(2000);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [steps, setSteps] = useState(0);
  const [workouts, setWorkouts] = useState(0);
  const [targetActiveMinutes, setTargetActiveMinutes] = useState(30);
  const [fastingSession, setFastingSession] = useState<{
    active: boolean;
    startTime?: Date;
    targetHours: number;
    streak: number;
  }>({
    active: false,
    targetHours: 16,
    streak: 0
  });
  
  const [showMealForm, setShowMealForm] = useState(false);
  const { toast } = useToast();
  
  // Initialize data
  useEffect(() => {
    initializeDemoData();
    
    // Load settings
    const settings = getSettings();
    setTargetCalories(settings.dailyCalorieGoal);
    setTargetActiveMinutes(settings.targetActiveMinutes);
    
    // Load today's meals
    const todayMeals = getMealsByDate(new Date());
    setMeals(todayMeals);
    setCaloriesConsumed(todayMeals.reduce((total, meal) => total + meal.calories, 0));
    
    // Load activity data
    const activityData = getTodayActivity();
    setCaloriesBurned(activityData.caloriesBurned);
    setActiveMinutes(activityData.activeMinutes);
    setSteps(activityData.steps);
    setWorkouts(activityData.workouts.length);
    
    // Load fasting data
    const currentFast = getCurrentFastingSession();
    const fastingStreak = getFastingStreak();
    
    setFastingSession({
      active: !!currentFast,
      startTime: currentFast?.startTime,
      targetHours: settings.fastingSchedule.targetHours,
      streak: fastingStreak
    });
  }, []);
  
  const handleAddMeal = (mealData: {
    name: string;
    calories: number;
    type: "breakfast" | "lunch" | "dinner" | "snack";
  }) => {
    const newMeal = saveMeal(mealData);
    setMeals([...meals, newMeal]);
    setCaloriesConsumed(caloriesConsumed + mealData.calories);
    setShowMealForm(false);
    
    toast({
      title: "Meal added",
      description: `${mealData.name} (${mealData.calories} kcal) added successfully.`,
    });
  };
  
  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Habit Hive</h1>
          <p className="text-muted-foreground">Wellness Tracking</p>
        </header>
        
        <div className="space-y-4">
          <CalorieCard 
            consumed={caloriesConsumed} 
            burned={caloriesBurned} 
            goal={targetCalories} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FastingCard 
              isFasting={fastingSession.active}
              startTime={fastingSession.startTime}
              targetHours={fastingSession.targetHours}
              currentStreak={fastingSession.streak}
            />
            
            <ActivitySummary 
              activeMinutes={activeMinutes}
              steps={steps}
              workouts={workouts}
              targetActiveMinutes={targetActiveMinutes}
            />
          </div>
          
          <MealSummary 
            meals={meals} 
            onAddMeal={() => setShowMealForm(true)} 
          />
        </div>
      </div>
      
      <BottomNav />
      
      <MealForm 
        open={showMealForm}
        onClose={() => setShowMealForm(false)}
        onSave={handleAddMeal}
      />
    </MobileContainer>
  );
};

export default Index;
