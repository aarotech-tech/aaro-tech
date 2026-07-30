import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

interface AuthorBioProps {
  authorName: string;
  role?: string;
  avatarUrl?: string;
  bio?: string;
}

export function AuthorBio({ 
  authorName, 
  role = "Digital Strategy Expert",
  avatarUrl = "/images/aarotech-icon.png", // Using a default brand icon
  bio = "Aarotech's strategy team specializes in high-performance digital marketing, technical SEO, and conversion rate optimization for businesses across Tamil Nadu."
}: AuthorBioProps) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8 my-12 flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-start text-center sm:text-left">
      <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0 bg-white rounded-full p-2 shadow-sm border border-slate-200">
        <Image
          src={avatarUrl}
          alt={authorName}
          fill
          className="object-contain rounded-full p-1.5"
        />
      </div>
      <div>
        <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
          {authorName}
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
        </h4>
        <p className="text-xs sm:text-sm font-semibold text-primary mb-3 uppercase tracking-wider">{role}</p>
        <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
          {bio}
        </p>
      </div>
    </div>
  );
}
