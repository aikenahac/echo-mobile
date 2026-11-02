import { SFIcon, Stamp } from "@/components/echo";
import type { ReadingStatus } from "@/lib/schemas";
import { fixed, fonts, motion, useColors } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const STATUSES: Array<ReadingStatus> = ["want", "reading", "finished"];
const EDGE = 16;
/** The chosen stamp shows inked this long before the ribbon folds back into the cover */
const HOLD = 160;
/** A stamp that remounts (the screen swaps field and paper) still lands within this long of a pick */
const LAND_WINDOW = 1200;

let pickedAt = 0;

type Anchor = { x: number; y: number; width: number; height: number };
type Segment = { x: number; width: number };

type Props = {
  /** null: not in your library — the ribbon adds it instead */
  status: ReadingStatus | null;
  onChange: (status: ReadingStatus) => void;
};

/**
 * The status as an ink stamp on the cover. Tapping it unfolds the stamp into a ribbon of
 * all three, the current one inked where the stamp was. Picking one inks it, the ribbon
 * folds back, and the new stamp lands on the cover.
 * A book that isn't in your library gets "Add to library", which opens the same ribbon.
 */
export function StatusStampMenu({ status, onChange }: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const screen = useWindowDimensions();
  const trigger = useRef<View>(null);

  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<ReadingStatus | null>(status);
  const [ribbon, setRibbon] = useState<{ width: number; height: number } | null>(null);
  const [segments, setSegments] = useState<Partial<Record<ReadingStatus, Segment>>>({});
  const progress = useSharedValue(0);

  // The landing: the new stamp comes down onto the cover and stops dead
  const land = useSharedValue(1);
  const lastStatus = useRef(status);
  useEffect(() => {
    const changed = lastStatus.current !== status;
    lastStatus.current = status;
    if (!status || (!changed && Date.now() - pickedAt > LAND_WINDOW)) return;
    pickedAt = 0;
    land.set(0);
    land.set(withTiming(1, { duration: motion.stamp, easing: reduced ? Easing.linear : Easing.in(Easing.quad) }));
    const thunk = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), reduced ? 0 : motion.stamp);
    return () => clearTimeout(thunk);
  }, [status, land, reduced]);

  const stampStyle = useAnimatedStyle(() => {
    const p = land.get();
    if (reduced) return { opacity: p };
    return { opacity: Math.min(1, p * 2), transform: [{ scale: 1.25 - 0.25 * p }, { rotate: `${-6 * (1 - p)}deg` }] };
  });

  const show = () => {
    trigger.current?.measureInWindow((x, y, width, height) => {
      Haptics.selectionAsync();
      setChosen(status);
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  const unfold = () => {
    progress.set(reduced ? withTiming(1, { duration: motion.stamp }) : withSpring(1, { duration: 280, dampingRatio: 0.8 }));
  };

  /** Fold the ribbon back into the stamp, then report the pick (so the stamp lands as it closes) */
  const fold = (next?: ReadingStatus) => {
    const finish = () => {
      setOpen(false);
      setAnchor(null);
      setRibbon(null);
      if (next) {
        pickedAt = Date.now();
        onChange(next);
      }
    };
    progress.set(withTiming(0, { duration: reduced ? 120 : 160 }, (done) => done && scheduleOnRN(finish)));
  };

  const pick = (next: ReadingStatus) => {
    if (next === status) return fold();
    Haptics.selectionAsync();
    setChosen(next);
    setTimeout(() => fold(next), HOLD);
  };

  // The current segment sits exactly where the stamp was; with nothing current, the ribbon starts at it
  const current = status ? segments[status] : undefined;
  const placed = !!ribbon && (!status || !!current);
  const a = anchor ?? { x: 0, y: 0, width: 0, height: 0 };
  const width = ribbon?.width ?? 0;
  const left = Math.min(Math.max(a.x - (current?.x ?? 0), EDGE), screen.width - width - EDGE);
  const top = a.y + a.height / 2 - (ribbon?.height ?? 0) / 2;
  const origin = current ? current.x + current.width / 2 : 0;

  const ribbonStyle = useAnimatedStyle(() => {
    const p = progress.get();
    return {
      opacity: p,
      transform: reduced ? [] : [{ scaleX: 0.6 + 0.4 * p }, { scaleY: 0.85 + 0.15 * p }],
    };
  });
  const dimStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));

  return (
    <>
      <Pressable
        ref={trigger}
        onPress={show}
        accessibilityRole="button"
        accessibilityLabel={status ? t("book.statusMenu", { status: t(`book.status.${status}`) }) : t("book.addToLibrary")}
        // The ribbon takes the stamp's place while it's open
        style={({ pressed }) => ({ opacity: open ? 0 : pressed ? 0.7 : 1 })}
      >
        {status ? (
          <Animated.View style={[{ padding: 6 }, stampStyle]}>
            <Stamp label={t(`stamp.${status}`)} size={22} rotate={-6} trailing={<SFIcon name="chevron.down" size={12} weight="bold" color={colors.ink} />} />
          </Animated.View>
        ) : (
          <View
            style={{
              height: 44,
              paddingHorizontal: 16,
              borderRadius: 22,
              backgroundColor: colors.ink,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <SFIcon name="plus" size={15} color={colors.paper} weight="semibold" />
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.paper }}>{t("book.addToLibrary")}</Text>
          </View>
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={() => fold()}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => fold()} accessibilityLabel={t("common.cancel")}>
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: fixed.dimmer }, dimStyle]} />
        </Pressable>
        <Animated.View
          accessibilityRole="radiogroup"
          accessibilityViewIsModal
          onAccessibilityEscape={() => fold()}
          onLayout={(e) => {
            if (ribbon) return;
            setRibbon({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
            unfold();
          }}
          style={[
            {
              position: "absolute",
              top,
              left,
              flexDirection: "row",
              alignItems: "center",
              padding: 6,
              borderRadius: 999,
              backgroundColor: colors.surface,
              boxShadow: colors.floatShadow,
              transformOrigin: `${origin}px 50%`,
            },
            // Measured first, shown once the current stamp can sit over the cover's
            placed ? ribbonStyle : { opacity: 0 },
          ]}
        >
          {STATUSES.map((s) => (
            <RibbonStamp
              key={s}
              label={t(`stamp.${s}`)}
              accessibilityLabel={t(`book.status.${s}`)}
              inked={s === chosen}
              onLayout={(segment) => setSegments((all) => (all[s]?.x === segment.x ? all : { ...all, [s]: segment }))}
              onPress={() => pick(s)}
            />
          ))}
        </Animated.View>
      </Modal>
    </>
  );
}

/** One stamp in the ribbon: the inked one is a real stamp (ink plate, double rule, tilted), the others are just its word */
function RibbonStamp({
  label,
  accessibilityLabel,
  inked,
  onLayout,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  inked: boolean;
  onLayout: (segment: Segment) => void;
  onPress: () => void;
}) {
  const colors = useColors();
  const reduced = useReducedMotion();
  // Inking hits the stamp down: it starts a little large and level, then settles at its tilt
  const hit = useSharedValue(1);
  const wasInked = useRef(inked);
  useEffect(() => {
    if (inked && !wasInked.current && !reduced) {
      hit.set(0);
      hit.set(withSpring(1, { duration: 240, dampingRatio: 0.6 }));
    }
    wasInked.current = inked;
  }, [inked, hit, reduced]);

  const stampStyle = useAnimatedStyle(() => {
    const p = hit.get();
    return { transform: [{ scale: 1.15 - 0.15 * p }, { rotate: inked ? `${-3 * p}deg` : "0deg" }] };
  });

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: inked }}
      onPress={onPress}
      onLayout={(e) => onLayout({ x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width })}
      android_ripple={{ color: colors.rule, borderless: true }}
      style={({ pressed }) => ({ height: 40, paddingHorizontal: 4, justifyContent: "center", opacity: pressed && !inked ? 0.6 : 1 })}
    >
      <Animated.View
        style={[
          {
            height: 30,
            paddingHorizontal: 10,
            justifyContent: "center",
            borderRadius: 2,
            backgroundColor: inked ? colors.ink : "transparent",
            outlineWidth: inked ? 1.5 : 0,
            outlineColor: colors.ink,
            outlineOffset: 2,
            outlineStyle: "solid",
          },
          stampStyle,
        ]}
      >
        <Text
          allowFontScaling={false}
          style={{ fontFamily: fonts.display, fontSize: 17, lineHeight: 19, letterSpacing: 0.5, color: inked ? colors.paper : colors.ink2 }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
