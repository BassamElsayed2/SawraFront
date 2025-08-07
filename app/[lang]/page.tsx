import { getDictionary } from './dictionaries'
import Navbar from '@/components/navbar'
import HeroSection from '@/components/hero-section'
import BestsellersSlider from '@/components/bestsellers-slider'
import Footer from '@/components/footer'

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: 'en' | 'ar' }>
}) {
  const { lang } = await params
  
  // Validate language parameter
  if (!['en', 'ar'].includes(lang)) {
    throw new Error(`Invalid language: ${lang}`)
  }
  
  let dict
  try {
    dict = await getDictionary(lang)
  } catch (error) {
    console.error('Failed to load dictionary:', error)
    // Fallback to English if dictionary loading fails
    dict = await getDictionary('en')
  }

  return (
    <main className="min-h-screen">
      <Navbar lang={lang} dict={dict} />
      <HeroSection lang={lang} dict={dict} />
      <BestsellersSlider lang={lang} dict={dict} />
      <Footer lang={lang} dict={dict} />
    </main>
  )
}
