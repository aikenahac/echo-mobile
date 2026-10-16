import { Avatar, CapsuleButton, Cover, DisplayText, SFIcon, TextField } from "@/components/echo";
import { useUsernameAvailability } from "@/hooks/api/profile/use-profile-queries";
import { useUpdateProfile } from "@/hooks/api/user/use-update-me";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { getErrorMessage } from "@/lib/api/errors";
import { fixed, spacing, useColors } from "@/lib/theme";
import { cleanUsername } from "@/lib/username";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, KeyboardAvoidingView, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PIRANESI = require("../../assets/images/covers/piranesi.jpg");

/**
 * Username onboarding (r6 15): blocks the app until the reader picks a username. On the
 * field, with a live availability check and a preview of how it shows in the feed (the
 * preview hides on small phones). OAuth sign-ups come straight here.
 */
export function UsernameOnboarding() {
  const colors = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const keyboard = useKeyboardVisible();
  const update = useUpdateProfile();

  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const debounced = useDebouncedValue(username, 300);
  const availability = useUsernameAvailability(debounced, null);
  const settled = debounced === username && username.length >= 3;
  const available = settled && availability.data?.available === true;
  const problem =
    error ??
    (username.length > 0 && username.length < 3 && debounced === username
      ? t("editProfile.usernameRule")
      : settled && availability.data && !availability.data.available
        ? (availability.data.reason ?? null)
        : null);

  const submit = () => {
    if (!available || update.isPending) return;
    update.mutate({ username }, { onError: (e) => setError(getErrorMessage(e)) });
  };

  const small = height < 760;
  const handle = username || t("username.placeholder");

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.field }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: insets.top + 14, paddingBottom: 16 }}
      >
        <DisplayText variant="listTitle" style={{ fontFamily: "ArchivoCondensed-Black", color: colors.onField }}>
          {t("username.brand")}
        </DisplayText>
        <DisplayText
          variant={small ? "screenTitle" : "headline"}
          accessibilityRole="header"
          style={{ color: colors.onField, marginTop: small || keyboard ? 32 : 80 }}
        >
          {t("username.title")}
        </DisplayText>

        <TextField
          containerStyle={{ marginTop: 28 }}
          leading="@"
          value={username}
          onChangeText={(v) => {
            setUsername(cleanUsername(v));
            setError(null);
          }}
          placeholder={t("username.placeholder")}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="username"
          returnKeyType="done"
          onSubmitEditing={submit}
          accessibilityLabel={t("editProfile.username")}
          trailing={
            settled && availability.isFetching ? (
              <ActivityIndicator size="small" color={colors.ink3} />
            ) : available ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <SFIcon name="checkmark" size={12} color={colors.pinkInk} weight="semibold" />
                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.pinkInk }}>{t("username.available")}</Text>
              </View>
            ) : null
          }
        />
        {problem ? (
          <Text accessibilityLiveRegion="polite" style={{ fontSize: 15, lineHeight: 20, color: colors.onField, fontWeight: "600", marginTop: 10 }}>
            {problem}
          </Text>
        ) : (
          <Text style={{ fontSize: 15, lineHeight: 20, color: colors.onField2, marginTop: 10 }}>{t("username.rule")}</Text>
        )}

        {!small && !keyboard && (
          // How the name shows to others, as a feed item
          <View
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            style={{
              marginTop: 40,
              backgroundColor: colors.paper,
              borderRadius: 12,
              borderCurve: "continuous",
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              transform: [{ rotate: "-1.5deg" }],
              boxShadow: fixed.cardShadow,
            }}
          >
            <Avatar user={{ displayName: null, username: handle, profilePictureUrl: null }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontSize: 15, lineHeight: 20, color: colors.ink }}>
                <Text style={{ fontWeight: "600" }}>@{handle}</Text> <Text style={{ backgroundColor: colors.field }}> {t("username.previewStarted")} </Text>
              </Text>
              <Text style={{ fontSize: 13, color: colors.ink2, marginTop: 2 }}>{t("username.previewWhen")}</Text>
            </View>
            <Cover image={PIRANESI} title="Piranesi" width={44} />
          </View>
        )}
      </ScrollView>
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: keyboard ? 12 : insets.bottom + 8 }}>
        <CapsuleButton title={t("username.continue")} variant="field" loading={update.isPending} disabled={!available} onPress={submit} style={{ minHeight: 56 }} />
      </View>
    </KeyboardAvoidingView>
  );
}
