
// Simple local storage management for personal health data

// Type definitions
export interface Meal {
  id: string;
  name: string;
  calories: number;
  time: Date;
  type: "breakfast" | "lunch" | "dinner" | "snack";
}

export interface FastingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  targetHours: number;
  completed: boolean;
}

export interface ActivityData {
  date: Date;
  activeMinutes: number;
  caloriesBurned: number;
  steps: number;
  workouts: {
    type: string;
    duration: number;
    caloriesBurned: number;
  }[];
}

export interface UserSettings {
  dailyCalorieGoal: number;
  targetActiveMinutes: number;
  fastingSchedule: {
    targetHours: number;
    preferredStartTime?: string; // Format: "HH:MM"
  };
}

// Storage keys
const MEALS_KEY = "habit-hive-meals";
const FASTING_KEY = "habit-hive-fasting";
const ACTIVITY_KEY = "habit-hive-activity";
const SETTINGS_KEY = "habit-hive-settings";

// Helper functions to parse and stringify dates in JSON
const parseDate = (dateString: string): Date => new Date(dateString);

const reviver = (key: string, value: any): any => {
  // Convert date strings to Date objects
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
};

// Generic storage methods
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data, reviver) : [];
  } catch (e) {
    console.error(`Error retrieving data for key ${key}:`, e);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving data for key ${key}:`, e);
  }
};

// Meal Storage API
export const getMeals = (): Meal[] => getFromStorage<Meal>(MEALS_KEY);

export const getMealsByDate = (date: Date): Meal[] => {
  const meals = getMeals();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return meals.filter(meal => {
    const mealDate = new Date(meal.time);
    return mealDate >= startOfDay && mealDate <= endOfDay;
  });
};

export const saveMeal = (meal: Omit<Meal, "id" | "time">): Meal => {
  const meals = getMeals();
  const newMeal = {
    ...meal,
    id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    time: new Date()
  };
  
  saveToStorage(MEALS_KEY, [...meals, newMeal]);
  return newMeal;
};

export const deleteMeal = (id: string): void => {
  const meals = getMeals();
  saveToStorage(MEALS_KEY, meals.filter(meal => meal.id !== id));
};

// Fasting Storage API
export const getFastingSessions = (): FastingSession[] => getFromStorage<FastingSession>(FASTING_KEY);

export const getCurrentFastingSession = (): FastingSession | null => {
  const sessions = getFastingSessions();
  return sessions.find(session => !session.completed) || null;
};

export const startFasting = (targetHours: number): FastingSession => {
  const sessions = getFastingSessions();
  
  // End any active sessions
  const updatedSessions = sessions.map(session => 
    !session.completed ? { ...session, completed: true, endTime: new Date() } : session
  );
  
  // Create new session
  const newSession = {
    id: `fast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    startTime: new Date(),
    targetHours,
    completed: false
  };
  
  saveToStorage(FASTING_KEY, [...updatedSessions, newSession]);
  return newSession;
};

export const endFasting = (id: string): FastingSession | null => {
  const sessions = getFastingSessions();
  const sessionIndex = sessions.findIndex(session => session.id === id);
  
  if (sessionIndex === -1) return null;
  
  const updatedSessions = [...sessions];
  updatedSessions[sessionIndex] = {
    ...updatedSessions[sessionIndex],
    endTime: new Date(),
    completed: true
  };
  
  saveToStorage(FASTING_KEY, updatedSessions);
  return updatedSessions[sessionIndex];
};

export const getFastingStreak = (): number => {
  const sessions = getFastingSessions();
  let streak = 0;
  
  // Sort sessions by end time (most recent first)
  const completedSessions = sessions
    .filter(session => session.completed && session.endTime)
    .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime());
  
  if (completedSessions.length === 0) return 0;
  
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const session of completedSessions) {
    const sessionDate = new Date(session.endTime!);
    sessionDate.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff <= 1) { // Current day or yesterday
      streak++;
      currentDate = new Date(sessionDate);
      currentDate.setDate(currentDate.getDate() - 1); // Move to previous day
    } else {
      break; // Streak broken
    }
  }
  
  return streak;
};

// Activity Storage API
export const getActivityData = (): ActivityData[] => getFromStorage<ActivityData>(ACTIVITY_KEY);

export const getTodayActivity = (): ActivityData => {
  const allActivity = getActivityData();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayActivity = allActivity.find(activity => {
    const activityDate = new Date(activity.date);
    activityDate.setHours(0, 0, 0, 0);
    return activityDate.getTime() === today.getTime();
  });
  
  // Return today's activity or create a new entry
  return todayActivity || {
    date: today,
    activeMinutes: 0,
    caloriesBurned: 0,
    steps: 0,
    workouts: []
  };
};

export const saveActivityData = (data: Partial<ActivityData>): ActivityData => {
  const allActivity = getActivityData();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find index of today's activity if it exists
  const todayIndex = allActivity.findIndex(activity => {
    const activityDate = new Date(activity.date);
    activityDate.setHours(0, 0, 0, 0);
    return activityDate.getTime() === today.getTime();
  });
  
  const newActivity: ActivityData = {
    date: today,
    activeMinutes: 0,
    caloriesBurned: 0,
    steps: 0,
    workouts: [],
    ...todayIndex >= 0 ? allActivity[todayIndex] : {},
    ...data
  };
  
  // Update or add today's activity
  if (todayIndex >= 0) {
    allActivity[todayIndex] = newActivity;
  } else {
    allActivity.push(newActivity);
  }
  
  saveToStorage(ACTIVITY_KEY, allActivity);
  return newActivity;
};

// Settings storage API
export const getSettings = (): UserSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error retrieving settings:", e);
  }
  
  // Default settings
  return {
    dailyCalorieGoal: 2000,
    targetActiveMinutes: 30,
    fastingSchedule: {
      targetHours: 16,
    }
  };
};

export const saveSettings = (settings: Partial<UserSettings>): UserSettings => {
  const currentSettings = getSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
  } catch (e) {
    console.error("Error saving settings:", e);
  }
  
  return updatedSettings;
};

// Initialize with dummy data for demonstration (remove in production)
export const initializeDemoData = () => {
  // Only initialize if no data exists
  if (getMeals().length === 0) {
    const today = new Date();
    
    // Sample meals
    const sampleMeals: Omit<Meal, "id" | "time">[] = [
      { name: "Oatmeal with berries", calories: 350, type: "breakfast" },
      { name: "Chicken salad", calories: 450, type: "lunch" },
      { name: "Protein bar", calories: 200, type: "snack" }
    ];
    
    sampleMeals.forEach(meal => saveMeal(meal));
    
    // Sample activity
    saveActivityData({
      activeMinutes: 22,
      caloriesBurned: 320,
      steps: 6500,
      workouts: [
        { type: "Walking", duration: 30, caloriesBurned: 120 }
      ]
    });
    
    // Sample fasting session
    const fastStart = new Date(today);
    fastStart.setHours(20, 0, 0, 0); // Started at 8 PM yesterday
    fastStart.setDate(fastStart.getDate() - 1);
    
    const targetHours = 16;
    
    saveToStorage<FastingSession>(FASTING_KEY, [
      {
        id: `fast-demo-${Math.random().toString(36).substring(2, 9)}`,
        startTime: fastStart,
        targetHours,
        completed: false
      }
    ]);
  }
};
