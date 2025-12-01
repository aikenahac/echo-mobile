import { useUpdateProfile } from "@/hooks/api/user/use-update-me";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "./ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Input } from "./ui/input";
import { Text } from "./ui/text";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function SetUsernameDrawer({ open, setOpen }: Props) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const { mutateAsync } = useUpdateProfile();

  const handleUsernameChange = (value: string) => {
    // Only allow letters, numbers, underscores, and dots
    const filtered = value.replace(/[^a-zA-Z0-9_.]/g, "");
    setUsername(filtered);
  };
  
  const handleContinue = async () => {
    await mutateAsync({ username, bio: "" });
    setOpen(false);
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} dismissible={false}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            <Text>{t("home.setUsername")}</Text>
          </DrawerTitle>
        </DrawerHeader>
        <View className="w-full gap-12 justify-between">
          <View className="gap-2 w-full">
            <Input
              autoCapitalize="none"
              value={username}
              onChangeText={handleUsernameChange}
            />
            <Text className="text-muted-foreground text-sm">{t("home.usernameRules")}</Text>
          </View>

        <Button onPress={handleContinue}>
          <Text>{t("home.continue")}</Text>
        </Button>
        </View>
      </DrawerContent>
    </Drawer>
  );
}
