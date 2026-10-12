import { CapsuleButton, DisplayText, TextField } from "@/components/echo";
import { bookTotal } from "@/lib/books";
import type { UserBook } from "@/lib/schemas";
import { spacing, useColors } from "@/lib/theme";
import { BottomSheet, Host, RNHostView } from "@expo/ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, useWindowDimensions, View } from "react-native";

type Props = {
  userBook: UserBook | undefined;
  isPresented: boolean;
  onDismiss: () => void;
  /** One call: pageCount is applied first */
  onSave: (change: { currentPage: number; pageCount?: number }) => void;
};

/** Tap the page number: type the current page, and correct the page count for your edition */
export function PageSheet({ userBook, isPresented, onDismiss, onSave }: Props) {
  return (
    <Host style={{ position: "absolute", width: 0, height: 0 }}>
      <BottomSheet isPresented={isPresented} onDismiss={onDismiss} contentPadding={0}>
        <RNHostView matchContents>
          {/* Remount per opening so the fields start from the current values */}
          {isPresented && userBook ? <PageForm userBook={userBook} onDone={onDismiss} onSave={onSave} /> : <View />}
        </RNHostView>
      </BottomSheet>
    </Host>
  );
}

function PageForm({ userBook, onDone, onSave }: { userBook: UserBook; onDone: () => void; onSave: Props["onSave"] }) {
  const colors = useColors();
  const { t } = useTranslation();
  // RNHostView sizes to its content, so fill the sheet's width explicitly
  const { width } = useWindowDimensions();
  const total = bookTotal(userBook, userBook.book);
  const [page, setPage] = useState(String(userBook.currentPage ?? 0));
  const [count, setCount] = useState(total ? String(total) : "");

  const pageNumber = Number(page) || 0;
  const countNumber = Number(count) || 0;
  const tooHigh = countNumber > 0 && pageNumber > countNumber;

  const save = () => {
    if (tooHigh) return;
    const pageCountChanged = countNumber > 0 && countNumber !== total;
    onSave({ currentPage: pageNumber, pageCount: pageCountChanged ? countNumber : undefined });
    onDone();
  };

  return (
    <View style={{ width, padding: spacing.lg, paddingTop: 28, gap: spacing.lg }}>
      <DisplayText variant="sectionHead" style={{ color: colors.ink }}>
        {t("library.pageSheet.title")}
      </DisplayText>
      <View style={{ flexDirection: "row", gap: spacing.md }}>
        <TextField
          containerStyle={{ flex: 1 }}
          label={t("library.pageSheet.currentPage")}
          value={page}
          onChangeText={(v) => setPage(v.replace(/\D/g, "").slice(0, 6))}
          keyboardType="number-pad"
          autoFocus
          selectTextOnFocus
          error={tooHigh ? t("library.pageSheet.tooHigh") : null}
          style={{ fontVariant: ["tabular-nums"] }}
        />
        <TextField
          containerStyle={{ flex: 1 }}
          label={t("library.pageSheet.pageCount")}
          value={count}
          onChangeText={(v) => setCount(v.replace(/\D/g, "").slice(0, 6))}
          keyboardType="number-pad"
          style={{ fontVariant: ["tabular-nums"] }}
        />
      </View>
      <Text style={{ fontSize: 13, lineHeight: 18, color: colors.ink2, marginTop: -8 }}>{t("library.pageSheet.pageCountHint")}</Text>
      <CapsuleButton title={t("library.pageSheet.save")} disabled={tooHigh} onPress={save} />
    </View>
  );
}
