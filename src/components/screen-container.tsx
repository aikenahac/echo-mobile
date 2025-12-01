import { cn } from "@/lib/utils";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  className?: string;
}

export function ScreenContainer({ children, className }: Props) {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]} className={cn(className, "bg-background px-6 py-4")}>
      {children}
    </SafeAreaView>
  )
}