import { ScreenContainer } from '@/components/screen-container';
import { UnderConstruction } from '@/components/under-construction';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@clerk/clerk-expo';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { signOut } = useAuth();

  return (
    <ScreenContainer className="flex flex-col justify-between">
      <UnderConstruction
        title="Profile Coming Soon"
        message="We're building an awesome profile experience for you!"
      />

      <View className="p-6 pb-12">
        <Button className="w-full" onPress={() => signOut()}>
          <Text>{t('auth.logout')}</Text>
        </Button>
      </View>
    </ScreenContainer>
  );
}

