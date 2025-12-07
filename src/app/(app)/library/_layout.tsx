import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function LibraryLayout() {
  const { t } = useTranslation();
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="user-book" options={{
          headerShown: true,
          headerTitle: '',
          headerBackTitle: t("library.title"),
          presentation: 'card',
          headerBackground: () => <View className="bg-background" />,
        }}
 />
    </Stack>
  );
}
