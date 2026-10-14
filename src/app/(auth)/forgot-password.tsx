import { AuthScreen } from "@/components/auth/auth-screen";
import { CapsuleButton, TextField } from "@/components/echo";
import { authError, type AuthError } from "@/lib/clerk-errors";
import { useColors } from "@/lib/theme";
import { isValidEmail } from "@/lib/utils";
import { useSignIn } from "@clerk/expo/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

/** Forgot password, step 1 (not drawn; the Sign in layout with only Email): send the code */
export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { t } = useTranslation();
  const colors = useColors();
  const router = useRouter();
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState(params.email ?? "");
  const [error, setError] = useState<AuthError | null>(null);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!isLoaded || busy) return;
    if (!isValidEmail(email)) return setError({ field: "email", message: t(email.trim() ? "auth.errors.invalidEmail" : "auth.errors.enterEmail") });
    setError(null);
    setBusy(true);
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email.trim() });
      router.push({ pathname: "/reset-password", params: { email: email.trim() } });
    } catch (err) {
      setError(authError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      title={t("auth.resetTitle")}
      lead={t("auth.resetLead")}
      action={<CapsuleButton title={t("auth.sendCode")} loading={busy} onPress={send} style={{ minHeight: 56 }} />}
    >
      <View style={{ marginTop: 24 }}>
        <TextField
          label={t("auth.email")}
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setError(null);
          }}
          autoFocus={!params.email}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="username"
          returnKeyType="send"
          onSubmitEditing={send}
          error={error && error.field !== "form" ? error.message : null}
        />
        {error?.field === "form" && <Text style={{ fontSize: 13, color: colors.negative, marginTop: 8 }}>{error.message}</Text>}
      </View>
    </AuthScreen>
  );
}
