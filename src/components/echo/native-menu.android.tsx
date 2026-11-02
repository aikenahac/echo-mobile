import { useColors } from "@/lib/theme";
import { DropdownMenu, DropdownMenuItem, Host, HorizontalDivider, RNHostView, Text } from "@expo/ui/jetpack-compose";
import { Fragment, useState } from "react";
import { Pressable } from "react-native";
import { menuGroups, type NativeMenuProps } from "./native-menu.types";
import { SFIcon } from "./sf-icon";

/** A Material dropdown menu opened from an RN trigger (sort order, ⋯, toolbar menus) */
export function NativeMenu({ children, items, accessibilityLabel, style }: NativeMenuProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const close = () => setExpanded(false);

  return (
    <Host matchContents style={style}>
      <DropdownMenu expanded={expanded} onDismissRequest={close} color={colors.paper}>
        <DropdownMenu.Trigger>
          <RNHostView matchContents>
            <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={() => setExpanded(true)}>
              {children}
            </Pressable>
          </RNHostView>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          {menuGroups(items).map((group, g) => (
            <Fragment key={g}>
              {g > 0 && <HorizontalDivider />}
              {group.map((item) => {
                const tint = item.destructive ? colors.negative : colors.ink;
                return (
                  <DropdownMenuItem
                    key={item.title}
                    onClick={() => {
                      close();
                      item.onPress();
                    }}
                  >
                    <DropdownMenuItem.Text>
                      <Text color={tint}>{item.title}</Text>
                    </DropdownMenuItem.Text>
                    {item.systemImage && (
                      <DropdownMenuItem.LeadingIcon>
                        <RNHostView matchContents>
                          <SFIcon name={item.systemImage} size={20} color={tint} />
                        </RNHostView>
                      </DropdownMenuItem.LeadingIcon>
                    )}
                    {item.checked && (
                      <DropdownMenuItem.TrailingIcon>
                        <RNHostView matchContents>
                          <SFIcon name="checkmark" size={20} color={colors.pinkInk} weight="semibold" />
                        </RNHostView>
                      </DropdownMenuItem.TrailingIcon>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </Fragment>
          ))}
        </DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
}
