import { useAuth } from '@clerk/clerk-expo';
import { useStatusBarStyle } from '@/lib/theme';
import { Redirect, Stack } from 'expo-router';

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()
  const statusBarStyle = useStatusBarStyle()

  if (isSignedIn) {
    return <Redirect href={'/'} />
  }

  return (
    <Stack screenOptions={{ headerShown: false, statusBarStyle }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}