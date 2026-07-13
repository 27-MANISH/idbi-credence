import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Credence AI — MSME Credit Underwriting Platform',
  description:
    'AI-powered credit assurance platform for MSME borrowers and bank credit officers. Transparent, real-time underwriting powered by GST, UPI, AA, and EPFO signals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-fin-bg transition-colors duration-300">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-200/30 py-5 text-center font-mono text-[10px] text-fin-text-muted mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>
              © 2026 Credence AI. Verified against national GST, MCA, EPFO and RBI registries.
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-fin-success animate-pulse inline-block" />
                Statutory Node Operational
              </span>
              <span>AES-256 Certified · DPDP Compliant</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
