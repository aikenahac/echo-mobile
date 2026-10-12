import { AuthScreen, FooterLink } from "@/components/auth/auth-screen";
import { CodeBoxes } from "@/components/auth/code-boxes";
import { CapsuleButton } from "@/components/echo";
import { formatCountdown, useCountdown } from "@/hooks/use-countdown";
import { authError } from "@/lib/clerk-errors";
import { useColors } from "@/lib/theme";
import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ActivityIndicator, Linking, Platform, Pressable, Text, View } from "react-native";

const RESEND_AFTER = 60;

/**
 * Verify email (r6 14): six code boxes (one-time-code autofill), a resend countdown,
 * Open Mail, and Change email. Used after sign-up and for an email second factor.
 */
export default function VerifyScreen() {
  const { mode, email } = useLocalSearchParams<{ mode: "signup" | "signin"; email: string }>();
  const { t } = useTranslation();
  const colors = useColors();
  const router = useRouter();
  const signUp = useSignUp();
  const signIn = useSignIn();
  const countdown = useCountdown(RESEND_AFTER);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const verify = async (value: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === "signin" && signIn.isLoaded) {
        const attempt = await signIn.signIn.attemptSecondFactor({ strategy: "email_code", code: value });
        if (attempt.status === "complete") await signIn.setActive({ session: attempt.createdSessionId });
      } else if (signUp.isLoaded) {
        const attempt = await signUp.signUp.attemptEmailAddressVerification({ code: value });
        if (attempt.status === "complete") await signUp.setActive({ session: attempt.createdSessionId });
      }
      router.replace("/");
    } catch (err) {
      setError(authError(err).message);
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError(null);
    try {
      if (mode === "signin" && signIn.isLoaded) await signIn.signIn.prepareSecondFactor({ strategy: "email_code" });
      else if (signUp.isLoaded) await signUp.signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      countdown.restart();
    } catch (err) {
      setError(authError(err).message);
    }
  };

  const openMail = () => Linking.openURL(Platform.select({ ios: "message://", default: "mailto:" })).catch(() => {});

  return (
    <AuthScreen
      title={t("auth.checkEmail")}
      lead={<Trans i18nKey="auth.codeSent" values={{ email }} components={{ b: <Text style={{ color: colors.ink, fontWeight: "600" }} /> }} />}
      action={<CapsuleButton title={t("auth.openMail")} icon="envelope.open" variant="outline" onPress={openMail} style={{ minHeight: 56 }} />}
      footer={<FooterLink text={t("auth.wrongAddress")} link={t("auth.changeEmail")} onPress={() => router.back()} />}
    >
      <View style={{ marginTop: 32 }}>
        <CodeBoxes value={code} onChange={setCode} onComplete={verify} error={!!error} autoFocus accessibilityLabel={t("auth.codeLabel")} />
        {error && <Text style={{ fontSize: 13, lineHeight: 18, color: colors.negative, marginTop: 10 }}>{error}</Text>}
        <View style={{ marginTop: 18, minHeight: 22, flexDirection: "row", alignItems: "center", gap: 8 }}>
          {busy ? (
            <ActivityIndicator color={colors.ink2} />
          ) : countdown.left > 0 ? (
            <Text style={{ fontSize: 15, color: colors.ink2, fontVariant: ["tabular-nums"] }}>{t("auth.resendIn", { time: formatCountdown(countdown.left) })}</Text>
          ) : (
            <Pressable accessibilityRole="button" hitSlop={8} onPress={resend}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: colors.pinkInk }}>{t("auth.resend")}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </AuthScreen>
  );
}
