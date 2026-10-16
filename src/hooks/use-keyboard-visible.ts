import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

/** Whether the software keyboard is up (to hide footers that would crowd the docked button) */
export function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", () => setVisible(true));
    const hide = Keyboard.addListener("keyboardWillHide", () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}
