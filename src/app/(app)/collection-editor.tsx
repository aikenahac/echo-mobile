import { CapsuleButton, NativeSwitch, SFIcon, TextField } from "@/components/echo";
import { useCollections, useCreateCollection, useDeleteCollection, useUpdateCollection } from "@/hooks/api/collections/use-collections";
import { useLibrary } from "@/hooks/api/library/use-library";
import { queryKeys } from "@/hooks/query-keys";
import { isPaywallError } from "@/hooks/use-premium-gate";
import { useCollectionsApi } from "@/lib/api/collections";
import { getErrorMessage } from "@/lib/api/errors";
import type { ImageContentType } from "@/lib/api/profile";
import { COLLECTION_ICONS, RECENT_ICONS } from "@/lib/collection-icons";
import { collectionColor, lucideExportName, RISO_SWATCHES } from "@/lib/collection-style";
import { findUserBook } from "@/lib/library-cache";
import type { Collection } from "@/lib/schemas";
import { radius, spacing, useColors } from "@/lib/theme";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import * as lucide from "lucide-react-native/icons";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";

const ICONS = lucide as unknown as Record<string, LucideIcon | undefined>;
const NAME_MAX = 100;
const DESCRIPTION_MAX = 1000;
const COVER_MAX_BYTES = 5 * 1024 * 1024;

/**
 * The collection editor (r6 19), a large-detent sheet that also serves New collection.
 * Params: `id` to edit; `addUserBookId` to add that book once a new collection exists.
 */
export default function CollectionEditorScreen() {
  const { id, addUserBookId } = useLocalSearchParams<{ id?: string; addUserBookId?: string }>();
  const collections = useCollections();
  const colors = useColors();
  const existing = id ? collections.data?.find((c) => c.id === id) : undefined;

  if (id && !existing) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator color={colors.ink2} />
      </View>
    );
  }
  return <Editor existing={existing} addUserBookId={addUserBookId} />;
}

function Editor({ existing, addUserBookId }: { existing?: Collection; addUserBookId?: string }) {
  const colors = useColors();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const library = useLibrary();
  const create = useCreateCollection();
  const update = useUpdateCollection();
  const remove = useDeleteCollection();
  const { addBook, uploadCover } = useCollectionsApi();
  const queryClient = useQueryClient();

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [colorTag, setColorTag] = useState(existing?.colorTag ?? RISO_SWATCHES[5].tag);
  const [iconName, setIconName] = useState(existing?.iconName ?? "book");
  const [isPublic, setPublic] = useState(existing?.isPublic ?? false);
  // A picked image waits for the save (a new collection needs an id before uploading)
  const [cover, setCover] = useState<{ uri: string; type: ImageContentType } | null>(null);
  const [coverRemoved, setCoverRemoved] = useState(false);
  const [showAllIcons, setShowAllIcons] = useState(false);
  const [iconQuery, setIconQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accent = collectionColor(colorTag);
  const coverUri = cover?.uri ?? (coverRemoved ? null : existing?.coverImageUrl);
  const count = new Intl.NumberFormat(i18n.language);

  const quickIcons = useMemo(() => [iconName, ...RECENT_ICONS.filter((n) => n !== iconName)].slice(0, 5), [iconName]);
  const allIcons = useMemo(() => {
    const q = iconQuery.trim().toLowerCase();
    return COLLECTION_ICONS.filter((n) => !q || n.includes(q));
  }, [iconQuery]);

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [16, 9], quality: 0.8 });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > COVER_MAX_BYTES) return Alert.alert(t("editProfile.photoTooLarge"));
    const type = (["image/jpeg", "image/png", "image/webp"].includes(asset.mimeType ?? "") ? asset.mimeType : "image/jpeg") as ImageContentType;
    setCover({ uri: asset.uri, type });
    setCoverRemoved(false);
  };

  const coverMenu = () => {
    if (!coverUri) return pickCover();
    Alert.alert(t("collections.changeCover"), undefined, [
      { text: t("collections.changeCover"), onPress: pickCover },
      { text: t("collections.removeCover"), style: "destructive", onPress: () => (setCover(null), setCoverRemoved(true)) },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) return setError(t("collections.nameRequired"));
    setSaving(true);
    try {
      const fields = { name: trimmed, description: description.trim() || null, colorTag, iconName, isPublic };
      let id = existing?.id;
      if (id) {
        await update.mutateAsync({ id, ...fields, ...(coverRemoved ? { coverImageUrl: null } : {}) });
      } else {
        id = (await create.mutateAsync(fields)).id;
        if (addUserBookId) await addBook(id, addUserBookId);
      }
      if (cover) {
        const url = await uploadCover(id, cover.uri, cover.type);
        await update.mutateAsync({ id, coverImageUrl: url });
      }
      // The book and cover were added after the create/update had already refreshed
      await queryClient.invalidateQueries({ queryKey: queryKeys.collections });
      router.back();
    } catch (e) {
      if (isPaywallError(e)) return router.replace("/premium");
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert(t("collections.deleteTitle", { name: existing.name }), t("collections.deleteBody"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("collections.delete"),
        style: "destructive",
        onPress: () =>
          remove.mutate(existing.id, {
            // Close the editor and the collection it sat on
            onSuccess: () => router.dismissTo("/library"),
            onError: (e) => Alert.alert(getErrorMessage(e)),
          }),
      },
    ]);
  };

  const addingTitle = addUserBookId ? findUserBook(library.data, addUserBookId)?.book.title : undefined;

  return (
    <>
      <Stack.Screen.Title>{existing ? t("collections.editTitle") : t("collections.newTitle")}</Stack.Screen.Title>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="xmark" accessibilityLabel={t("editProfile.close")} onPress={() => router.back()} />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="checkmark" variant="prominent" tintColor={colors.ink} accessibilityLabel={t("common.save")} disabled={saving} onPress={save} />
      </Stack.Toolbar>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 8, gap: spacing.lg, paddingBottom: 48 }}
      >
        <Pressable accessibilityRole="button" onPress={coverMenu} style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: radius.field,
              borderCurve: "continuous",
              borderWidth: coverUri ? 0 : 1.5,
              borderStyle: "dashed",
              borderColor: colors.ink3,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {coverUri ? <Image source={{ uri: coverUri }} style={{ width: 72, height: 72 }} contentFit="cover" /> : <SFIcon name="photo" size={22} color={colors.ink2} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", color: colors.pinkInk }}>
              {coverUri ? t("collections.changeCover") : t("collections.addCover")}
            </Text>
            <Text style={{ fontSize: 13, color: colors.ink2, marginTop: 2 }}>{t("collections.coverHint")}</Text>
          </View>
        </Pressable>

        <TextField
          label={t("collections.name")}
          value={name}
          onChangeText={(v) => {
            setName(v.slice(0, NAME_MAX));
            setError(null);
          }}
          autoFocus={!existing}
          error={error}
          hint={addingTitle ? `+ ${addingTitle}` : undefined}
        />
        <View>
          <TextField
            label={t("collections.description")}
            value={description}
            onChangeText={(v) => setDescription(v.slice(0, DESCRIPTION_MAX))}
            multiline
            style={{ minHeight: 72, lineHeight: 24 }}
          />
          <Text style={{ fontSize: 13, color: colors.ink2, textAlign: "right", marginTop: 6, fontVariant: ["tabular-nums"] }}>
            {t("editProfile.counter", { n: count.format(description.length), max: DESCRIPTION_MAX })}
          </Text>
        </View>

        <View>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.ink2 }}>{t("collections.colour")}</Text>
          <View accessibilityRole="radiogroup" style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 5, marginTop: 12 }}>
            {RISO_SWATCHES.map((s) => {
              const selected = collectionColor(colorTag) === s.hex;
              return (
                <Pressable
                  key={s.key}
                  accessibilityRole="radio"
                  accessibilityLabel={t(`collections.colourNames.${s.key}`)}
                  accessibilityState={{ selected }}
                  onPress={() => setColorTag(s.tag)}
                  hitSlop={4}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: s.hex,
                    boxShadow: selected ? `0 0 0 3px ${colors.paper}, 0 0 0 5px ${colors.ink}` : undefined,
                  }}
                />
              );
            })}
          </View>
        </View>

        <View>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.ink2 }}>{t("collections.icon")}</Text>
          {showAllIcons && (
            <TextField
              containerStyle={{ marginTop: 10 }}
              placeholder={t("collections.searchIcons")}
              value={iconQuery}
              onChangeText={setIconQuery}
              autoCapitalize="none"
              autoCorrect={false}
              leading={<SFIcon name="magnifyingglass" size={16} color={colors.ink3} />}
            />
          )}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {(showAllIcons ? allIcons : quickIcons).map((n) => (
              <IconChoice key={n} name={n} selected={n === iconName} accent={accent} onPress={() => setIconName(n)} />
            ))}
            {!showAllIcons && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowAllIcons(true)}
                style={{ height: 44, paddingHorizontal: 14, borderRadius: 10, backgroundColor: colors.tint, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.ink }}>{t("collections.moreIcons")}</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 52,
              paddingHorizontal: 16,
              borderRadius: radius.field + 4,
              borderCurve: "continuous",
              backgroundColor: colors.surface,
              borderWidth: 0.5,
              borderColor: colors.rule,
            }}
          >
            <Text style={{ fontSize: 17, color: colors.ink }}>{t("collections.public")}</Text>
            <NativeSwitch value={isPublic} onValueChange={setPublic} accessibilityLabel={t("collections.public")} />
          </View>
          <Text style={{ fontSize: 13, lineHeight: 18, color: colors.ink2, marginTop: 8, paddingHorizontal: 16 }}>{t("collections.publicHint")}</Text>
        </View>

        {existing && (
          <CapsuleButton title={t("collections.delete")} variant="plain" destructive onPress={confirmDelete} style={{ alignSelf: "center", marginTop: 16 }} />
        )}
        {saving && <ActivityIndicator color={colors.ink2} />}
      </ScrollView>
    </>
  );
}

function IconChoice({ name, selected, accent, onPress }: { name: string; selected: boolean; accent: string; onPress: () => void }) {
  const colors = useColors();
  const Icon = ICONS[lucideExportName(name)] ?? ICONS.Book!;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={name.replace(/-/g, " ")}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        borderCurve: "continuous",
        backgroundColor: selected ? accent : colors.tint,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={22} color={selected ? "#FFFFFF" : colors.ink} strokeWidth={1.8} />
    </Pressable>
  );
}
