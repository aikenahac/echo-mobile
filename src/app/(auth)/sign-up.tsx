import { CapsuleButton, DisplayText, TextField } from "@/components/echo";
import { clerkErrorMessage } from "@/components/oauth-button";
import { spacing } from "@/lib/theme";
import { isValidEmail } from "@/lib/utils";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";

// TODO(phase 9): replaced by the designed Create account / Verify screens (r6 13, 14)
export default function SignUpScreen() {
  const { t } = useTranslation();
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSignUp = async () => {
    if (!isLoaded) return;
    setError(null);
    if (!email || !password) return setError(t("auth.enterAllDetails"));
    if (!isValidEmail(email)) return setError(t("auth.invalidEmail"));

    setBusy(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded) return;
    setError(null);
    setBusy(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
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
        {pendingVerification ? (
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
          </>
        ) : (
          <>
            <DisplayText className="text-ink">{t("auth.signUp")}</DisplayText>
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
              autoComplete="new-password"
              textContentType="newPassword"
              hint={t("auth.passwordRule")}
              error={error}
            />
            <CapsuleButton title={t("auth.createAccount")} loading={busy} onPress={onSignUp} />
            <View className="flex-row justify-center gap-1">
              <Text className="text-ink-2 text-[15px]">{t("auth.haveAccount")}</Text>
              <Link href="/(auth)/sign-in" className="text-pink-ink text-[15px] font-semibold">
                {t("auth.signIn")}
              </Link>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
