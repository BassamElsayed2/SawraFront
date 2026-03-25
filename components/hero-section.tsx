export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center">
      <video
        src="/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    </section>
  );
}
