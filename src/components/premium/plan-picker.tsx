import { Hairline, SFIcon, Stamp } from "@/components/echo";
import { useColors } from "@/lib/theme";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { PACKAGE_TYPE, type PurchasesPackage } from "react-native-purchases";

/** The packages the paywall sells, in display order */
export const PLAN_TYPES = [PACKAGE_TYPE.MONTHLY, PACKAGE_TYPE.ANNUAL, PACKAGE_TYPE.LIFETIME] as const;
export type PlanType = (typeof PLAN_TYPES)[number];

export const isPlanType = (type: PACKAGE_TYPE): type is PlanType => PLAN_TYPES.some((t) => t === type);

type Props = {
  packages: Array<PurchasesPackage>;
  selected: string | undefined;
  onSelect: (pkg: PurchasesPackage) => void;
};

/** Monthly · Yearly · Lifetime as hairline rows on the field, prices from the store */
export function PlanPicker({ packages, selected, onSelect }: Props) {
  const colors = useColors();
  const { t } = useTranslation();

  const subtitle = (pkg: PurchasesPackage) => {
    switch (pkg.packageType) {
      case PACKAGE_TYPE.ANNUAL:
        return pkg.product.pricePerMonthString ? t("premium.perMonth", { price: pkg.product.pricePerMonthString }) : null;
      case PACKAGE_TYPE.LIFETIME:
        return t("premium.lifetimeNote");
      default:
        return t("premium.monthlyNote");
    }
  };

  return (
    <View accessibilityRole="radiogroup">
      {packages.map((pkg) => {
        const isSelected = pkg.identifier === selected;
        const type = isPlanType(pkg.packageType) ? pkg.packageType : PACKAGE_TYPE.MONTHLY;
        const note = subtitle(pkg);
        return (
          <View key={pkg.identifier}>
            <Hairline color={colors.onFieldRule} />
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${t(`premium.plan.${type}`)}, ${pkg.product.priceString}${note ? `, ${note}` : ""}`}
              onPress={() => {
                if (!isSelected) Haptics.selectionAsync();
                onSelect(pkg);
              }}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, opacity: pressed ? 0.7 : 1 })}
            >
              <SFIcon
                name={isSelected ? "checkmark.circle.fill" : "circle"}
                size={22}
                color={isSelected ? colors.onField : colors.onField2}
                weight="regular"
              />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 17, fontWeight: "600", letterSpacing: -0.3, color: colors.onField }}>
                    {t(`premium.plan.${type}`)}
                  </Text>
                  {pkg.packageType === PACKAGE_TYPE.ANNUAL && <Stamp label={t("stamp.bestValue")} size={11} rotate={-3} />}
                </View>
                {note && <Text style={{ fontSize: 13, marginTop: 1, color: colors.onField2 }}>{note}</Text>}
              </View>
              <Text style={{ fontSize: 17, fontWeight: isSelected ? "600" : "400", letterSpacing: -0.3, color: colors.onField, fontVariant: ["tabular-nums"] }}>
                {pkg.product.priceString}
              </Text>
            </Pressable>
          </View>
        );
      })}
      <Hairline color={colors.onFieldRule} />
    </View>
  );
}
