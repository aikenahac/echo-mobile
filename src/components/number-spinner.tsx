import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinusIcon, PlusIcon } from "@/lib/icons";
import { cn } from "@/lib/utils"; // Assuming you have shadcn's utility function 'cn'
import * as React from "react";
import { View } from "react-native";

/**
 * Props for the NumberSpinner component.
 * @param value The current number value (controlled from parent).
 * @param onChange The function to call when the value changes.
 * @param className Optional class names to apply to the container div.
 */
type NumberSpinnerProps = {
  value: number;
  onChange: (newValue: number) => void;
  className?: string;
}

export function NumberSpinner({
  value,
  onChange,
  className,
}: NumberSpinnerProps) {
  const handleDecrement = () => {
    // Prevent the value from going below 0
    if (value > 0) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    onChange(value + 1);
  };

  const handleInputChange = (rawValue: string) => {
    // 1. Remove non-digit characters and parse as an integer.
    // This enforces the "only allows for integers" and non-negative constraints.
    let newNum = parseInt(rawValue.replace(/\D/g, ""), 10);

    // If the input is empty or invalid (e.g., just "-"), default to 0.
    if (isNaN(newNum) || rawValue === "") {
      newNum = 0;
    }

    // 2. Ensure the value is not negative (though parseInt with \D removal should handle this).
    const finalValue = Math.max(0, newNum);

    onChange(finalValue);
  };

  return (
    <View className={cn("flex flex-row items-center space-x-0 w-[150px]", className)}>
      <Button
        variant="outline"
        size="icon"
        onPress={handleDecrement}
        disabled={value <= 0}
        className="h-10 w-10 rounded-r-none border-r-0"
      >
        <MinusIcon className="h-4 w-4" />
      </Button>

      <Input
        inputMode="numeric"
        value={value.toString()}
        onChangeText={handleInputChange}
        className={cn(
          "h-10 w-full text-center p-0 appearance-none rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:z-10",
        )}
      />

      <Button
        variant="outline"
        size="icon"
        onPress={handleIncrement}
        className="h-10 w-10 rounded-l-none border-l-0"
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
    </View>
  );
}
