import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import CommandPalette from "../components/CommandPalette";
import { ToastProvider } from "../components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SocialPilot | Campaign Management & Multi-Channel Scheduler",
  description:
    "Next-Generation Multi-Channel Social Media Scheduling & Campaign Management Platform",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative overflow-x-hidden">
        <ToastProvider>
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="blob-1 absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-500"></div>
            <div className="blob-2 absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-500"></div>
          </div>

          <Navbar />
          <CommandPalette />
          <main className="flex-1 flex flex-col w-full h-full relative z-0">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}