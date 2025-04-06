
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, Coffee, Apple, Pizza, X } from "lucide-react";

interface MealFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (mealData: {
    name: string;
    calories: number;
    type: "breakfast" | "lunch" | "dinner" | "snack";
  }) => void;
}

const MealForm: React.FC<MealFormProps> = ({ open, onClose, onSave }) => {
  const [name, setName] = React.useState("");
  const [calories, setCalories] = React.useState("");
  const [type, setType] = React.useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && calories) {
      onSave({
        name: name.trim(),
        calories: parseInt(calories, 10),
        type,
      });
      resetForm();
    }
  };

  const resetForm = () => {
    setName("");
    setCalories("");
    setType("breakfast");
  };

  return (
    <Dialog open={open} onOpenChange={() => {
      onClose();
      resetForm();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Add Meal</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="breakfast" value={type} onValueChange={(val) => setType(val as any)}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="breakfast" className="flex flex-col items-center py-2">
                <Coffee size={16} />
                <span className="text-xs mt-1">Breakfast</span>
              </TabsTrigger>
              <TabsTrigger value="lunch" className="flex flex-col items-center py-2">
                <Utensils size={16} />
                <span className="text-xs mt-1">Lunch</span>
              </TabsTrigger>
              <TabsTrigger value="dinner" className="flex flex-col items-center py-2">
                <Pizza size={16} />
                <span className="text-xs mt-1">Dinner</span>
              </TabsTrigger>
              <TabsTrigger value="snack" className="flex flex-col items-center py-2">
                <Apple size={16} />
                <span className="text-xs mt-1">Snack</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="space-y-2">
            <label htmlFor="mealName" className="text-sm font-medium">
              Meal Name
            </label>
            <Input
              id="mealName"
              placeholder="E.g., Chicken Salad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="calories" className="text-sm font-medium">
              Calories (kcal)
            </label>
            <Input
              id="calories"
              type="number"
              placeholder="E.g., 450"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            Save Meal
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MealForm;
