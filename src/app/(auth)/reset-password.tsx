import { AuthScreen, FooterLink } from "@/components/auth/auth-screen";
import { CodeBoxes } from "@/components/auth/code-boxes";
import { PasswordRule } from "@/components/auth/password-rule";
import { CapsuleButton, TextField } from "@/components/echo";
import { authError, MIN_PASSWORD, type AuthError } from "@/lib/clerk-errors";
import { useColors } from "@/lib/theme";
import { useSignIn } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Text, type TextInput, View } from "react-native";

/**
 * Set a new password (r6 24): the emailed code in six boxes, a new password with the eye
 * and the live check, "Save and sign in", and "Send it again". Clerk's
 * reset_password_email_code strategy.
 */
export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { t } = useTranslation();
  const colors = useColors();
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const passwordRef = useRef<TextInput>(null);

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<AuthError | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!isLoaded || busy) return;
    if (code.length < 6) return setError({ field: "code", message: t("auth.errors.wrongCode") });
    if (password.length < MIN_PASSWORD) return setError({ field: "password", message: t("auth.errors.passwordShort") });
    setError(null);
    setBusy(true);
    try {
      const attempt = await signIn.attemptFirstFactor({ strategy: "reset_password_email_code", code, password });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      }
    } catch (err) {
      setError(authError(err));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!isLoaded) return;
    setError(null);
    setCode("");
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email });
    } catch (err) {
      setError(authError(err));
    }
  };

  return (
    <AuthScreen
      title={t("auth.newPasswordTitle")}
      lead={<Trans i18nKey="auth.newPasswordLead" values={{ email }} components={{ b: <Text style={{ color: colors.ink, fontWeight: "600" }} /> }} />}
      action={<CapsuleButton title={t("auth.saveAndSignIn")} loading={busy} onPress={save} style={{ minHeight: 56 }} />}
      footer={<FooterLink text={t("auth.noCode")} link={t("auth.sendAgain")} onPress={resend} />}
    >
      <View style={{ marginTop: 32 }}>
        <CodeBoxes
          value={code}
          onChange={(v) => {
            setCode(v);
            if (error?.field === "code") setError(null);
          }}
          onComplete={() => passwordRef.current?.focus()}
          error={error?.field === "code"}
          autoFocus
          accessibilityLabel={t("auth.codeLabel")}
        />
        {error?.field === "code" && <Text style={{ fontSize: 13, lineHeight: 18, color: colors.negative, marginTop: 10 }}>{error.message}</Text>}
      </View>
      <View style={{ marginTop: 24 }}>
        <TextField
          ref={passwordRef}
          label={t("auth.newPassword")}
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            if (error?.field === "password") setError(null);
          }}
          password
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={save}
          error={error?.field === "password" ? error.message : null}
        />
        {error?.field !== "password" && <PasswordRule password={password} />}
        {(error?.field === "form" || error?.field === "email") && <Text style={{ fontSize: 13, color: colors.negative, marginTop: 8 }}>{error.message}</Text>}
      </View>
    </AuthScreen>
  );
}
