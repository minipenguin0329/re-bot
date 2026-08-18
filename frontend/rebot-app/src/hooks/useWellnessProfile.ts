import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { backendApi } from '@/src/services/api';
import type { WellnessProfileResponse } from '@/src/types/api';

export function useWellnessProfile() {
  const [profile, setProfile] = useState<WellnessProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProfile(await backendApi.getWellnessProfile());
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return { profile, loading, reload: load };
}
