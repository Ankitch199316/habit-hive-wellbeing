
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils } from "lucide-react";

export interface Meal {
  id: string;
  name: string;
  calories: number;
  time: Date;
  type: "breakfast" | "lunch" | "dinner" | "snack";
}

interface MealSummaryProps {
  meals: Meal[];
  onAddMeal: () => void;
}

const MealSummary: React.FC<MealSummaryProps> = ({ meals, onAddMeal }) => {
  // Group meals by type
  const groupedMeals: Record<string, Meal[]> = meals.reduce((groups, meal) => {
    if (!groups[meal.type]) {
      groups[meal.type] = [];
    }
    groups[meal.type].push(meal);
    return groups;
  }, {} as Record<string, Meal[]>);
  
  // Order of meal types
  const mealTypeOrder = ["breakfast", "lunch", "dinner", "snack"];
  
  // Total calories for the day
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Today's Meals</span>
          <Utensils className="text-honey-600" size={20} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mealTypeOrder.map(type => {
            const typeMeals = groupedMeals[type] || [];
            if (typeMeals.length === 0) return null;
            
            return (
              <div key={type} className="border-l-2 border-honey-300 pl-3">
                <p className="text-sm font-medium capitalize">{type}</p>
                {typeMeals.map(meal => (
                  <div key={meal.id} className="flex justify-between items-center mt-1 text-sm">
                    <span className="text-muted-foreground">{meal.name}</span>
                    <span>{meal.calories} kcal</span>
                  </div>
                ))}
              </div>
            );
          })}
          
          {meals.length === 0 && (
            <div className="text-center py-3 text-muted-foreground text-sm">
              No meals logged today
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-medium">Total</span>
            <span className="font-bold">{totalCalories} kcal</span>
          </div>
          
          <button 
            onClick={onAddMeal}
            className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg transition-colors font-medium flex items-center justify-center"
          >
            <span>+ Add Meal</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealSummary;
