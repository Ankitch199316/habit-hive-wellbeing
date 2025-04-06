
import React, { useState, useEffect } from "react";
import MobileContainer from "@/components/layout/MobileContainer";
import BottomNav from "@/components/navigation/BottomNav";
import MealForm from "@/components/meals/MealForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Trash2 } from "lucide-react";
import { Meal, getMealsByDate, saveMeal, deleteMeal } from "@/utils/storage";
import { useToast } from "@/components/ui/use-toast";

const MealsPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showMealForm, setShowMealForm] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    loadMeals(selectedDate);
  }, [selectedDate]);
  
  const loadMeals = (date: Date) => {
    const dateMeals = getMealsByDate(date);
    setMeals(dateMeals);
  };
  
  const handleAddMeal = (mealData: {
    name: string;
    calories: number;
    type: "breakfast" | "lunch" | "dinner" | "snack";
  }) => {
    const newMeal = saveMeal(mealData);
    setMeals([...meals, newMeal]);
    setShowMealForm(false);
    
    toast({
      title: "Meal added",
      description: `${mealData.name} (${mealData.calories} kcal) added successfully.`,
    });
  };
  
  const handleDeleteMeal = (id: string) => {
    deleteMeal(id);
    setMeals(meals.filter(meal => meal.id !== id));
    
    toast({
      title: "Meal deleted",
      description: "Meal has been removed from your log.",
    });
  };
  
  // Group meals by type
  const getMealsByType = (type: string) => {
    return meals.filter(meal => meal.type === type);
  };
  
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Meals Log</h1>
          <p className="text-muted-foreground">
            {isToday(selectedDate) ? "Today" : formatDate(selectedDate)}
          </p>
        </header>
        
        <div className="mb-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>
        
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">
            {totalCalories > 0 ? `${totalCalories} calories` : 'No meals logged'}
          </h2>
          <Button onClick={() => setShowMealForm(true)} size="sm" className="bg-primary hover:bg-primary/90">
            <Plus size={16} className="mr-1" /> Add Meal
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
            <TabsTrigger value="lunch">Lunch</TabsTrigger>
            <TabsTrigger value="dinner">Dinner</TabsTrigger>
            <TabsTrigger value="snack">Snack</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3">
            {meals.length > 0 ? (
              meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
              ))
            ) : (
              <EmptyState />
            )}
          </TabsContent>
          
          {["breakfast", "lunch", "dinner", "snack"].map((type) => (
            <TabsContent key={type} value={type} className="space-y-3">
              {getMealsByType(type).length > 0 ? (
                getMealsByType(type).map((meal) => (
                  <MealCard key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
                ))
              ) : (
                <EmptyState type={type} />
              )}
            </TabsContent>
          ))}
        </Tabs>
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

// Helper component for empty state
const EmptyState = ({ type }: { type?: string }) => (
  <div className="text-center py-8">
    <p className="text-muted-foreground mb-2">
      {type ? `No ${type} meals logged` : 'No meals logged for this day'}
    </p>
  </div>
);

// Meal card component
const MealCard = ({ meal, onDelete }: { meal: Meal; onDelete: (id: string) => void }) => {
  return (
    <Card className="border-l-4" style={{ borderLeftColor: getMealTypeColor(meal.type) }}>
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <h3 className="font-medium">{meal.name}</h3>
          <div className="flex text-sm text-muted-foreground space-x-2">
            <span className="capitalize">{meal.type}</span>
            <span>•</span>
            <span>{formatTime(meal.time)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="font-medium">{meal.calories} kcal</span>
          <Button variant="ghost" size="icon" onClick={() => onDelete(meal.id)} className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10">
            <Trash2 size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions
const getMealTypeColor = (type: string): string => {
  switch (type) {
    case "breakfast": return "#FFB300";
    case "lunch": return "#26A69A";
    case "dinner": return "#FF8F00";
    case "snack": return "#66BB6A";
    default: return "#9E9E9E";
  }
};

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default MealsPage;
