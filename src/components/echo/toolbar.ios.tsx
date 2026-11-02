import { Stack } from "expo-router";
import { menuGroups } from "./native-menu.types";
import type { ToolbarProps } from "./toolbar.types";

/** The screen's glass toolbar buttons and menus (iOS 26 navigation bar) */
export function Toolbar({ placement, items }: ToolbarProps) {
  return (
    <Stack.Toolbar placement={placement}>
      {items.map((item) => {
        if (!item) return null;
        if (item.kind === "button") {
          return (
            <Stack.Toolbar.Button
              key={item.label}
              icon={item.icon}
              tintColor={item.tint}
              variant={item.prominent ? "prominent" : undefined}
              accessibilityLabel={item.label}
              disabled={item.disabled}
              onPress={item.onPress}
            />
          );
        }
        const groups = menuGroups(item.items);
        const actions = (group: (typeof groups)[number]) =>
          group.map((action) => (
            <Stack.Toolbar.MenuAction key={action.title} icon={action.systemImage} destructive={action.destructive} isOn={action.checked} onPress={action.onPress}>
              {action.title}
            </Stack.Toolbar.MenuAction>
          ));
        return (
          <Stack.Toolbar.Menu key={item.label} icon={item.icon} tintColor={item.tint} accessibilityLabel={item.label}>
            {groups.length === 1
              ? actions(groups[0]!)
              : groups.map((group, g) => (
                  <Stack.Toolbar.Menu key={g} inline>{actions(group)}</Stack.Toolbar.Menu>
                ))}
          </Stack.Toolbar.Menu>
        );
      })}
    </Stack.Toolbar>
  );
}
