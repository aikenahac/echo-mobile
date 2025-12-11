import { BookGrid } from '@/components/book-grid';
import { EditProfileDrawer } from '@/components/edit-profile-drawer';
import { FullScreenLoader } from '@/components/full-screen-loader';
import { ProfileStats } from '@/components/profile-stats';
import { ScreenContainer } from '@/components/screen-container';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useMyLibrary } from '@/hooks/api/library/use-get-my-library';
import { useProfile } from '@/hooks/api/user/use-get-me';
import { useAuth } from '@clerk/clerk-expo';
import { compareDesc, isAfter, startOfYear } from 'date-fns';
import { Heart } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, View } from 'react-native';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { data: library, isLoading: libraryLoading, refetch: refetchLibrary } = useMyLibrary();

  if (profileLoading || libraryLoading) {
    return <FullScreenLoader />;
  }

  if (!profile) {
    return null;
  }

  // Calculate stats
  const currentYearStart = startOfYear(new Date());
  const booksThisYear = library?.finished.filter(
    ub => ub.finishedAt && isAfter(new Date(ub.finishedAt), currentYearStart)
  ) || [];

  const totalPages = booksThisYear.reduce(
    (sum, ub) => sum + (ub.book.pages || 0),
    0
  );

  // Prepare book arrays
  const favoriteBooks = library?.favoriteBooks.slice(0, 6) || [];
  const currentlyReading = library?.currentlyReading.slice(0, 6) || [];
  const recentlyFinished = [...(library?.finished || [])]
    .sort((a, b) => compareDesc(
      new Date(a.finishedAt || 0),
      new Date(b.finishedAt || 0)
    ))
    .slice(0, 6);

  const handleRefresh = async () => {
    await refetchProfile();
    await refetchLibrary()
  }

  return (
    <ScreenContainer className='mb-12'>
      <ScrollView refreshControl={
        <RefreshControl refreshing={profileLoading || libraryLoading} onRefresh={handleRefresh} />
      }>
        {/* Profile Header */}
        <View className="flex-row items-center gap-4 py-6">
          <Avatar alt={`${profile.username} profile picture`} className="h-24 w-24">
            <AvatarFallback>
              <Text className="text-3xl font-semibold">
                {(profile.username || profile.email)?.[0]?.toUpperCase()}
              </Text>
            </AvatarFallback>
          </Avatar>
          <View className="flex-1">
            <Text className="text-2xl font-bold">
              {profile.username || 'User'}
            </Text>
            <Text className="text-sm text-muted-foreground">{profile.email}</Text>
            {profile.isPremium && (
              <Badge className="mt-1 self-start">
                <Text>{profile.planName || 'Premium'}</Text>
              </Badge>
            )}
          </View>
          <Button variant="outline" size="sm" onPress={() => setEditDrawerOpen(true)}>
            <Text>{t('profile.edit')}</Text>
          </Button>
        </View>

        {/* Bio Section */}
        {profile.bio && (
          <View className="pb-4">
            <Text className="text-muted-foreground">{profile.bio}</Text>
          </View>
        )}

        {/* Stats */}
        <View className="pb-6">
          <ProfileStats
            booksThisYear={booksThisYear.length}
            totalPages={totalPages}
            currentStreak={0}
          />
        </View>

        {/* Favorite Books */}
        {favoriteBooks.length > 0 && (
          <View className="pb-6">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <View className="flex-row items-center gap-2">
                  <Heart className="h-6 w-6 fill-primary text-primary" />
                  <CardTitle>{t('profile.sections.favorites')}</CardTitle>
                </View>
              </CardHeader>
              <CardContent>
                <BookGrid books={favoriteBooks} maxBooks={6} />
              </CardContent>
            </Card>
          </View>
        )}

        {/* Currently Reading */}
        {currentlyReading.length > 0 && (
          <View className="pb-6">
            <Text className="text-2xl font-bold mb-4">
              {t('profile.sections.currentlyReading')}
            </Text>
            <BookGrid books={currentlyReading} maxBooks={6} />
          </View>
        )}

        {/* Recently Finished */}
        {recentlyFinished.length > 0 && (
          <View className="pb-6">
            <Text className="text-2xl font-bold mb-4">
              {t('profile.sections.recentlyFinished')}
            </Text>
            <BookGrid books={recentlyFinished} maxBooks={6} />
          </View>
        )}

        {/* Sign Out Button */}
        <View className="pt-6">
          <Button className="w-full" onPress={() => signOut()}>
            <Text>{t('auth.logout')}</Text>
          </Button>
        </View>
      </ScrollView>

      {/* Edit Profile Drawer */}
      <EditProfileDrawer
        open={editDrawerOpen}
        setOpen={setEditDrawerOpen}
        currentUsername={profile.username}
        currentBio={profile.bio}
      />
    </ScreenContainer>
  );
}

