import { PlaceholderScreen } from "@/components/placeholder-screen";
import { useTranslation } from "react-i18next";

// TODO: replaced by the redesigned screen in its own phase (HANDOFF.md § Build order)
export default function Screen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t("tabs.search")} />;
}
