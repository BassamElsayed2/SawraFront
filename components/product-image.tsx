"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { FALLBACK_LOGO, getImageUrl } from "@/lib/image-url";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export default function ProductImage({
  src,
  alt,
  className,
  fallbackClassName,
}: ProductImageProps) {
  const resolved = getImageUrl(src);
  const [imgSrc, setImgSrc] = useState(resolved);
  const isFallback =
    imgSrc === FALLBACK_LOGO || imgSrc.endsWith(FALLBACK_LOGO);

  useEffect(() => {
    setImgSrc(getImageUrl(src));
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={cn(
        isFallback
          ? (fallbackClassName ??
              "h-full w-full object-contain bg-gray-50 p-6")
          : className,
      )}
      onError={() => setImgSrc(FALLBACK_LOGO)}
    />
  );
}
