import '@/styles/globals.css';
import Script from 'next/script';
export const metadata = {
  title: 'Nether AI',
  description: 'Create AI-powered presentations with strategic angles and blueprints.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        {/* Load shared scripts once via Next.js to prevent multiple instances */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.fog.min.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
