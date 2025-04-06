
import React from "react";
import { Home, Utensils, Timer, ActivitySquare, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Utensils, label: "Meals", path: "/meals" },
  { icon: Timer, label: "Fasting", path: "/fasting" },
  { icon: ActivitySquare, label: "Activity", path: "/activity" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="mt-auto bg-card border-t border-border">
      <div className="flex justify-between px-2">
        {navItems.map((item) => {
          const isActive = item.path === location.pathname;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-3 px-4 transition-all ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon size={20} className={isActive ? "animate-pulse-slow" : ""} />
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
