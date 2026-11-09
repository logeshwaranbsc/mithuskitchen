import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../../config/env';
import { logger } from '../../utils/logger';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    config.supabaseUrl &&
    config.supabaseUrl.startsWith('http') &&
    config.supabaseServiceRoleKey
  );
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
      logger.info('Supabase Anon Client initialized.');
    } catch (err) {
      logger.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseClient;
};

export const getSupabaseAdminClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseAdminClient) {
    try {
      supabaseAdminClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      logger.info('Supabase Admin/Service Role Client initialized.');
    } catch (err) {
      logger.error('Failed to initialize Supabase admin client:', err);
      return null;
    }
  }
  return supabaseAdminClient;
};
