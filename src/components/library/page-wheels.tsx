import { fonts, PLATE_OFFSET } from "@/lib/theme";
import { Text, View } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle } from "react-native-reanimated";

/*
 * The numbering machine: one wheel per digit, driven by a fractional page value on the
 * UI thread. Like an odometer, a wheel only turns while every wheel to its right is
 * rolling from 9 to 0, so the units wheel is the fastest.
 */

/** Archivo's figure height and where it sits in a 1.1 line box, as shares of the point size */
const CAP = 0.69;
const LINE = 1.1;
const GLYPH_TOP = 0.19;
/** Space above the figures and below the plate inside the window (pt) */
const PAD = 2;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

type Props = {
  /** The page as a continuous value (fractional while dragging) */
  page: SharedValue<number>;
  /** How many wheels; leading zeros are not drawn */
  places: number;
  size: number;
  color: string;
  plateColor: string;
};

export function PageWheels({ page, places, size, color, plateColor }: Props) {
  // One digit per window: the figure, its plate offset, a little air; the next digit stays out
  const windowHeight = Math.round(size * CAP) + PLATE_OFFSET + PAD * 2;
  return (
    <View style={{ flexDirection: "row", marginLeft: -4, marginTop: -5 }} accessible={false}>
      {Array.from({ length: places }, (_, i) => places - 1 - i).map((place) => (
        <Wheel key={place} place={place} page={page} size={size} color={color} plateColor={plateColor} windowHeight={windowHeight} />
      ))}
    </View>
  );
}

function Wheel({
  place,
  page,
  size,
  color,
  plateColor,
  windowHeight,
}: {
  place: number;
  page: SharedValue<number>;
  size: number;
  color: string;
  plateColor: string;
  windowHeight: number;
}) {
  const cell = windowHeight;
  const column = useAnimatedStyle(() => {
    const value = Math.max(0, page.get());
    const unit = Math.pow(10, place);
    const whole = Math.floor(value);
    const frac = value - whole;
    const below = whole % unit;
    // This wheel moves only while all lower wheels sit on 9 and are rolling over
    const rolling = place === 0 || below === unit - 1 ? frac : 0;
    const position = (Math.floor(whole / unit) % 10) + rolling;
    return { transform: [{ translateY: -position * cell }] };
  });
  // Hide a leading wheel until the page reaches its place (no "041")
  const visible = useAnimatedStyle(() => ({ opacity: place === 0 || page.get() >= Math.pow(10, place) - 0.5 ? 1 : 0 }));

  return (
    <Animated.View style={[{ height: windowHeight, overflow: "hidden", marginRight: -(PLATE_OFFSET + 1) }, visible]}>
      <Animated.View style={column}>
        {DIGITS.map((d, i) => (
          <View key={i} style={{ height: cell, overflow: "visible" }}>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: fonts.display,
                fontSize: size,
                lineHeight: Math.round(size * LINE),
                marginTop: -Math.round(size * GLYPH_TOP) + PAD,
                letterSpacing: -size / 40,
                // Room for the plate inside the text frame (iOS clips the shadow to it);
                // the wheel's negative margin keeps the digit spacing unchanged
                paddingRight: PLATE_OFFSET + 1,
                fontVariant: ["lining-nums", "tabular-nums"],
                color,
                textShadowColor: plateColor,
                textShadowOffset: { width: PLATE_OFFSET, height: PLATE_OFFSET },
                textShadowRadius: 0.01,
              }}
            >
              {d}
            </Text>
          </View>
        ))}
      </Animated.View>
    </Animated.View>
  );
}
