import { ScreenContainer } from "@/components/screen-container";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Text } from "@/components/ui/text";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <ScreenContainer className="flex flex-col items-center w-screen h-screen justify-between mt-24">
      <Image
        source={{ uri: "echo_logo" }}
        style={{ width: 220, height: 100 }}
        className="w-64 h-32 object-contain"
        transition={1000}
      />


      <View className="w-full flex items-center gap-2">
        <Button onPress={() => setOpen(true)}>
          <Text>Open Drawer</Text>
        </Button>

        <Drawer open={open} onOpenChange={setOpen} dismissible={true}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                <Text>Drawer Title</Text>
              </DrawerTitle>
            </DrawerHeader>
            <Text>Content</Text>
          </DrawerContent>
        </Drawer>
        <Text>{user?.primaryEmailAddress?.emailAddress}</Text>
        <Button className="w-full" onPress={() => signOut()}>
          <Text>{t("auth.logout")}</Text>
        </Button>
      </View>
    </ScreenContainer>
  );
}
