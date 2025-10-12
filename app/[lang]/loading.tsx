"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-20 w-20">
          <div className="absolute h-20 w-20 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 animate-pulse rounded-full bg-primary/30" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-lg font-semibold text-primary">
          <span>جاري التحميل</span>
          <div className="flex gap-1">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce-delay-150">.</span>
            <span className="animate-bounce-delay-300">.</span>
          </div>
        </div>

        <div className="h-1 w-48 overflow-hidden rounded-full bg-primary/20">
          <div className="loading-bar h-full w-1/2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
