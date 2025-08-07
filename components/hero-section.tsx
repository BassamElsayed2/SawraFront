interface HeroSectionProps {
  lang: "en" | "ar";
  dict: any;
}

export default function HeroSection({ lang, dict }: HeroSectionProps) {
  return (
    <section className="relative h-screen flex items-center justify-center">
      <video
        src="/main-comp.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    </section>
  );
}
