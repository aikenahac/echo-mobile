import { AuthScreen, FooterLink } from "@/components/auth/auth-screen";
import { PasswordRule } from "@/components/auth/password-rule";
import { CapsuleButton, TextField } from "@/components/echo";
import { authError, MIN_PASSWORD, type AuthError } from "@/lib/clerk-errors";
import { spacing, useColors } from "@/lib/theme";
import { isValidEmail } from "@/lib/utils";
import { useSignUp } from "@clerk/expo/legacy";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, type TextInput, View } from "react-native";

/**
 * Create account (r6 13): email and password with a show/hide eye and the live
 * "8 characters or more" check. No confirm field; the eye replaces it.
 */
export default function SignUpScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const router = useRouter();
  const { signUp, isLoaded } = useSignUp();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<AuthError | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!isLoaded || busy) return;
    if (!isValidEmail(email)) return setError({ field: "email", message: t(email.trim() ? "auth.errors.invalidEmail" : "auth.errors.enterEmail") });
    if (password.length < MIN_PASSWORD) return setError({ field: "password", message: t("auth.errors.passwordShort") });
    setError(null);
    setBusy(true);
    try {
      await signUp.create({ emailAddress: email.trim(), password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      router.push({ pathname: "/verify", params: { mode: "signup", email: email.trim() } });
    } catch (err) {
      setError(authError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      title={t("auth.createAccount")}
      lead={t("auth.createLead")}
      action={<CapsuleButton title={t("auth.createAccountButton")} loading={busy} onPress={submit} style={{ minHeight: 56 }} />}
      footer={<FooterLink text={t("auth.haveAccount")} link={t("auth.signIn")} onPress={() => router.replace("/sign-in")} />}
    >
      <View style={{ gap: spacing.lg, marginTop: 24 }}>
        <TextField
          label={t("auth.email")}
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (error?.field === "email") setError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="username"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={error?.field === "email" ? error.message : null}
        />
        <View>
          <TextField
            ref={passwordRef}
            label={t("auth.password")}
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (error?.field === "password") setError(null);
            }}
            password
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            onSubmitEditing={submit}
            error={error?.field === "password" ? error.message : null}
          />
          {error?.field !== "password" && <PasswordRule password={password} />}
        </View>
        {(error?.field === "form" || error?.field === "code") && <Text style={{ fontSize: 13, color: colors.negative }}>{error.message}</Text>}
      </View>
    </AuthScreen>
  );
}
