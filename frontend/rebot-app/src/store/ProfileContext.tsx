import { createContext, PropsWithChildren, useContext, useState } from 'react';

type Notifications = { all: boolean; report: boolean; marketing: boolean };
type Profile = {
  name: string;
  bio: string;
  photoUri: string | null;
  email: string;
  password: string;
  job: string;
  gender: '남성' | '여성' | null;
  birthYear: number | null;
  sleepHours: string;
  notifications: Notifications;
};
type EditableProfile = Omit<Profile, 'notifications'>;
type ProfileContextValue = Profile & { updateProfile: (partial: Partial<EditableProfile>) => void; setNotification: (key: keyof Notifications, value: boolean) => void };

const defaultProfile: Profile = {
  name: '연주님',
  bio: '건강한 습관을 함께 만들어요!',
  photoUri: null,
  email: '',
  password: '',
  job: '',
  gender: null,
  birthYear: null,
  sleepHours: '',
  notifications: { all: true, report: true, marketing: false },
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<Profile>(defaultProfile);

  const updateProfile: ProfileContextValue['updateProfile'] = (partial) => setProfile((current) => ({ ...current, ...partial }));

  const setNotification: ProfileContextValue['setNotification'] = (key, value) => setProfile((current) => {
    if (key === 'all') return { ...current, notifications: { all: value, report: value, marketing: value } };
    return { ...current, notifications: { ...current.notifications, [key]: value } };
  });

  return <ProfileContext.Provider value={{ ...profile, updateProfile, setNotification }}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
}
