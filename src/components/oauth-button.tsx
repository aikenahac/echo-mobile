import { CapsuleButton } from "@/components/echo";
import { useSSO } from "@clerk/clerk-expo";
import type { OAuthStrategy } from "@clerk/types";
import * as AuthSession from "expo-auth-session";
import type { SFSymbol } from "expo-symbols";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import { Platform, type StyleProp, type ViewStyle } from "react-native";

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
  strategy: OAuthStrategy;
  title: string;
  icon?: SFSymbol;
  variant?: "primary" | "paper" | "outline";
  onError?: (message: string) => void;
  style?: StyleProp<ViewStyle>;
};

/** Signs in through a Clerk SSO provider (Apple, Google) */
export default function OAuthButton({ strategy, title, icon, variant = "outline", onError, style }: Props) {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const [busy, setBusy] = useState(false);

  const onPress = useCallback(async () => {
    setBusy(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: AuthSession.makeRedirectUri(),
      });
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      onError?.(clerkErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [startSSOFlow, strategy, onError]);

  return <CapsuleButton title={title} icon={icon} variant={variant} loading={busy} onPress={onPress} style={style} />;
}

/** The first human-readable message from a Clerk error */
export function clerkErrorMessage(err: unknown): string {
  const e = err as { errors?: Array<{ longMessage?: string; message?: string }>; message?: string };
  return e?.errors?.[0]?.longMessage ?? e?.errors?.[0]?.message ?? e?.message ?? "Something went wrong.";
}
