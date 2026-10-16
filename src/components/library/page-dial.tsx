import { PlateNumber } from "@/components/echo";
import { motion, useColors } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PixelRatio, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedReaction,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { PageWheels } from "./page-wheels";

/** Points of drag per page */
const PT_PER_PAGE = 6;
/** Past the ends, the drag resists like a rubber band */
const RUBBER = 0.35;

type Props = {
  page: number;
  /** Unknown total: no upper bound, no finishing */
  total: number | null;
  size: number;
  /** A settled page from the drag (already clamped and rounded) */
  onCommit: (page: number) => void;
  /** Tap: open the sheet to type the page */
  onTap: () => void;
  /** The drag started or ended (the screen stops scrolling while the number is held) */
  onDragChange?: (active: boolean) => void;
};

/** Wheel count for a page; runs on both threads */
function placesOf(n: number) {
  "worklet";
  return Math.max(1, String(Math.max(0, Math.floor(n))).length);
}

function hapticTick(page: number) {
  Haptics.selectionAsync();
  if (page % 10 === 0) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * The numbering stamp (DIRECTION.md § Signature): drag the page number up or down and
 * its digit wheels roll; every page ticks, every tenth knocks; release springs to the
 * nearest page and commits it. Tap to type a page instead.
 */
export function PageDial({ page, total, size, onCommit, onTap, onDragChange }: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  // Wheels have fixed geometry; let them grow a little with Dynamic Type like the other numerals
  const scaled = Math.round(size * Math.min(PixelRatio.getFontScale(), 1.2));

  const value = useSharedValue(page);
  const start = useSharedValue(page);
  const dragging = useSharedValue(false);
  const [places, setPlaces] = useState(placesOf(page));

  // Follow outside changes (stepper, sheet, refetch) with a short roll, unless the finger is on it
  useEffect(() => {
    if (dragging.get()) return;
    value.set(reduced ? page : withSpring(page, motion.settle));
  }, [page, reduced, dragging, value]);

  // A tick per whole page crossed while dragging; wheel count follows the digits
  useAnimatedReaction(
    () => Math.round(value.get()),
    (current, previous) => {
      if (previous !== null && current !== previous && dragging.get()) scheduleOnRN(hapticTick, current);
      if (previous === null || placesOf(current) !== placesOf(previous)) scheduleOnRN(setPlaces, placesOf(current));
    },
  );

  const max = total ?? 100_000;

  const pan = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .failOffsetX([-20, 20])
    .onBegin(() => {
      start.set(value.get());
    })
    .onStart(() => {
      dragging.set(true);
      if (onDragChange) scheduleOnRN(onDragChange, true);
    })
    .onUpdate((e) => {
      // Pushing up counts forward
      let next = start.get() - e.translationY / PT_PER_PAGE;
      if (next < 0) next = next * RUBBER;
      if (next > max) next = max + (next - max) * RUBBER;
      value.set(next);
    })
    // Finalize runs whether the pan ended or was cancelled (e.g. by the scroll view): settle either way
    .onFinalize(() => {
      if (!dragging.get()) return;
      dragging.set(false);
      const settled = Math.min(max, Math.max(0, Math.round(value.get())));
      value.set(withSpring(settled, motion.settle));
      scheduleOnRN(onCommit, settled);
      if (onDragChange) scheduleOnRN(onDragChange, false);
    });

  const tap = Gesture.Tap().onEnd((_e, success) => {
    if (success) scheduleOnRN(onTap);
  });

  const gesture = Gesture.Exclusive(pan, tap);

  return (
    <GestureDetector gesture={gesture}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={t("library.pageDial")}
        accessibilityValue={total ? { min: 0, max: total, now: page } : { text: String(page) }}
        accessibilityHint={t("library.pageDialHint")}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }, { name: "activate" }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === "increment") onCommit(Math.min(max, page + 1));
          if (e.nativeEvent.actionName === "decrement") onCommit(Math.max(0, page - 1));
          if (e.nativeEvent.actionName === "activate") onTap();
        }}
        style={{ alignSelf: "flex-start" }}
      >
        {reduced ? (
          // Reduced motion: no rolling, the number cross-fades
          <Animated.View key={page} entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)}>
            <PlateNumber value={page} size={size} color={colors.onField} maxFontSizeMultiplier={1.2} style={{ marginLeft: -4 }} />
          </Animated.View>
        ) : (
          <PageWheels page={value} places={places} size={scaled} color={colors.onField} plateColor={colors.plate} />
        )}
        <View style={{ height: 2, backgroundColor: colors.onField, marginTop: 12 }} />
      </View>
    </GestureDetector>
  );
}
