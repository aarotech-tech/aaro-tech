import { ContactPopup } from "@/components/shared/ContactPopup";

export function ArticleCTA() {
  return (
    <div className="bg-slate-900 text-white rounded-3xl p-8 text-center shadow-xl">
      <h3 className="text-xl font-bold mb-3">Not sure what your business needs next?</h3>
      <p className="text-slate-300 text-sm mb-6">
        Get a practical growth plan based on your business, goals, and market.
      </p>
      <ContactPopup>
        <button className="block w-full py-3 px-4 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors">
          Get My Free Growth Plan
        </button>
      </ContactPopup>
    </div>
  );
}
