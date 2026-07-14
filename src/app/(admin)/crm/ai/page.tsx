import { SparklesIcon, SendIcon, BotIcon } from "lucide-react";

export default function CopilotPage() {
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg mr-4">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Aarotech Copilot</h2>
          <p className="text-sm text-gray-500 mt-1">Your AI assistant for generating proposals, emails, and insights.</p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
        {/* Chat History */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-3 mt-1">
              <BotIcon className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-5 py-3 text-sm text-gray-800 max-w-[80%]">
              Hello! I&apos;m your Aarotech Copilot. I&apos;m connected to your CRM and Agency Workspace. How can I help you today?
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs font-medium bg-white border border-gray-200 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-50 transition-colors">
                  Draft a proposal for Acme Corp
                </span>
                <span className="text-xs font-medium bg-white border border-gray-200 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-50 transition-colors">
                  Write a follow-up email
                </span>
                <span className="text-xs font-medium bg-white border border-gray-200 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-50 transition-colors">
                  Summarize project health
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <form className="relative flex items-center">
            <input
              type="text"
              placeholder="Ask Copilot..."
              className="w-full bg-white border border-gray-300 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
            />
            <button
              type="button"
              className="absolute right-2 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
              aria-label="Send message"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
              AI-generated content may be inaccurate
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
