import FileUpload from '@/components/FileUpload';
import Link from 'next/link';

export default function Home() {
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
          <nav className="hidden sm:flex gap-6 text-sm text-gray-400">
            <Link href="/how-it-works" className="hover:text-gray-200 transition-colors">
              How it works
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-100">
            Fill Your Legal Documents with AI
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
            Upload your legal document template and let our AI guide you through
            filling in all the required information conversationally.
          </p>
        </div>

        <FileUpload />
      </main>
    </div>
  );
}
