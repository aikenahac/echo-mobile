import { Avatar, CapsuleButton, SFIcon, TextField } from "@/components/echo";
import { useUsernameAvailability } from "@/hooks/api/profile/use-profile-queries";
import { useProfile } from "@/hooks/api/user/use-get-me";
import { useUpdateProfile } from "@/hooks/api/user/use-update-me";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/api/errors";
import { type ImageContentType, useProfileApi } from "@/lib/api/profile";
import type { UpdateProfileRequest, User } from "@/lib/schemas";
import { fixed, spacing, useColors } from "@/lib/theme";
import { cleanUsername } from "@/lib/username";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

const NAME_MAX = 100;
const BIO_MAX = 1000;
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

/** Edit profile (r6 23), a large-detent sheet. Saves only the fields that changed. */
export default function EditProfileScreen() {
  const profile = useProfile();
  const colors = useColors();
  if (!profile.data) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator color={colors.ink2} />
      </View>
    );
  }
  return <Editor me={profile.data} />;
}

function Editor({ me }: { me: User }) {
  const colors = useColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const updateProfile = useUpdateProfile();
  const { uploadProfilePicture } = useProfileApi();

  const [displayName, setDisplayName] = useState(me.displayName ?? "");
  const [username, setUsername] = useState(me.username ?? "");
  const [bio, setBio] = useState(me.bio ?? "");
  const [photo, setPhoto] = useState<string | null>(me.profilePictureUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<{ field: "username" | "form"; message: string } | null>(null);

  const debouncedUsername = useDebouncedValue(username, 300);
  const availability = useUsernameAvailability(debouncedUsername, me.username);
  const usernameProblem =
    username.length > 0 && username.length < 3
      ? t("editProfile.usernameRule")
      : availability.data && !availability.data.available && debouncedUsername === username
        ? (availability.data.reason ?? null)
        : null;

  const changes: UpdateProfileRequest = {};
  if (displayName.trim() !== (me.displayName ?? "")) changes.displayName = displayName.trim() || null;
  if (username !== (me.username ?? "")) changes.username = username;
  if (bio.trim() !== (me.bio ?? "")) changes.bio = bio.trim() || null;
  if (photo !== me.profilePictureUrl) changes.profilePictureUrl = photo;
  const dirty = Object.keys(changes).length > 0;
  const count = new Intl.NumberFormat(i18n.language);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > PHOTO_MAX_BYTES) return Alert.alert(t("editProfile.photoTooLarge"));
    const type = (["image/jpeg", "image/png", "image/webp"].includes(asset.mimeType ?? "") ? asset.mimeType : "image/jpeg") as ImageContentType;
    setUploading(true);
    try {
      setPhoto(await uploadProfilePicture(asset.uri, type));
    } catch (e) {
      Alert.alert(getErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const photoMenu = () => {
    if (!photo) return pickPhoto();
    Alert.alert(t("editProfile.changePhoto"), undefined, [
      { text: t("editProfile.changePhoto"), onPress: pickPhoto },
      { text: t("editProfile.removePhoto"), style: "destructive", onPress: () => setPhoto(null) },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const save = () => {
    if (!dirty) return router.back();
    if (usernameProblem || !username) return setError({ field: "username", message: usernameProblem ?? t("editProfile.usernameRule") });
    updateProfile.mutate(changes, {
      onSuccess: () => router.back(),
      onError: (e) => {
        const message = getErrorMessage(e);
        setError({ field: /username/i.test(message) ? "username" : "form", message });
      },
    });
  };

  const close = () => {
    if (!dirty) return router.back();
    Alert.alert(t("review.discardTitle"), undefined, [
      { text: t("review.keepEditing"), style: "cancel" },
      { text: t("review.discard"), style: "destructive", onPress: () => router.back() },
    ]);
  };

  const usernameTrailing =
    username && username !== me.username && username.length >= 3 && debouncedUsername === username ? (
      availability.isFetching ? (
        <ActivityIndicator size="small" color={colors.ink3} />
      ) : availability.data?.available ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <SFIcon name="checkmark" size={12} color={colors.pinkInk} weight="semibold" />
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.pinkInk }}>{t("editProfile.available")}</Text>
        </View>
      ) : null
    ) : null;

  return (
    <>
      <Stack.Screen.Title>{t("editProfile.title")}</Stack.Screen.Title>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="xmark" accessibilityLabel={t("editProfile.close")} onPress={close} />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="checkmark"
          variant="prominent"
          tintColor={colors.ink}
          accessibilityLabel={t("editProfile.save")}
          disabled={updateProfile.isPending || uploading}
          onPress={save}
        />
      </Stack.Toolbar>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 8, gap: spacing.lg }}
      >
        <View style={{ alignItems: "center", gap: 10 }}>
          <View>
            <Avatar user={{ ...me, displayName: displayName || me.displayName, profilePictureUrl: photo }} size={96} />
            {uploading && (
              <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", backgroundColor: fixed.dimmer, borderRadius: 6 }}>
                <ActivityIndicator color={fixed.onColor} />
              </View>
            )}
          </View>
          <CapsuleButton
            title={photo ? t("editProfile.changePhoto") : t("editProfile.addPhoto")}
            variant="link"
            size="lg"
            disabled={uploading}
            onPress={photoMenu}
            style={{ minHeight: 36 }}
          />
        </View>

        <TextField
          label={t("editProfile.displayName")}
          value={displayName}
          onChangeText={(v) => setDisplayName(v.slice(0, NAME_MAX))}
          textContentType="name"
          autoComplete="name"
        />
        <TextField
          label={t("editProfile.username")}
          leading="@"
          value={username}
          onChangeText={(v) => {
            setUsername(cleanUsername(v));
            if (error?.field === "username") setError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="username"
          trailing={usernameTrailing}
          error={error?.field === "username" ? error.message : usernameProblem}
          hint={t("editProfile.usernameRule")}
        />
        <View>
          <TextField label={t("editProfile.bio")} value={bio} onChangeText={(v) => setBio(v.slice(0, BIO_MAX))} multiline style={{ minHeight: 88, lineHeight: 24 }} />
          <Text style={{ fontSize: 13, color: colors.ink2, textAlign: "right", marginTop: 6, fontVariant: ["tabular-nums"] }}>
            {t("editProfile.counter", { n: count.format(bio.length), max: BIO_MAX })}
          </Text>
        </View>
        {error?.field === "form" && <Text style={{ fontSize: 13, color: colors.negative }}>{error.message}</Text>}
      </ScrollView>
    </>
  );
}
