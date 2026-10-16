import { Cover, DisplayText, PlateNumber, SFIcon, Stamp } from "@/components/echo";
import { bookTotal } from "@/lib/books";
import type { UserBook } from "@/lib/schemas";
import { motion, useColors } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

/** When the hero gives way to "Rate it" */
const RATE_AT = 700;
/** How long Undo stays */
export const UNDO_MS = 5000;

type Props = {
  /** The entry as it was when it finished (the cache has already moved it to Finished) */
  userBook: UserBook;
  onRate: (rating: number) => void;
  onUndo: () => void;
};

/**
 * The last page (DIRECTION.md § Signature, frames 3–4): the FINISHED stamp lands on the
 * cover, the pink field drains down to paper (the book leaves "now"), and five ink stars
 * rise: "Rate it". Undo for five seconds.
 */
export function FinishedMoment({ userBook, onRate, onUndo }: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const total = bookTotal(userBook, userBook.book) ?? userBook.currentPage ?? 0;

  const [rating, setRating] = useState<number | null>(userBook.rating);
  const [undoable, setUndoable] = useState(true);

  // The stamp lands: rigid knock on contact, then success
  const stamp = useSharedValue(0);
  useEffect(() => {
    stamp.set(withTiming(1, { duration: motion.stamp, easing: EASE_OUT }));
    const land = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 120);
    }, motion.stamp);
    const undo = setTimeout(() => setUndoable(false), UNDO_MS);
    return () => {
      clearTimeout(land);
      clearTimeout(undo);
    };
  }, [stamp]);

  const stampStyle = useAnimatedStyle(() => ({
    opacity: stamp.get(),
    transform: reduced ? [] : [{ scale: 1.25 - 0.25 * stamp.get() }],
  }));

  // The page number column steps aside for "Rate it"
  const numberOut = useSharedValue(0);
  useEffect(() => {
    numberOut.set(withDelay(RATE_AT, withTiming(1, { duration: 200, easing: EASE_OUT })));
  }, [numberOut]);
  const numberStyle = useAnimatedStyle(() => ({ opacity: 1 - numberOut.get() }));

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 20, marginTop: 24 }}>
        <Cover uri={userBook.book.coverUrl} title={userBook.book.title} author={userBook.book.author} width={140}>
          <View pointerEvents="none" style={{ position: "absolute", inset: -24, alignItems: "center", justifyContent: "center" }}>
            <Animated.View style={stampStyle}>
              <Stamp label={t("stamp.finished")} size={34} rotate={-7} />
            </Animated.View>
          </View>
        </Cover>
        <Animated.View style={[{ flex: 1 }, numberStyle]} importantForAccessibility="no-hide-descendants">
          <PlateNumber value={total} size={120} color={colors.ink} maxFontSizeMultiplier={1.2} style={{ marginLeft: -4 }} />
          <View style={{ height: 2, backgroundColor: colors.ink, marginTop: 12 }} />
          <Text style={{ fontSize: 17, fontWeight: "600", letterSpacing: -0.3, color: colors.ink, marginTop: 12 }}>
            {t("library.ofPages", { count: total })}
          </Text>
        </Animated.View>
      </View>

      <Rise delay={RATE_AT + 80} reduced={reduced}>
        <DisplayText numberOfLines={2} style={{ color: colors.ink, marginTop: 28 }} accessibilityRole="header">
          {t("library.finished.rate", { title: userBook.book.title })}
        </DisplayText>
      </Rise>

      <View accessibilityRole="adjustable" accessibilityLabel={t("library.finished.rateLabel")} style={{ flexDirection: "row", gap: 14, marginTop: 18 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Rise key={n} delay={RATE_AT + 160 + n * 60} reduced={reduced}>
            <Pressable
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={t("library.finished.stars", { count: n })}
              accessibilityState={{ selected: (rating ?? 0) >= n }}
              onPress={() => {
                Haptics.selectionAsync();
                setRating(n);
                onRate(n);
              }}
            >
              <SFIcon name={(rating ?? 0) >= n ? "star.fill" : "star"} size={32} weight="regular" color={colors.ink} />
            </Pressable>
          </Rise>
        ))}
      </View>

      <Rise delay={RATE_AT + 560} reduced={reduced}>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 24, minHeight: 44 }}>
          <Text style={{ fontSize: 17, color: colors.ink2 }}>{t("library.finished.moved")}</Text>
          {undoable && (
            <>
              <Text style={{ fontSize: 17, color: colors.ink2 }}> · </Text>
              <Pressable accessibilityRole="button" hitSlop={10} onPress={onUndo}>
                <Text style={{ fontSize: 17, fontWeight: "600", color: colors.pinkInk }}>{t("library.finished.undo")}</Text>
              </Pressable>
            </>
          )}
        </View>
      </Rise>
    </View>
  );
}

/** Fades in and rises 12pt after a delay; reduced motion: fade only */
function Rise({ delay, reduced, children }: { delay: number; reduced: boolean; children: ReactNode }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(withDelay(delay, withTiming(1, { duration: 260, easing: EASE_OUT })));
  }, [delay, p]);
  const style = useAnimatedStyle(() => ({
    opacity: p.get(),
    transform: reduced ? [] : [{ translateY: (1 - p.get()) * 12 }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

/**
 * The pink field drains down to paper behind its content (400ms): the book leaves "now".
 * Reduced motion: the field cross-fades instead.
 */
export function DrainingField({ children, style }: { children: ReactNode; style?: object }) {
  const colors = useColors();
  const reduced = useReducedMotion();
  const [height, setHeight] = useState(0);
  const drain = useSharedValue(0);

  useEffect(() => {
    if (!height) return;
    drain.set(
      withDelay(
        motion.stamp,
        reduced
          ? withTiming(1, { duration: motion.drain, easing: EASE_IN_OUT })
          : withSpring(1, { duration: motion.drain, dampingRatio: 1 }),
      ),
    );
  }, [drain, height, reduced]);

  const layer = useAnimatedStyle(() =>
    reduced ? { opacity: 1 - drain.get() } : { transform: [{ translateY: drain.get() * height }] },
  );

  return (
    <View style={[{ backgroundColor: colors.paper, overflow: "hidden" }, style]} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      <Animated.View pointerEvents="none" style={[{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.field }, layer]} />
      {children}
    </View>
  );
}
