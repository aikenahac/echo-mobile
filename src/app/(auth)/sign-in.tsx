import { CapsuleButton, DisplayText, TextField } from "@/components/echo";
import OAuthButton, { clerkErrorMessage } from "@/components/oauth-button";
import { spacing } from "@/lib/theme";
import { isValidEmail } from "@/lib/utils";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";

// TODO(phase 9): replaced by the designed Welcome / Sign in screens (r6 11, 12)
export default function SignInScreen() {
  const { t } = useTranslation();
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingSecondFactor, setPendingSecondFactor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSignIn = async () => {
    if (!isLoaded) return;
    setError(null);
    if (!email || !password) return setError(t("auth.enterAllDetails"));
    if (!isValidEmail(email)) return setError(t("auth.invalidEmail"));

    setBusy(true);
    try {
      const attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === "needs_second_factor") {
        await attempt.prepareSecondFactor({ strategy: "email_code" });
        setPendingSecondFactor(true);
      } else if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      }
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onResend = async () => {
    if (!isLoaded) return;
    setError(null);
    try {
      await signIn.prepareSecondFactor({ strategy: "email_code" });
    } catch (err) {
      setError(clerkErrorMessage(err));
    }
  };

  const onVerify = async () => {
    if (!isLoaded) return;
    setError(null);
    setBusy(true);
    try {
      const attempt = await signIn.attemptSecondFactor({ code, strategy: "email_code" });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      }
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-paper">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 96, gap: spacing.lg }}
      >
        {pendingSecondFactor ? (
          <>
            <DisplayText className="text-ink">{t("auth.checkEmail")}</DisplayText>
            <Text className="text-ink-2 text-[15px]">{t("auth.codeSent", { email })}</Text>
            <TextField
              label={t("auth.code")}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              error={error}
            />
            <CapsuleButton title={t("auth.verify")} loading={busy} onPress={onVerify} />
            <CapsuleButton title={t("auth.resendCode")} variant="plain" size="md" onPress={onResend} />
          </>
        ) : (
          <>
            <DisplayText className="text-ink">{t("auth.signIn")}</DisplayText>
            <TextField
              label={t("auth.email")}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <TextField
              label={t("auth.password")}
              value={password}
              onChangeText={setPassword}
              password
              autoComplete="current-password"
              textContentType="password"
              error={error}
            />
            <CapsuleButton title={t("auth.signIn")} loading={busy} onPress={onSignIn} />
            <View style={{ gap: spacing.sm }}>
              <OAuthButton strategy="oauth_apple" title={t("auth.continueWithApple")} icon="apple.logo" variant="primary" onError={setError} />
              <OAuthButton strategy="oauth_google" title={t("auth.continueWithGoogle")} onError={setError} />
            </View>
            <View className="flex-row justify-center gap-1">
              <Text className="text-ink-2 text-[15px]">{t("auth.noAccount")}</Text>
              <Link href="/(auth)/sign-up" className="text-pink-ink text-[15px] font-semibold">
                {t("auth.createAccount")}
              </Link>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
