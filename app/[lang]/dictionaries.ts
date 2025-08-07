import 'server-only'

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  ar: () => import('./dictionaries/ar.json').then((module) => module.default),
} as const

export const getDictionary = async (locale: 'en' | 'ar') => {
  const dictionaryLoader = dictionaries[locale]
  if (!dictionaryLoader) {
    throw new Error(`Dictionary for locale "${locale}" not found`)
  }
  return dictionaryLoader()
}
