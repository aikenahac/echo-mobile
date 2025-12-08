import { FullScreenLoader } from '@/components/full-screen-loader';
import { ScreenContainer } from '@/components/screen-container';
import { SetUsernameDrawer } from '@/components/set-username-drawer';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useProfile } from '@/hooks/api/user/use-get-me';
import { getErrorMessage, isApiRequestError } from '@/lib/api/errors';
import { useAuth } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // Fetch user profile with error handling and validation
  const { data: profile, isLoading, error, refetch } = useProfile();

  useEffect(() => {
    if (profile && (!profile.username || profile.username.length === 0)) {
      setOpen(true);
    }
  }, [profile])

  if (isLoading) {
    return (
      <FullScreenLoader />
    )
  }

  return (
    <ScreenContainer className="flex flex-col items-center w-screen h-screen justify-between mt-24">
      <Image
        source={{ uri: 'echo_logo' }}
        style={{ width: 220, height: 100 }}
        className="w-64 h-32 object-contain"
        transition={1000}
      />

      <View className="w-full flex items-center gap-2">
        {/* Profile Section with Error Handling */}
        <View className="w-full p-4 items-center gap-2">
          {isLoading && (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" />
              <Text className="text-muted-foreground">Loading profile...</Text>
            </View>
          )}

          {error && (
            <View className="w-full bg-destructive/10 p-4 rounded-lg border border-destructive items-center gap-2">
              <Text className="text-destructive font-semibold">Profile Error</Text>
              <Text className="text-destructive text-center">{getErrorMessage(error)}</Text>
              {isApiRequestError(error) && error.statusCode && (
                <Text className="text-destructive/70 text-sm">Status: {error.statusCode}</Text>
              )}
              <Button variant="outline" size="sm" onPress={() => refetch()}>
                <Text>Retry</Text>
              </Button>
            </View>
          )}

          {profile && !error && (
            <View className="w-full bg-accent/50 p-4 rounded-lg border border-border items-center gap-2">
              <Text className="font-semibold text-lg">Profile Loaded ✓</Text>
              <View className="items-center gap-1">
                <Text className="text-muted-foreground text-sm">Email:</Text>
                <Text className="font-medium">{profile.email}</Text>
              </View>
              {profile.username && (
                <View className="items-center gap-1">
                  <Text className="text-muted-foreground text-sm">Username:</Text>
                  <Text className="font-medium">@{profile.username}</Text>
                </View>
              )}
              <View className="items-center gap-1">
                <Text className="text-muted-foreground text-sm">Role:</Text>
                <Text className="font-medium capitalize">{profile.role}</Text>
                <Text className="font-medium capitalize">Is premium: {profile.isPremium.toString()}</Text>

              </View>
              {'_count' in profile && profile._count && (
                <View className="flex-row gap-4 mt-2">
                  {profile._count.followers !== undefined && (
                    <View className="items-center">
                      <Text className="text-lg font-bold">{profile._count.followers}</Text>
                      <Text className="text-muted-foreground text-xs">Followers</Text>
                    </View>
                  )}
                  {profile._count.following !== undefined && (
                    <View className="items-center">
                      <Text className="text-lg font-bold">{profile._count.following}</Text>
                      <Text className="text-muted-foreground text-xs">Following</Text>
                    </View>
                  )}
                  {profile._count.userBooks !== undefined && (
                    <View className="items-center">
                      <Text className="text-lg font-bold">{profile._count.userBooks}</Text>
                      <Text className="text-muted-foreground text-xs">Books</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        <SetUsernameDrawer open={open} setOpen={setOpen} />

        <Text>Profile</Text>
        <Button className="w-full" onPress={() => signOut()}>
          <Text>{t('auth.logout')}</Text>
        </Button>
      </View>
    </ScreenContainer>
  );
}

