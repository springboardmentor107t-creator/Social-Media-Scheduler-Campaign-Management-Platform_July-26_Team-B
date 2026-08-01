import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SocialPilot | Campaign Management",
  description: "Modern Social Media Scheduler & Campaign Management Platform",
};

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            Social<span className="text-brand-500">Pilot</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/profile" className="text-slate-600 dark:text-slate-300 hover:text-foreground transition-colors">
            Profile
          </Link>
          <Link href="/social-accounts" className="text-slate-600 dark:text-slate-300 hover:text-foreground transition-colors">
            Accounts
          </Link>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
          <Link href="/login" className="hidden sm:block text-slate-600 dark:text-slate-300 hover:text-foreground transition-colors">
            Log in
          </Link>
          <Link href="/register" className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-full transition-all shadow-md shadow-brand-500/20 active:scale-95">
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative overflow-x-hidden">
        {/* Animated Background decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-400/20 dark:bg-brand-900/30 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 dark:bg-purple-900/30 blur-[120px]"></div>
        </div>
        
        <Navbar />
        <main className="flex-1 flex flex-col w-full h-full relative z-0">
          {children}
        </main>
      </body>
    </html>
  );
}
