import { setInLocalStorage, STORAGE_KEYS } from '@/lib/storage'
import en from '@/locales/en.json'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: { translation: en },
  // sl: { translation: sl },
}

const getInitialLanguage = (): string => {
  // const savedLanguage = getFromLocalStorage<string>(STORAGE_KEYS.LANGUAGE)
  // if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'sl')) {
  //   return savedLanguage
  // }
  // const deviceLanguage = Localization.getLocales()[0]?.languageCode
  // if (deviceLanguage === 'sl') {
  //   return 'sl'
  // }
  return 'en'
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
})

export const changeLanguage = async (language: string) => {
  await i18n.changeLanguage(language)
  setInLocalStorage<string>(STORAGE_KEYS.LANGUAGE, language)
}
