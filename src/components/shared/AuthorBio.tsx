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
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 my-12 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
      <div className="w-20 h-20 relative flex-shrink-0 bg-white rounded-full p-2 shadow-sm border border-slate-200">
        <img
          src={avatarUrl}
          alt={authorName}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      <div>
        <h4 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          {authorName}
          <CheckCircle2 className="w-5 h-5 text-primary" />
        </h4>
        <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">{role}</p>
        <p className="text-slate-600 leading-relaxed">
          {bio}
        </p>
      </div>
    </div>
  );
}
