import { useColors } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, Text, useWindowDimensions, View } from "react-native";
import { SFIcon } from "./sf-icon";

type Anchor = { x: number; y: number; width: number; height: number };

const GAP = 6;
const EDGE = 12;

/**
 * The sparkle after a system administrator's name. There's no hover on a phone, so
 * a tap shows the "System Administrator" tooltip above it; any tap (or 2.5s) hides it.
 * Pass the name's colour on the field.
 */
export function AdminBadge({ size = 13, color }: { size?: number; color?: string }) {
  const colors = useColors();
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const ref = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [bubbleWidth, setBubbleWidth] = useState(0);
  const label = t("badges.systemAdmin");

  useEffect(() => {
    if (!anchor) return;
    const timer = setTimeout(() => setAnchor(null), 2500);
    return () => clearTimeout(timer);
  }, [anchor]);

  const show = () => {
    ref.current?.measureInWindow((x, y, width, height) => {
      Haptics.selectionAsync();
      setBubbleWidth(0);
      setAnchor({ x, y, width, height });
    });
  };

  // Above the sparkle, centred on it and kept inside the screen; below when there's no room
  const centre = anchor ? anchor.x + anchor.width / 2 : 0;
  const left = Math.min(Math.max(centre - bubbleWidth / 2, EDGE), screenWidth - bubbleWidth - EDGE);
  const below = !!anchor && anchor.y < 64;
  const top = anchor ? (below ? anchor.y + anchor.height + GAP : anchor.y - GAP - 30) : 0;

  return (
    <>
      <Pressable
        ref={ref}
        onPress={show}
        hitSlop={10}
        accessibilityRole="image"
        accessibilityLabel={label}
        style={{ paddingHorizontal: 2 }}
      >
        <SFIcon name="sparkle" size={size} color={color ?? colors.ink} weight="semibold" />
      </Pressable>
      <Modal visible={!!anchor} transparent animationType="fade" onRequestClose={() => setAnchor(null)}>
        <Pressable style={{ flex: 1 }} onPress={() => setAnchor(null)} accessibilityLabel={label}>
          <View
            onLayout={(e) => setBubbleWidth(e.nativeEvent.layout.width)}
            style={{
              position: "absolute",
              top,
              left,
              opacity: bubbleWidth ? 1 : 0,
              height: 30,
              justifyContent: "center",
              paddingHorizontal: 10,
              borderRadius: 8,
              borderCurve: "continuous",
              backgroundColor: colors.ink,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.paper }}>{label}</Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
