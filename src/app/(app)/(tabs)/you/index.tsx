import { CapsuleButton } from "@/components/echo";
import { ProfileHead, ReadingNowBand, ShelfStrip, YearStat } from "@/components/profile/profile-parts";
import { useLibrary } from "@/hooks/api/library/use-library";
import { useProfileStats } from "@/hooks/api/profile/use-profile-queries";
import { useProfile } from "@/hooks/api/user/use-get-me";
import { getErrorMessage } from "@/lib/api/errors";
import type { Shelf } from "@/lib/library-cache";
import { spacing, useColors } from "@/lib/theme";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** You (r6 09): who you are, this year's count, what you're reading, and your shelves */
export default function YouScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const stats = useProfileStats();
  const library = useLibrary();

  const openBook = (bookId: string) => router.push({ pathname: "/book/[bookId]", params: { bookId } });
  const seeAll = (shelf: Shelf) => router.navigate({ pathname: "/library", params: { shelf } });
  const refresh = () => Promise.all([profile.refetch(), stats.refetch(), library.refetch()]);

  const lib = library.data;
  const reading = [...(lib?.currentlyReading ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const finished = [...(lib?.finished ?? [])].sort((a, b) => (b.finishedAt ?? "").localeCompare(a.finishedAt ?? ""));

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="pencil" tintColor={colors.ink} accessibilityLabel={t("profile.edit")} onPress={() => router.push("/edit-profile")} />
        <Stack.Toolbar.Button icon="gearshape" tintColor={colors.ink} accessibilityLabel={t("profile.settings")} onPress={() => router.push("/settings")} />
      </Stack.Toolbar>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingTop: insets.top + 64, paddingBottom: insets.bottom + 96 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={colors.ink2} progressViewOffset={insets.top} />}
      >
        {profile.isPending ? (
          <ActivityIndicator color={colors.ink2} style={{ marginTop: 48 }} />
        ) : profile.isError ? (
          <View style={{ padding: spacing.lg, gap: spacing.md, alignItems: "flex-start" }}>
            <Text style={{ fontSize: 17, color: colors.ink }}>{t("profile.error")}</Text>
            <Text style={{ fontSize: 13, color: colors.ink2 }}>{getErrorMessage(profile.error)}</Text>
            <CapsuleButton title={t("common.retry")} variant="outline" size="md" onPress={refresh} />
          </View>
        ) : (
          <>
            <ProfileHead user={profile.data} />
            {stats.data && <YearStat count={stats.data.booksFinishedThisYear} pages={stats.data.pagesReadThisYear} />}
            <ReadingNowBand books={reading} onOpen={openBook} />
            <ShelfStrip title={t("profile.favourites")} books={(lib?.favoriteBooks ?? []).map((b) => b.book)} onOpen={openBook} />
            <ShelfStrip
              big
              title={t("profile.wantToRead")}
              count={lib?.wantToRead.length}
              books={(lib?.wantToRead ?? []).map((b) => b.book)}
              onOpen={openBook}
              onSeeAll={() => seeAll("want")}
            />
            <ShelfStrip
              big
              title={t("profile.finished")}
              count={lib?.finished.length}
              books={finished.map((b) => b.book)}
              onOpen={openBook}
              onSeeAll={() => seeAll("finished")}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}
