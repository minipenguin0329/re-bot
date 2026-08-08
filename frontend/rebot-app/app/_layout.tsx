import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CartProvider } from '@/src/store/CartContext';
import { ProfileProvider } from '@/src/store/ProfileContext';

export default function RootLayout() {
  return <ProfileProvider><CartProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: '#fff' } }} /></CartProvider></ProfileProvider>;
}
