import Link from 'next/link';

export function ArticleFeedback() {
  return (
    <div className="mt-16 bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Was this guide useful?</h3>
        <p className="text-slate-600 text-sm">Have more questions? Our experts are here to help.</p>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Link href="/#contact" className="flex-1 sm:flex-none text-center px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors">
          Speak to an Expert
        </Link>
      </div>
    </div>
  );
}
