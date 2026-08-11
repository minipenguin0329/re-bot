import 'react-native-url-polyfill/auto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/src/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

function readOAuthParams(url: string) {
  const query = url.split('?')[1]?.split('#')[0] ?? '';
  const fragment = url.split('#')[1] ?? '';
  return new URLSearchParams(fragment || query);
}

async function createSessionFromUrl(url: string) {
  const params = readOAuthParams(url);
  const errorDescription = params.get('error_description');

  if (errorDescription) {
    throw new Error(errorDescription);
  }

  const code = params.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken || !refreshToken) {
    throw new Error('카카오 인증 결과에서 로그인 토큰을 확인할 수 없습니다.');
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) throw error;
}

export async function signInWithKakao(): Promise<boolean> {
  const redirectTo = Linking.createURL('auth/callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('카카오 로그인 주소를 만들지 못했습니다.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    showInRecents: true,
  });

  if (result.type !== 'success') return false;

  await createSessionFromUrl(result.url);
  return true;
}
