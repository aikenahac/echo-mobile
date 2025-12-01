import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity } from "react-native";
import { buttonVariants } from "./ui/button";

export const SignOutButton = () => {
  const { signOut } = useClerk();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to your desired page
      Linking.openURL(Linking.createURL("/"));
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };
  return (
    <TouchableOpacity
      onPress={handleSignOut}
      className={cn(buttonVariants({ variant: "destructive" }))}
    >
      <Text>{t("auth.signOut")}</Text>
    </TouchableOpacity>
  );
};
