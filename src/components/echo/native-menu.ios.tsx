import { Host } from "@expo/ui";
import { Button, Divider, Menu, RNHostView } from "@expo/ui/swift-ui";
import { Fragment } from "react";
import { menuGroups, type NativeMenuProps } from "./native-menu.types";

/** A native SwiftUI menu opened from an RN trigger (sort order, status stamp, ⋯) */
export function NativeMenu({ children, items, accessibilityLabel, style }: NativeMenuProps) {
  return (
    <Host matchContents style={style} accessibilityLabel={accessibilityLabel}>
      <Menu
        label={
          <RNHostView matchContents>
            {children}
          </RNHostView>
        }
      >
        {menuGroups(items).map((group, g) => (
          <Fragment key={g}>
            {g > 0 && <Divider />}
            {group.map((item) => (
              <Button
                key={item.title}
                label={item.title}
                systemImage={item.checked ? "checkmark" : item.systemImage}
                role={item.destructive ? "destructive" : undefined}
                onPress={item.onPress}
              />
            ))}
          </Fragment>
        ))}
      </Menu>
    </Host>
  );
}
