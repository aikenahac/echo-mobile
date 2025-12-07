import OAuthButton from "@/components/oauth-button";
import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MailIcon } from "@/lib/icons";
import { isValidEmail } from "@/lib/utils";
import { useSignUp } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Platform, View } from "react-native";
import { toast } from "sonner-native";

export default function SignUpScreen() {
  const { t } = useTranslation();
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const { colorScheme } = useColorScheme();
  const effectiveColorScheme = colorScheme ?? "light";

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (
      emailAddress.length === 0 ||
      password.length === 0 ||
      confirmPassword.length === 0
    ) {
      toast.error(t("auth.enterAllDetails"));
      return;
    }

    if (!isValidEmail(emailAddress)) {
      toast.error(t("auth.invalidEmail"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("auth.passwordsDontMatch"));
      return;
    }

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const openMailApp = async () => {
    const mailUrl = Platform.select({
      ios: "message://",
      android: "mailto:",
      default: "mailto:",
    });

    try {
      const supported = await Linking.canOpenURL(mailUrl);
      if (supported) {
        await Linking.openURL(mailUrl);
      }
    } catch (error) {
      console.error("Error opening mail app:", error);
    }
  };

  if (pendingVerification) {
    return (
      <ScreenContainer className="flex flex-col items-center w-screen h-screen justify-between mt-24">
        <Image
          source={{ uri: "echo_logo" }}
          style={{ width: 220, height: 100 }}
          className="w-64 h-32 object-contain"
          transition={1000}
        />
        <View className="my-4 w-full gap-4">
          <Text>{t("auth.verifyEmail")}</Text>
          <OtpInput value={code} onChange={(code) => setCode(code)} />
          <Button onPress={openMailApp} variant="secondary">
            <MailIcon className="text-muted-foreground" />
            <Text>{t("auth.openMail")}</Text>
          </Button>
        </View>
        <View className="w-full">
          <Button onPress={onVerifyPress} size="lg">
            <Text>{t("auth.verify")}</Text>
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex flex-col items-center w-screen h-screen justify-between mt-24">
      <Image
        source={{ uri: "echo_logo" }}
        style={{ width: 220, height: 100 }}
        className="w-64 h-32 object-contain"
        transition={1000}
      />

      <View className="w-full flex flex-row items-center justify-between gap-2">
        <OAuthButton strategy="oauth_google">
          <Image
            source={{ uri: "google_icon" }}
            style={{ width: 18, height: 18 }}
          />
        </OAuthButton>

        <OAuthButton strategy="oauth_apple">
          <Image
            source={{
              uri:
                effectiveColorScheme === "dark"
                  ? "apple_icon_light"
                  : "apple_icon_dark",
            }}
            style={{ width: 15, height: 18 }}
          />
        </OAuthButton>
      </View>

      <Separator />

      <View className="my-4 w-full gap-4">
        <Text className="font-bold text-3xl">{t("auth.signUp")}</Text>
        <View className="w-full gap-2">
          <Label>{t("auth.email")}</Label>
          <Input
            autoCapitalize="none"
            value={emailAddress}
            placeholder={t("auth.emailPlaceholder")}
            onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
          />
        </View>

        <View className="w-full gap-2">
          <Label>{t("auth.password")}</Label>
          <Input
            value={password}
            placeholder={t("auth.passwordPlaceholderSet")}
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />
        </View>

        <View className="w-full gap-2">
          <Label>{t("auth.confirmPassword")}</Label>
          <Input
            value={confirmPassword}
            placeholder={t("auth.confirmPasswordPlaceholder")}
            secureTextEntry={true}
            onChangeText={(password) => setConfirmPassword(password)}
          />
        </View>
      </View>

      <Button onPress={onSignUpPress} className="w-full" size="lg">
        <Text>Continue</Text>
      </Button>

      <View className="flex flex-row gap-1">
        <Text>{t("auth.registered")}</Text>
        <Link href="/(auth)/sign-in">
          <Text className="text-primary font-bold">{t("auth.signIn")}</Text>
        </Link>
      </View>
    </ScreenContainer>
  );
}
