import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { backendApi } from '@/src/services/api';
import { useAuth } from '@/src/store/AuthContext';
import type { MeResponse, ProfileResponse, SpecialNoteItem } from '@/src/types/api';
import { hoursToSleepOption, mergeSpecialNotes, sleepOptionToHours } from '@/src/utils/profile';

type Notifications = { all: boolean; followUp: boolean };
type Profile = {
  name: string;
  bio: string;
  photoUri: string | null;
  email: string;
  job: string;
  gender: '남성' | '여성' | null;
  birthYear: number | null;
  sleepHours: string;
  specialNotes: string;
  specialNoteClassifications: SpecialNoteItem[];
  notifications: Notifications;
};
type EditableProfile = Omit<Profile, 'notifications' | 'specialNoteClassifications'>;
type ProfileContextValue = Profile & {
  loading: boolean;
  remoteProfileExists: boolean;
  updateProfile: (partial: Partial<EditableProfile>) => void;
  setNotification: (key: keyof Notifications, value: boolean) => void;
  refreshProfile: () => Promise<MeResponse>;
  persistProfile: (overrides?: Partial<EditableProfile>) => Promise<ProfileResponse>;
};

const defaultProfile: Profile = {
  name: '사용자',
  bio: '건강한 습관을 함께 만들어요!',
  photoUri: null,
  email: '',
  job: '',
  gender: null,
  birthYear: null,
  sleepHours: '',
  specialNotes: '',
  specialNoteClassifications: [],
  notifications: { all: true, followUp: true },
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: PropsWithChildren) {
  const { session, user } = useAuth();
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [loading, setLoading] = useState(false);
  const [remoteProfileExists, setRemoteProfileExists] = useState(false);

  const applyRemoteProfile = useCallback((me: MeResponse) => {
    setRemoteProfileExists(Boolean(me.profile));
    setProfile((current) => ({
      ...current,
      email: me.email ?? user?.email ?? '',
      name: me.profile?.nickname ?? user?.user_metadata?.nickname ?? current.name,
      job: me.profile?.job ?? '',
      birthYear: me.profile?.birth_year ?? null,
      gender: me.profile?.gender === '남성' || me.profile?.gender === '여성' ? me.profile.gender : null,
      sleepHours: hoursToSleepOption(me.profile?.average_sleep_hours),
      specialNotes: me.profile?.special_notes ?? mergeSpecialNotes(me.profile?.known_conditions, me.profile?.allergies),
      specialNoteClassifications: me.profile?.special_notes_classification ?? [],
    }));
  }, [user]);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    try {
      const me = await backendApi.getMe();
      applyRemoteProfile(me);
      return me;
    } finally {
      setLoading(false);
    }
  }, [applyRemoteProfile]);

  useEffect(() => {
    if (!session) {
      setProfile(defaultProfile);
      setRemoteProfileExists(false);
      return;
    }
    void refreshProfile().catch((error) => {
      console.warn('Profile load failed', error instanceof Error ? error.message : error);
    });
  }, [refreshProfile, session]);

  const updateProfile: ProfileContextValue['updateProfile'] = (partial) =>
    setProfile((current) => ({ ...current, ...partial }));

  const setNotification: ProfileContextValue['setNotification'] = (key, value) =>
    setProfile((current) => {
      if (key === 'all') {
        return { ...current, notifications: { all: value, followUp: value } };
      }
      return { ...current, notifications: { ...current.notifications, [key]: value } };
    });

  const persistProfile = useCallback(async (overrides: Partial<EditableProfile> = {}) => {
    const values = { ...profile, ...overrides };
    const payload = {
      nickname: values.name.trim() || '사용자',
      job: values.job.trim() || null,
      birth_year: values.birthYear,
      gender: values.gender,
      average_sleep_hours: sleepOptionToHours(values.sleepHours),
      special_notes: values.specialNotes.trim() || null,
    };
    const saved = remoteProfileExists
      ? await backendApi.updateProfile(payload)
      : await backendApi.createProfile(payload);
    setRemoteProfileExists(true);
    applyRemoteProfile({ id: saved.id, email: user?.email ?? profile.email, profile: saved });
    return saved;
  }, [applyRemoteProfile, profile, remoteProfileExists, user]);

  const value = useMemo<ProfileContextValue>(() => ({
    ...profile,
    loading,
    remoteProfileExists,
    updateProfile,
    setNotification,
    refreshProfile,
    persistProfile,
  }), [loading, persistProfile, profile, refreshProfile, remoteProfileExists]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
}
