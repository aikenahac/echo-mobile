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
import { useSignIn } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Platform, View } from "react-native";
import { toast } from "sonner-native";

export default function Page() {
  const { t } = useTranslation();
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const { colorScheme } = useColorScheme();
  const effectiveColorScheme = colorScheme ?? "light";

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    if (emailAddress.length === 0 || password.length === 0) {
      toast.error(t("auth.enterAllDetails"));
      return;
    }

    if (!isValidEmail(emailAddress)) {
      toast.error(t("auth.invalidEmail"));
      return;
    }

    // Start the sign-in process using the email and password provided
    try {
      console.log({
        identifier: emailAddress,
        password,
      });
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "needs_second_factor") {
        await signInAttempt.prepareSecondFactor({ strategy: "email_code" });
        setPendingVerification(true);
      } else if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.log(err);
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

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signIn.attemptSecondFactor({
        code,
        strategy: "email_code",
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
        <Text className="font-bold text-3xl">{t("auth.signIn")}</Text>
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
            placeholder={t("auth.passwordPlaceholder")}
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />
        </View>
      </View>

      <Button onPress={onSignInPress} className="w-full" size="lg">
        <Text>Continue</Text>
      </Button>

      <View className="flex flex-row gap-1">
        <Text>{t("auth.noAccount")}</Text>
        <Link href="/(auth)/sign-up">
          <Text className="text-primary font-bold">{t("auth.signUp")}</Text>
        </Link>
      </View>
    </ScreenContainer>
  );
}
