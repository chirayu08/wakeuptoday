import { supabase } from '@/integrations/supabase/client';

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection by checking auth status
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection error:', error);
      return {
        success: false,
        error: error.message,
        details: 'Failed to connect to Supabase'
      };
    }
    
    console.log('Supabase connection successful!');
    return {
      success: true,
      message: 'Successfully connected to Supabase',
      data: session
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      details: 'Unexpected error occurred during connection test'
    };
  }
}

export async function testSupabaseAuth() {
  try {
    console.log('Testing Supabase auth...');
    
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth error:', error);
      return {
        success: false,
        error: error.message,
        details: 'Failed to get auth session'
      };
    }
    
    console.log('Auth test completed. Session:', session ? 'Active' : 'No active session');
    return {
      success: true,
      message: 'Auth system is working',
      hasSession: !!session,
      user: session?.user || null
    };
  } catch (err) {
    console.error('Auth test error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      details: 'Unexpected error during auth test'
    };
  }
}