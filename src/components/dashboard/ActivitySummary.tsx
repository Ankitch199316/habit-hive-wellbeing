
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivitySquare } from "lucide-react";

interface ActivityProps {
  activeMinutes: number;
  steps: number;
  workouts: number;
  targetActiveMinutes: number;
}

const ActivitySummary: React.FC<ActivityProps> = ({ activeMinutes, steps, workouts, targetActiveMinutes }) => {
  const progress = Math.min((activeMinutes / targetActiveMinutes) * 100, 100);
  
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Activity</span>
          <ActivitySquare className="text-teal-500" size={20} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-teal-500 rounded-full transition-all duration-1000 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Active Minutes</p>
              <p className="font-medium">{activeMinutes} / {targetActiveMinutes}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Steps</p>
              <p className="font-medium">{steps.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Workouts</p>
              <p className="font-medium">{workouts}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivitySummary;
