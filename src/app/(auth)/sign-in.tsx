import { AuthScreen, FooterLink } from "@/components/auth/auth-screen";
import { CapsuleButton, TextField } from "@/components/echo";
import { authError, type AuthError } from "@/lib/clerk-errors";
import { spacing, useColors } from "@/lib/theme";
import { isValidEmail } from "@/lib/utils";
import { useSignIn } from "@clerk/expo/legacy";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, type TextInput, View } from "react-native";

/** Sign in with email (r6 12). Errors sit under their field, never in a toast. */
export default function SignInScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<AuthError | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!isLoaded || busy) return;
    if (!email.trim()) return setError({ field: "email", message: t("auth.errors.enterEmail") });
    if (!isValidEmail(email)) return setError({ field: "email", message: t("auth.errors.invalidEmail") });
    if (!password) return setError({ field: "password", message: t("auth.errors.enterPassword") });
    setError(null);
    setBusy(true);
    try {
      const attempt = await signIn.create({ identifier: email.trim(), password });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      } else if (attempt.status === "needs_second_factor") {
        await attempt.prepareSecondFactor({ strategy: "email_code" });
        router.push({ pathname: "/verify", params: { mode: "signin", email: email.trim() } });
      }
    } catch (err) {
      setError(authError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      title={t("auth.signIn")}
      action={<CapsuleButton title={t("auth.signIn")} loading={busy} onPress={submit} style={{ minHeight: 56 }} />}
      footer={<FooterLink text={t("auth.noAccount")} link={t("auth.createAccount")} onPress={() => router.replace("/sign-up")} />}
    >
      <View style={{ gap: spacing.lg, marginTop: 28 }}>
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
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submit}
            error={error?.field === "password" ? error.message : null}
          />
          <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.push({ pathname: "/forgot-password", params: { email } })} style={{ alignSelf: "flex-start", marginTop: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.pinkInk }}>{t("auth.forgotPassword")}</Text>
          </Pressable>
        </View>
        {(error?.field === "form" || error?.field === "code") && <Text style={{ fontSize: 13, color: colors.negative }}>{error.message}</Text>}
      </View>
    </AuthScreen>
  );
}
