import React, { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

export interface OtpInputProps {
  length?: number;
  onChange?: (value: string) => void;
  value?: string;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
}

// NativeWind-friendly reusable OTP component
export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onChange,
  value = '',
  autoFocus = true,
  className = '',
  inputClassName = '',
}) => {
  const [code, setCode] = useState(value.slice(0, length));
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    if (!/^[0-9]*$/.test(text)) return;

    const newCode = code.split('');
    newCode[index] = text.slice(-1);
    const joined = newCode.join('');

    setCode(joined);
    if (onChange && joined.length === length) {
      onChange(joined);
    }

    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View className={`flex-row justify-center gap-2 ${className}`}> 
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          value={code[i] || ''}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          className={`w-12 h-14 text-center text-2xl rounded-xl border border-neutral-300 dark:border-neutral-700 ${inputClassName}`}
        />
      ))}
    </View>
  );
};
