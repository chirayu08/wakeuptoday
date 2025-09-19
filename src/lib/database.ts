import { supabase } from '@/integrations/supabase/client';

export interface WorkoutLog {
  id: string;
  user_id: string;
  target_pushups: number;
  completed_pushups: number;
  duration_seconds: number;
  completed_at: string;
  created_at: string;
  alarm_name?: string;
}

export interface Alarm {
  id: string;
  user_id: string;
  time: string;
  pushups: number;
  enabled: boolean;
  name?: string;
  created_at: string;
}

// Workout Log operations
export async function createWorkoutLog(log: Omit<WorkoutLog, 'id' | 'user_id' | 'created_at'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      ...log,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getWorkoutLogs(limit?: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  let query = supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as WorkoutLog[];
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Calculate workout statistics
export function calculateWorkoutStats(logs: WorkoutLog[]) {
  const totalPushups = logs.reduce((sum, log) => sum + log.completed_pushups, 0);
  const completedAlarms = logs.filter(log => log.completed_pushups >= log.target_pushups).length;
  const successRate = logs.length > 0 ? Math.round((completedAlarms / logs.length) * 100) : 0;

  return {
    totalPushups,
    completedAlarms,
    successRate,
    totalWorkouts: logs.length
  };
}