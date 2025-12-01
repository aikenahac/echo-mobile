import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { isValidEmail } from "@/lib/utils";
import { useSignIn } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { toast } from "sonner-native";

export default function Page() {
  const { t } = useTranslation();
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

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
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <ScreenContainer className="flex flex-col items-center w-screen h-screen justify-between mt-24">
      <Image
        source={{ uri: "echo_logo" }}
        style={{ width: 220, height: 100 }}
        className="w-64 h-32 object-contain"
        transition={1000}
      />

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
