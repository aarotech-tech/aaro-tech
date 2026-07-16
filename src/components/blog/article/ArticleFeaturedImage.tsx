import { FallbackImage as Image } from "@/components/ui/fallback-image";

interface ArticleFeaturedImageProps {
  src?: string;
  alt: string;
}

export function ArticleFeaturedImage({ src, alt }: ArticleFeaturedImageProps) {
  if (!src) return null; // Graceful fallback if no image is present

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-0 max-w-7xl flex justify-center">
      <Image
        src={src}
        alt={alt}
        width={0}
        height={0}
        priority
        sizes="(max-width: 1280px) 100vw, 1280px"
        className="w-auto h-auto max-w-full max-h-[550px] rounded-2xl md:rounded-3xl shadow-xl"
      />
    </div>
  );
}
