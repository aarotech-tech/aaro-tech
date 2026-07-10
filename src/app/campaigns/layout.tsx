import Link from "next/link";
import { FallbackImage as Image } from "@/components/ui/fallback-image";

export default function CampaignLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full z-50 border-b border-white/10 bg-slate-950 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-center sm:justify-start">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/aarotech-logos/footer-logo-primary.png"
              alt="Aarotech"
              width={200}
              height={60}
              className="h-10 md:h-12 w-auto object-contain"
              priority
            />
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
