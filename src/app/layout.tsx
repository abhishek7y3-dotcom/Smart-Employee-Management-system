import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "../styles/globals.css";
import { TaskProvider } from "../context/TaskContext";
import { ThemeProvider } from "../context/ThemeContext";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Employee Task Manager",
  description: "A production-ready dashboard for tracking employee task work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-zinc-50 text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
        <TaskProvider>
          <ThemeProvider>
            <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 transition-colors duration-300 dark:bg-zinc-950">
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-zinc-50 p-4 transition-colors duration-300 dark:bg-zinc-950 md:p-8">
                  {children}
                </main>
              </div>
            </div>
            <Toaster richColors position="top-right" closeButton />
          </ThemeProvider>
        </TaskProvider>
      </body>
    </html>
  );
}

