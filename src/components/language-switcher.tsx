import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { changeLanguage } from '@/lib/i18n'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Language switcher component that allows users to change the app language.
 * Supports English (en) and Slovenian (sl).
 * The selected language is persisted to local storage.
 */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  const languages = {
    en: 'English',
    sl: 'Slovenščina'
  }

  const handleLanguageChange = (value: { value: string; label: string } | undefined) => {
    if (value?.value) {
      changeLanguage(value.value)
    }
  }

  return (
    <View className="w-full">
      <Select
        defaultValue={{
          value: i18n.language,
          label: languages[i18n.language as keyof typeof languages],
        }}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('languageSwitcher.selectLanguage')} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem label={languages.en} value="en">
              {languages.en}
            </SelectItem>
            <SelectItem label={languages.sl} value="sl">
              {languages.sl}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  )
}
