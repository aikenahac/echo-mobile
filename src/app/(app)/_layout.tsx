import { FullScreenLoader } from "@/components/full-screen-loader";
import { SetUsernameDrawer } from "@/components/set-username-drawer";
import { useProfile } from "@/hooks/api/user/use-get-me";
import { useAuth } from "@clerk/clerk-expo";
import createIconSet from "@expo/vector-icons/createIconSet";
import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useEffect, useState } from "react";

// Lucide icon glyph mappings from info.json
const glyphMap = {
  search: 0xe151,
  library: 0xe100,
  activity: 0xe038,
  users: 0xe1a4,
  user: 0xe19f,
};

const LucideIcon = createIconSet(
  glyphMap,
  "Lucide",
  require("@/lib/assets/lucide-font/lucide.ttf"),
);

export default function AppRoutesLayout() {
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: profile, isLoading } = useProfile();

  useEffect(() => {
    if (profile && (!profile.username || profile.username.length === 0)) {
      setOpen(true);
    }
  }, [profile]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!isSignedIn) {
    return <Redirect href={"/(auth)/sign-in"} />;
  }

  return (
    <>
      <NativeTabs>
        <NativeTabs.Trigger name="search">
          <NativeTabs.Trigger.Icon
            selectedColor={"#fda5d5"}
            src={<NativeTabs.Trigger.VectorIcon family={LucideIcon} name="search" />}
          />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="library">
          <NativeTabs.Trigger.Icon
            selectedColor={"#fda5d5"}
            src={<NativeTabs.Trigger.VectorIcon family={LucideIcon} name="library" />}
          />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="feed">
          <NativeTabs.Trigger.Icon
            selectedColor={"#fda5d5"}
            src={<NativeTabs.Trigger.VectorIcon family={LucideIcon} name="activity" />}
          />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Icon
            selectedColor={"#fda5d5"}
            src={<NativeTabs.Trigger.VectorIcon family={LucideIcon} name="user" />}
          />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
      </NativeTabs>
      <SetUsernameDrawer open={open} setOpen={setOpen} />
    </>
  );
}
