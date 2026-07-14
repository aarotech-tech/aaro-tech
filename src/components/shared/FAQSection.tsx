import { generateFAQSchema } from "@/lib/seo";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  description?: string;
}

export function FAQSection({ faqs, title = "Frequently Asked Questions", description }: FAQSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  const schema = generateFAQSchema(faqs);

  return (
    <section className="py-20 bg-slate-950 text-white">
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          {description && <p className="text-slate-400 text-lg">{description}</p>}
        </div>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
              <h3 className="text-xl font-semibold mb-3 text-slate-100">{faq.question}</h3>
              <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
