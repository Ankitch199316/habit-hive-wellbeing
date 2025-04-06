
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface CalorieCardProps {
  consumed: number;
  burned: number;
  goal: number;
}

const CalorieCard: React.FC<CalorieCardProps> = ({ consumed, burned, goal }) => {
  const netCalories = consumed - burned;
  const progress = Math.min(Math.max((netCalories / goal) * 100, 0), 100);
  
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Calorie Balance</span>
          <Flame className="text-honey-500" size={20} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-3xl font-bold">{netCalories}</span>
            <span className="text-sm text-muted-foreground">of {goal} kcal</span>
          </div>
          
          <Progress value={progress} className="h-2 animate-progress-fill" />
          
          <div className="flex justify-between mt-4">
            <div className="flex items-center">
              <ArrowDownRight className="text-teal-500 mr-1" size={18} />
              <div>
                <p className="text-xs text-muted-foreground">Consumed</p>
                <p className="font-medium">{consumed} kcal</p>
              </div>
            </div>
            <div className="flex items-center">
              <ArrowUpRight className="text-honey-600 mr-1" size={18} />
              <div>
                <p className="text-xs text-muted-foreground">Burned</p>
                <p className="font-medium">{burned} kcal</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalorieCard;
