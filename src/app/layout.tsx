import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'نظام إدارة عيادة Delight Smile - د. عمر سالم',
  description: 'نظام الإدارة السحابي الشامل لعيادة الأسنان وبوابة المريض المستقلة - د. عمر سالم (الإسكندرية، مصر)',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png'
  }
};

export const viewport: Viewport = {
  themeColor: '#070709',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1" async></script>
      </head>
      <body className="bg-obsidian-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
