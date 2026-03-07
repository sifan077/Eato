// Meal Log Types
export interface MealLog {
  id: string;
  user_id: string;
  photo_paths: string[];
  content: string | null;
  meal_type: MealType;
  eaten_at: string;
  location: string | null;
  tags: string[] | null;
  price: number;
  created_at: string;
  updated_at: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealLogInput {
  photo_paths: string[];
  content?: string;
  meal_type: MealType;
  eaten_at?: string;
  location?: string;
  tags?: string[];
  price?: number;
}

export interface MealLogUpdate extends Partial<MealLogInput> {
  id: string;
}

// User Profile Types
export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  birth_date: string | null;
  height: number | null;
  weight: number | null;
  activity_level: ActivityLevel | null;
  diet_goals: string[] | null;
  dietary_restrictions: string[] | null;
  allergies: string[] | null;
  daily_calorie_target: number | null;
  timezone: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface UserProfileInput {
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  birth_date?: string;
  height?: number;
  weight?: number;
  activity_level?: ActivityLevel;
  diet_goals?: string[];
  dietary_restrictions?: string[];
  allergies?: string[];
  daily_calorie_target?: number;
  timezone?: string;
  language?: string;
}
