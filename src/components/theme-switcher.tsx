import { useColorScheme, type ColorScheme } from '@/hooks/use-color-scheme';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { themeMode, setColorScheme } = useColorScheme();

  const themes: Record<ColorScheme, string> = {
    light: t('themeSwitcher.light'),
    dark: t('themeSwitcher.dark'),
    system: t('themeSwitcher.system'),
  };

  const handleThemeChange = (value: { value: string; label: string } | undefined) => {
    if (value?.value) {
      setColorScheme(value.value as ColorScheme);
    }
  };

  return (
    <View className="w-full">
      <Select
        defaultValue={{
          value: themeMode,
          label: themes[themeMode],
        }}
        onValueChange={handleThemeChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('themeSwitcher.selectTheme')} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem label={themes.light} value="light">
              {themes.light}
            </SelectItem>
            <SelectItem label={themes.dark} value="dark">
              {themes.dark}
            </SelectItem>
            <SelectItem label={themes.system} value="system">
              {themes.system}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
}
