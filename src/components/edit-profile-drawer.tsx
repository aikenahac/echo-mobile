import { useUpdateProfile } from "@/hooks/api/user/use-update-me";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "./ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Text } from "./ui/text";
import { Textarea } from "./ui/textarea";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  currentUsername: string | null;
  currentBio: string | null;
};

const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,30}$/;

export function EditProfileDrawer({ open, setOpen, currentUsername, currentBio }: Props) {
  const { t } = useTranslation();
  const [username, setUsername] = useState(currentUsername || "");
  const [bio, setBio] = useState(currentBio || "");
  const [usernameError, setUsernameError] = useState("");

  const { mutateAsync, isPending } = useUpdateProfile();

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameError("");
  };

  const validateUsername = () => {
    if (!username) {
      setUsernameError("Username is required");
      return false;
    }
    if (!USERNAME_REGEX.test(username)) {
      setUsernameError("Invalid username format");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateUsername()) {
      return;
    }

    try {
      await mutateAsync({ username, bio });
      setOpen(false);
    } catch (error) {
      // Error is handled by React Query
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    setUsername(currentUsername || "");
    setBio(currentBio || "");
    setUsernameError("");
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            <Text>{t("profile.edit")}</Text>
          </DrawerTitle>
        </DrawerHeader>

        <View className="gap-6 px-4 pb-8">
          <View className="gap-2">
            <Label>{t("profile.form.username")}</Label>
            <Input
              value={username}
              onChangeText={handleUsernameChange}
              placeholder={t("profile.form.username")}
              autoCapitalize="none"
            />
            <Text className="text-sm text-muted-foreground">
              {t("profile.form.usernameRules")}
            </Text>
            {usernameError && (
              <Text className="text-sm text-destructive">{usernameError}</Text>
            )}
          </View>

          <View className="gap-2">
            <Label>{t("profile.form.bio")}</Label>
            <Textarea
              value={bio}
              onChangeText={setBio}
              placeholder={t("profile.form.bioPlaceholder")}
              numberOfLines={4}
            />
          </View>

          <View className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onPress={handleCancel}
              disabled={isPending}
            >
              <Text>{t("profile.form.cancel")}</Text>
            </Button>
            <Button
              className="flex-1"
              onPress={handleSave}
              disabled={isPending}
            >
              <Text>{t("profile.form.save")}</Text>
            </Button>
          </View>
        </View>
      </DrawerContent>
    </Drawer>
  );
}
