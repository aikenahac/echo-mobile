import { Avatar, DisplayText, Stamp } from "@/components/echo";
import { useColors } from "@/lib/theme";
import { Host } from "@expo/ui";
import { Button, Form, HStack, Image, LabeledContent, Picker, RNHostView, Section, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { accessibilityLabel, font, foregroundStyle, listRowBackground, listRowInsets, pickerStyle, scrollContentBackground, tag, tint } from "@expo/ui/swift-ui/modifiers";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useProfileQueriesForSettings } from "./use-settings";

/** Settings (r6 22) as a native grouped Form */
export function SettingsForm() {
  const s = useProfileQueriesForSettings();
  const colors = useColors();
  const { t } = useTranslation();
  const secondary = foregroundStyle({ type: "color", color: colors.ink2 });
  // Rows on the app's surface colour rather than the system grouped grey (dark is designed)
  const rows = [listRowBackground(colors.surface)];

  return (
    <Host style={{ flex: 1, backgroundColor: colors.paper }} seedColor={colors.pinkInk}>
      <Form modifiers={[scrollContentBackground("hidden"), tint(colors.pinkInk)]}>
        {/* The Archivo title scrolls with the form */}
        <Section modifiers={[listRowBackground("transparent"), listRowInsets({ top: 0, leading: 0, bottom: 0, trailing: 0 })]}>
          <RNHostView matchContents>
            <View style={{ paddingTop: 0 }}>
              <DisplayText style={{ color: colors.ink }}>{t("settings.title")}</DisplayText>
            </View>
          </RNHostView>
        </Section>

        <Section modifiers={rows}>
          <Button onPress={s.editProfile}>
            <HStack spacing={14}>
              {s.user && (
                <RNHostView matchContents>
                  <Avatar user={s.user} size={44} />
                </RNHostView>
              )}
              <VStack alignment="leading" spacing={2}>
                <HStack spacing={4}>
                  <Text modifiers={[font({ textStyle: "headline" }), foregroundStyle({ type: "color", color: colors.ink })]}>{s.name}</Text>
                  {s.isAdmin && (
                    <Image
                      systemName="sparkle"
                      size={13}
                      color={colors.ink}
                      modifiers={[accessibilityLabel(t("badges.systemAdmin"))]}
                    />
                  )}
                </HStack>
                <Text modifiers={[font({ textStyle: "subheadline" }), secondary]}>{s.email}</Text>
              </VStack>
              <Spacer />
              <Image systemName="chevron.right" size={13} color={colors.ink3} />
            </HStack>
          </Button>
        </Section>

        <Section title={t("settings.plan")} modifiers={rows}>
          {s.isPremium ? (
            <LabeledContent label={s.planName}>
              {s.lifetime ? (
                <RNHostView matchContents>
                  <View style={{ padding: 4 }}>
                    <Stamp label={t("stamp.lifetime")} size={11} rotate={-3} />
                  </View>
                </RNHostView>
              ) : (
                <Text modifiers={[secondary]}> </Text>
              )}
            </LabeledContent>
          ) : (
            <LabeledContent label={t("settings.plan")}>
              <Text modifiers={[secondary]}>{t("settings.free")}</Text>
            </LabeledContent>
          )}
          {s.planDate && (
            <LabeledContent label={s.planDate.label}>
              <Text modifiers={[secondary]}>{s.planDate.value}</Text>
            </LabeledContent>
          )}
          {s.isPremium ? (
            s.canManageBilling && <LinkRow title={t("settings.billing")} onPress={s.billing} accent />
          ) : (
            <LinkRow title={t("settings.getPremium")} onPress={s.getPremium} accent />
          )}
        </Section>

        <Section title={t("settings.app")} modifiers={rows}>
          <Picker label={t("settings.appearance")} selection={s.themeMode} onSelectionChange={(v) => s.setThemeMode(v as typeof s.themeMode)} modifiers={[pickerStyle("menu"), tint(colors.ink2)]}>
            <Text modifiers={[tag("system")]}>{t("settings.appearanceSystem")}</Text>
            <Text modifiers={[tag("light")]}>{t("settings.appearanceLight")}</Text>
            <Text modifiers={[tag("dark")]}>{t("settings.appearanceDark")}</Text>
          </Picker>
          <Picker label={t("settings.language")} selection="en" modifiers={[pickerStyle("menu"), tint(colors.ink2)]}>
            <Text modifiers={[tag("en")]}>{t("settings.english")}</Text>
          </Picker>
          <Picker label={t("settings.libraryLayout")} selection={s.layout} onSelectionChange={(v) => s.setLayout(v as typeof s.layout)} modifiers={[pickerStyle("menu"), tint(colors.ink2)]}>
            <Text modifiers={[tag("grid")]}>{t("settings.grid")}</Text>
            <Text modifiers={[tag("list")]}>{t("settings.list")}</Text>
          </Picker>
        </Section>

        <Section modifiers={rows}>
          <Button onPress={s.blockedUsers}>
            <HStack>
              <Text modifiers={[foregroundStyle({ type: "color", color: colors.ink })]}>{t("settings.blockedUsers")}</Text>
              <Spacer />
              <Image systemName="chevron.right" size={13} color={colors.ink3} />
            </HStack>
          </Button>
          <LinkRow title={t("settings.terms")} onPress={s.terms} />
          <LinkRow title={t("settings.privacy")} onPress={s.privacy} />
        </Section>

        <Section modifiers={rows} footer={<Text modifiers={[font({ textStyle: "footnote" }), secondary]}>{s.version}</Text>}>
          <Button label={t("settings.signOut")} onPress={s.signOut} modifiers={[foregroundStyle({ type: "color", color: colors.ink })]} />
          <Button label={t("settings.deleteAccount")} role="destructive" onPress={s.deleteAccount} />
        </Section>
      </Form>
    </Host>
  );
}

/** A row that opens a page on echoreads.app: the title and an outward arrow */
function LinkRow({ title, onPress, accent }: { title: string; onPress: () => void; accent?: boolean }) {
  const colors = useColors();
  const color = accent ? colors.pinkInk : colors.ink;
  return (
    <Button onPress={onPress}>
      <HStack>
        <Text modifiers={[foregroundStyle({ type: "color", color })]}>{title}</Text>
        <Spacer />
        <Image systemName="arrow.up.right" size={14} color={accent ? colors.pinkInk : colors.ink2} />
      </HStack>
    </Button>
  );
}
