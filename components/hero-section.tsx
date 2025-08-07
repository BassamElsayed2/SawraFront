import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  lang: "en" | "ar";
  dict: any;
}

export default function HeroSection({ lang, dict }: HeroSectionProps) {
  return (
    <section className="relative h-screen flex items-center justify-center">
      {/* <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/elegant-restaurant.png')",
        }}
      /> */}
      <video
        src={"/main-comp.mp4"}
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* <div className="absolute inset-0 hero-overlay" /> */}

      {/* <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          {dict.hero.title}
        </h1>
        <p className="text-xl md:text-2xl mb-8 leading-relaxed opacity-90">
          {dict.hero.subtitle}
        </p>
        <Button
          asChild
          size="lg"
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg"
        >
          <Link href={`/${lang}/menu`}>{dict.hero.cta}</Link>
        </Button>
      </div> */}
    </section>
  );
}
