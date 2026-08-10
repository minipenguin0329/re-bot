import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import type { Database } from '@/src/types/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_URL과 EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 설정해주세요.',
  );
}

const canPersistSession = Platform.OS !== 'web' || typeof window !== 'undefined';

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: canPersistSession ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: canPersistSession,
    detectSessionInUrl: false,
    lock: processLock,
  },
});
