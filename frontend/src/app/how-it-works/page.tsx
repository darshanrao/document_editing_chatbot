'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex justify-between items-center">
          <Link 
            href="/"
            className="text-xl sm:text-2xl font-bold text-primary hover:opacity-80 transition-opacity cursor-pointer"
          >
            ⚖️ LegalDoc Filler
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gray-100">
            How It Works
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
            Fill out your legal documents the easy way—just have a conversation with our AI assistant.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12">
          {/* Step 1 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-100 mb-3">
                Upload Your Document
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Simply drag and drop your legal document (like a contract, agreement, or form) 
                onto our upload area, or click to browse and select it from your computer. 
                We support Word documents (.docx) up to 10MB.
              </p>
              <div className="bg-dark-lighter border border-dark-border rounded-lg p-4">
                <p className="text-sm text-gray-400">
                  <strong className="text-primary">💡 Tip:</strong> Make sure your document has 
                  placeholder text like [CLIENT_NAME] or [DATE] that needs to be filled in.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-100 mb-3">
                AI Analyzes Your Document
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Our AI assistant quickly scans through your document to identify all the fields 
                that need to be filled in. This happens automatically—you don't need to do anything. 
                It usually takes just a few seconds.
              </p>
              <div className="bg-dark-lighter border border-dark-border rounded-lg p-4">
                <p className="text-sm text-gray-400">
                  <strong className="text-primary">🔍 What happens:</strong> The AI finds placeholders 
                  like names, dates, addresses, amounts, and other information that needs to be completed.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-100 mb-3">
                Have a Conversation
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Instead of filling out a complicated form, you'll have a friendly chat with our AI assistant. 
                It will ask you questions one at a time in natural, conversational language. Just answer 
                as you would to a real person—no need to worry about specific formats or technical terms.
              </p>
              <div className="bg-dark-lighter border border-dark-border rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-3">
                  <strong className="text-primary">Example:</strong>
                </p>
                <div className="space-y-3 text-sm">
                  <div className="bg-dark-panel p-3 rounded border-l-2 border-primary">
                    <p className="text-gray-300 font-medium mb-1">AI:</p>
                    <p className="text-gray-400">What's the client's full name?</p>
                  </div>
                  <div className="bg-dark-panel p-3 rounded border-l-2 border-gray-600">
                    <p className="text-gray-300 font-medium mb-1">You:</p>
                    <p className="text-gray-400">John Smith</p>
                  </div>
                  <div className="bg-dark-panel p-3 rounded border-l-2 border-primary">
                    <p className="text-gray-300 font-medium mb-1">AI:</p>
                    <p className="text-gray-400">Great! What's the contract start date?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                4
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-100 mb-3">
                AI Understands and Validates
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                The AI understands your answers even if you write them in different ways. It also 
                checks to make sure everything is in the right format. If something doesn't look right, 
                it will politely ask you to clarify—just like a helpful assistant would.
              </p>
              <div className="bg-dark-lighter border border-dark-border rounded-lg p-4">
                <p className="text-sm text-gray-400">
                  <strong className="text-primary">✅ Smart validation:</strong> If you say 
                  "December 15th, 2024" or "12/15/2024", the AI understands both and formats 
                  it correctly for your document.
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                5
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-100 mb-3">
                See Your Progress
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                As you answer questions, you can watch your document fill in real-time. A preview 
                panel shows you exactly how the completed document will look, and a progress bar 
                keeps track of how many fields you've finished.
              </p>
            </div>
          </div>

          {/* Step 6 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                6
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-100 mb-3">
                Download Your Completed Document
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Once all fields are filled, you're done! Download your completed document with all 
                the information filled in correctly. You can also have it emailed directly to you 
                or someone else.
              </p>
              <div className="bg-dark-lighter border border-dark-border rounded-lg p-4">
                <p className="text-sm text-gray-400">
                  <strong className="text-primary">📥 Ready to use:</strong> Your document is 
                  ready to sign, print, or share—just like you filled it out yourself, but in 
                  a fraction of the time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 pt-12 border-t border-dark-border">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-8">
            Why Use LegalDoc Filler?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-dark-lighter border border-dark-border rounded-lg p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Faster Than Forms</h3>
              <p className="text-gray-400">
                No more struggling with confusing forms. Just answer simple questions naturally.
              </p>
            </div>
            <div className="bg-dark-lighter border border-dark-border rounded-lg p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Always Accurate</h3>
              <p className="text-gray-400">
                The AI ensures everything is formatted correctly and catches mistakes for you.
              </p>
            </div>
            <div className="bg-dark-lighter border border-dark-border rounded-lg p-6">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Natural Conversation</h3>
              <p className="text-gray-400">
                Talk to the AI like you would to a helpful assistant—no technical jargon needed.
              </p>
            </div>
            <div className="bg-dark-lighter border border-dark-border rounded-lg p-6">
              <div className="text-3xl mb-3">👀</div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Live Preview</h3>
              <p className="text-gray-400">
                See your document fill in real-time as you answer each question.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors text-lg"
          >
            Get Started Now
          </Link>
        </div>
      </main>
    </div>
  );
}

