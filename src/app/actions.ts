'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { MealLog, MealLogInput, UserProfile, UserProfileInput } from '@/lib/types';
import { getStartOfDay, getEndOfDay } from '@/utils/date';

// ============================================
// Meal Logs Actions
// ============================================

// Get today's meal logs
export async function getTodayMealLogs(): Promise<MealLog[]> {
  const supabase = await createClient();
  const todayStart = getStartOfDay();
  const todayEnd = getEndOfDay();

  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .gte('eaten_at', todayStart.toISOString())
    .lte('eaten_at', todayEnd.toISOString())
    .order('eaten_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch today's meal logs: ${error.message} (Code: ${error.code})`);
  }

  return data || [];
}

// Get meal logs by date range
export async function getMealLogsByDate(startDate: Date, endDate: Date): Promise<MealLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .gte('eaten_at', startDate.toISOString())
    .lte('eaten_at', endDate.toISOString())
    .order('eaten_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch meal logs: ${error.message} (Code: ${error.code})`);
  }

  return data || [];
}

// Get a single meal log by ID
export async function getMealLogById(id: string): Promise<MealLog | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('meal_logs').select('*').eq('id', id).single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch meal log: ${error.message} (Code: ${error.code})`);
  }

  return data;
}

// Create a new meal log
export async function createMealLog(mealLog: MealLogInput): Promise<MealLog> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      ...mealLog,
      eaten_at: mealLog.eaten_at || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to create meal log: ${error.message} (Code: ${error.code})`);
  }

  revalidatePath('/');
  revalidatePath('/today');
  revalidatePath('/calendar');
  revalidatePath('/search');

  return data;
}

// Update an existing meal log
export async function updateMealLog(
  id: string,
  updates: Partial<Omit<MealLogInput, 'photo_path'>>
): Promise<MealLog> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meal_logs')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to update meal log: ${error.message} (Code: ${error.code})`);
  }

  revalidatePath('/');
  revalidatePath('/today');
  revalidatePath('/calendar');
  revalidatePath('/search');
  revalidatePath(`/edit/${id}`);

  return data;
}

// Delete a meal log
export async function deleteMealLog(id: string, photoPaths: string[]): Promise<void> {
  const supabase = await createClient();

  // Delete all photos from storage
  if (photoPaths.length > 0) {
    const { error: storageError } = await supabase.storage.from('meal-photos').remove(photoPaths);

    if (storageError) {
      console.error('Storage error:', storageError);
      throw new Error(`Failed to delete photos: ${storageError.message}`);
    }
  }

  // Delete record from database
  const { error } = await supabase.from('meal_logs').delete().eq('id', id);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to delete meal log: ${error.message} (Code: ${error.code})`);
  }

  revalidatePath('/');
  revalidatePath('/today');
  revalidatePath('/calendar');
  revalidatePath('/search');
}

// Search meal logs by keyword
export async function searchMealLogs(keyword: string): Promise<MealLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .or(`content.ilike.%${keyword}%,location.ilike.%${keyword}%`)
    .order('eaten_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to search meal logs: ${error.message} (Code: ${error.code})`);
  }

  return data || [];
}

// Search meal logs by tags
export async function searchMealLogsByTags(tags: string[]): Promise<MealLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .contains('tags', tags)
    .order('eaten_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to search meal logs by tags: ${error.message} (Code: ${error.code})`);
  }

  return data || [];
}

// ============================================
// User Profiles Actions
// ============================================

// Get user profile
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch user profile: ${error.message} (Code: ${error.code})`);
  }

  return data;
}

// Update user profile
export async function updateUserProfile(updates: UserProfileInput): Promise<UserProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('未登录，请重新登录');
  }

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to update user profile: ${error.message} (Code: ${error.code})`);
  }

  revalidatePath('/profile');

  return data;
}

// ============================================
// Statistics Actions
// ============================================

// Get streak days (consecutive days with meal logs)
export async function getStreakDays(): Promise<number> {
  const supabase = await createClient();

  // Get all meal logs ordered by date
  const { data: mealLogs, error } = await supabase
    .from('meal_logs')
    .select('eaten_at')
    .order('eaten_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch meal logs: ${error.message} (Code: ${error.code})`);
  }

  if (!mealLogs || mealLogs.length === 0) {
    return 0;
  }

  // Group by date
  const datesSet = new Set(
    mealLogs.map((meal) => {
      const date = new Date(meal.eaten_at);
      return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
    })
  );

  const dates = Array.from(datesSet).sort((a, b) => b.localeCompare(a));

  // Calculate streak
  let streak = 0;
  let currentDate = new Date();
  currentDate = new Date(currentDate.toLocaleDateString('en-US', { timeZone: 'Asia/Shanghai' }));

  for (let i = 0; i < dates.length; i++) {
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateStr = expectedDate.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Shanghai',
    });

    if (dates[i] === expectedDateStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Get recent days statistics (last 7 days)
export async function getRecentDaysStats(): Promise<
  Array<{ date: string; mealCount: number; hasRecords: boolean }>
> {
  const supabase = await createClient();

  // Get meal logs from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const { data: mealLogs, error } = await supabase
    .from('meal_logs')
    .select('eaten_at')
    .gte('eaten_at', getStartOfDay(sevenDaysAgo).toISOString())
    .order('eaten_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch meal logs: ${error.message} (Code: ${error.code})`);
  }

  // Group by date
  const dateCountMap = new Map<string, number>();
  (mealLogs || []).forEach((meal) => {
    const date = new Date(meal.eaten_at);
    const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
    dateCountMap.set(dateStr, (dateCountMap.get(dateStr) || 0) + 1);
  });

  // Generate last 7 days stats
  const stats = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
    const displayDate = date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });

    stats.push({
      date: displayDate,
      mealCount: dateCountMap.get(dateStr) || 0,
      hasRecords: (dateCountMap.get(dateStr) || 0) > 0,
    });
  }

  return stats;
}

// Get top tags from meal logs
export async function getTopTags(
  limit: number = 10
): Promise<Array<{ tag: string; count: number }>> {
  const supabase = await createClient();

  // Get all meal logs with tags
  const { data: mealLogs, error } = await supabase
    .from('meal_logs')
    .select('tags')
    .not('tags', 'is', null);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch meal logs: ${error.message} (Code: ${error.code})`);
  }

  // Count tags
  const tagCountMap = new Map<string, number>();
  (mealLogs || []).forEach((meal) => {
    if (meal.tags && Array.isArray(meal.tags)) {
      meal.tags.forEach((tag) => {
        tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
      });
    }
  });

  // Sort by count and return top tags
  const sortedTags = Array.from(tagCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));

  return sortedTags;
}

// ============================================
// Price Statistics Actions
// ============================================

// Get recent days price statistics (last 7 days)
export async function getRecentDaysPriceStats(): Promise<
  Array<{ date: string; totalPrice: number; hasRecords: boolean }>
> {
  const supabase = await createClient();

  // Get meal logs from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const { data: mealLogs, error } = await supabase
    .from('meal_logs')
    .select('eaten_at, price')
    .gte('eaten_at', getStartOfDay(sevenDaysAgo).toISOString())
    .order('eaten_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch meal logs: ${error.message} (Code: ${error.code})`);
  }

  // Group by date and sum prices
  const datePriceMap = new Map<string, number>();
  (mealLogs || []).forEach((meal) => {
    const date = new Date(meal.eaten_at);
    const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
    const price = meal.price || 0;
    datePriceMap.set(dateStr, (datePriceMap.get(dateStr) || 0) + price);
  });

  // Generate last 7 days stats
  const stats = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
    const displayDate = date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });

    stats.push({
      date: displayDate,
      totalPrice: datePriceMap.get(dateStr) || 0,
      hasRecords: (datePriceMap.get(dateStr) || 0) > 0,
    });
  }

  return stats;
}

// Get total price statistics for different time periods
export async function getTotalPriceStats(): Promise<{
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  averageDaily: number;
}> {
  const supabase = await createClient();

  const todayStart = getStartOfDay();
  const todayEnd = getEndOfDay();
  const weekStart = getStartOfDay(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  // Get the first day of current month for monthly stats
  const now = new Date();
  const monthStart = getStartOfDay(new Date(now.getFullYear(), now.getMonth(), 1));

  // Get today's meal logs
  const { data: todayLogs } = await supabase
    .from('meal_logs')
    .select('price')
    .gte('eaten_at', todayStart.toISOString())
    .lte('eaten_at', todayEnd.toISOString());

  const todayTotal = (todayLogs || []).reduce((sum, meal) => sum + (meal.price || 0), 0);

  // Get week's meal logs
  const { data: weekLogs } = await supabase
    .from('meal_logs')
    .select('price')
    .gte('eaten_at', weekStart.toISOString());

  const weekTotal = (weekLogs || []).reduce((sum, meal) => sum + (meal.price || 0), 0);

  // Get month's meal logs (from the 1st of current month)
  const { data: monthLogs } = await supabase
    .from('meal_logs')
    .select('price')
    .gte('eaten_at', monthStart.toISOString());

  const monthTotal = (monthLogs || []).reduce((sum, meal) => sum + (meal.price || 0), 0);

  // Calculate average daily: from the 1st of current month to today
  const daysPassedThisMonth = now.getDate();
  const averageDaily = monthTotal / daysPassedThisMonth;

  return {
    todayTotal,
    weekTotal,
    monthTotal,
    averageDaily,
  };
}

// Get recent weeks price statistics
export async function getRecentWeeksPriceStats(
  weeks: number = 4
): Promise<Array<{ date: string; totalPrice: number; hasRecords: boolean }>> {
  const supabase = await createClient();

  // Get meal logs from the last N weeks
  const weeksAgo = new Date();
  weeksAgo.setDate(weeksAgo.getDate() - weeks * 7);

  const { data: mealLogs, error } = await supabase
    .from('meal_logs')
    .select('eaten_at, price')
    .gte('eaten_at', getStartOfDay(weeksAgo).toISOString())
    .order('eaten_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch meal logs: ${error.message} (Code: ${error.code})`);
  }

  // Group by week and sum prices
  const weekPriceMap = new Map<string, number>();

  (mealLogs || []).forEach((meal) => {
    const date = new Date(meal.eaten_at);
    // Get the start of the week (Monday)
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(date.setDate(diff));
    const weekStr = weekStart.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
    const price = meal.price || 0;
    weekPriceMap.set(weekStr, (weekPriceMap.get(weekStr) || 0) + price);
  });

  // Generate last N weeks stats
  const stats = [];
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1));

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekStr = weekStart.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });

    // Calculate week end (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Format display date
    const displayDate = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;

    stats.push({
      date: displayDate,
      totalPrice: weekPriceMap.get(weekStr) || 0,
      hasRecords: (weekPriceMap.get(weekStr) || 0) > 0,
    });
  }

  return stats;
}

// Get monthly price statistics for a specific year
export async function getMonthlyPriceStats(
  year?: number
): Promise<Array<{ date: string; totalPrice: number; hasRecords: boolean }>> {
  const supabase = await createClient();

  const targetYear = year || new Date().getFullYear();

  // Get meal logs for the specified year
  const yearStart = new Date(targetYear, 0, 1);
  const yearEnd = new Date(targetYear, 11, 31);

  const { data: mealLogs, error } = await supabase
    .from('meal_logs')
    .select('eaten_at, price')
    .gte('eaten_at', getStartOfDay(yearStart).toISOString())
    .lte('eaten_at', getEndOfDay(yearEnd).toISOString())
    .order('eaten_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch meal logs: ${error.message} (Code: ${error.code})`);
  }

  // Group by month and sum prices
  const monthPriceMap = new Map<number, number>();

  (mealLogs || []).forEach((meal) => {
    const date = new Date(meal.eaten_at);
    const month = date.getMonth();
    const price = meal.price || 0;
    monthPriceMap.set(month, (monthPriceMap.get(month) || 0) + price);
  });

  // Generate all 12 months stats
  const stats = [];
  const monthNames = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ];

  for (let month = 0; month < 12; month++) {
    stats.push({
      date: monthNames[month],
      totalPrice: monthPriceMap.get(month) || 0,
      hasRecords: (monthPriceMap.get(month) || 0) > 0,
    });
  }

  return stats;
}
