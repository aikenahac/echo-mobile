import { SFIcon } from "@/components/echo";
import { authError } from "@/lib/clerk-errors";
import { fixed, useColors } from "@/lib/theme";
import { useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Platform, Pressable, Text, type StyleProp, type ViewStyle } from "react-native";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS === "web") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};
WebBrowser.maybeCompleteAuthSession();

type Props = {
  provider: "apple" | "google";
  onError?: (message: string) => void;
  style?: StyleProp<ViewStyle>;
};

// Brand rules: Apple's button is black with the white logo; Google's keeps the 4-colour G
const APPLE_BLACK = fixed.appleBlack;
const WHITE = fixed.onColor;

/** Continue with Apple / Google through Clerk SSO (r6 11) */
export default function OAuthButton({ provider, onError, style }: Props) {
  useWarmUpBrowser();
  const { t } = useTranslation();
  const colors = useColors();
  const { startSSOFlow } = useSSO();
  const [busy, setBusy] = useState(false);
  const apple = provider === "apple";

  const onPress = async () => {
    setBusy(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: apple ? "oauth_apple" : "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri(),
      });
      if (createdSessionId) await setActive!({ session: createdSessionId });
    } catch (err) {
      onError?.(authError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const fg = apple ? WHITE : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [
        {
          height: 56,
          borderRadius: 28,
          backgroundColor: apple ? APPLE_BLACK : colors.paper,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {apple ? (
            <SFIcon name="apple.logo" size={20} color={WHITE} weight="medium" />
          ) : (
            <Image source={require("../../assets/images/google_icon.png")} style={{ width: 20, height: 20 }} />
          )}
          <Text style={{ fontSize: 17, fontWeight: "600", letterSpacing: -0.3, color: fg }}>
            {apple ? t("auth.continueWithApple") : t("auth.continueWithGoogle")}
          </Text>
        </>
      )}
    </Pressable>
  );
}
