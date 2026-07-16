import { FAQSection } from "@/components/shared/FAQSection";

interface ArticleFAQProps {
  faqs?: { question: string; answer: string }[];
}

export function ArticleFAQ({ faqs }: ArticleFAQProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="bg-slate-50 border-t border-slate-100 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <FAQSection faqs={faqs} title="Frequently Asked Questions" />
      </div>
    </div>
  );
}
