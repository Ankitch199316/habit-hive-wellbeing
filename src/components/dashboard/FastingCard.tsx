
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";

interface FastingCardProps {
  isFasting: boolean;
  startTime?: Date;
  endTime?: Date;
  targetHours: number;
  currentStreak: number;
}

const FastingCard: React.FC<FastingCardProps> = ({ 
  isFasting, 
  startTime, 
  endTime, 
  targetHours, 
  currentStreak 
}) => {
  const [elapsedTime, setElapsedTime] = React.useState<string>("0:00");
  const [progress, setProgress] = React.useState<number>(0);
  
  React.useEffect(() => {
    if (!isFasting || !startTime) return;
    
    const intervalId = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - startTime.getTime();
      const elapsedHours = Math.floor(elapsed / (1000 * 60 * 60));
      const elapsedMinutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      
      setElapsedTime(`${elapsedHours}:${elapsedMinutes.toString().padStart(2, '0')}`);
      
      // Calculate progress as percentage of target hours
      const progressPercentage = Math.min((elapsed / (targetHours * 3600 * 1000)) * 100, 100);
      setProgress(progressPercentage);
    }, 60000); // Update every minute
    
    // Initial calculation
    const elapsed = new Date().getTime() - startTime.getTime();
    const elapsedHours = Math.floor(elapsed / (1000 * 60 * 60));
    const elapsedMinutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    
    setElapsedTime(`${elapsedHours}:${elapsedMinutes.toString().padStart(2, '0')}`);
    setProgress(Math.min((elapsed / (targetHours * 3600 * 1000)) * 100, 100));
    
    return () => clearInterval(intervalId);
  }, [isFasting, startTime, targetHours]);
  
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Fasting Timer</span>
          <Timer className="text-accent" size={20} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isFasting ? (
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto my-2">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-muted opacity-20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * progress) / 100}
                  strokeLinecap="round"
                  className="text-accent transform -rotate-90 origin-center transition-all duration-1000"
                />
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-2xl font-bold"
                  fill="currentColor"
                >
                  {elapsedTime}
                </text>
              </svg>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Target: {targetHours} hours
            </p>
            <p className="text-xs font-medium">
              Current streak: {currentStreak} days
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No active fast</p>
            <button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 py-2 mt-3 transition-colors">
              Start Fast
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FastingCard;
