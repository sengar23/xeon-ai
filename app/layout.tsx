import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";

import "./styles/globals.css";
import { ThemeProvider } from "./provider";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
});

export const metadata: Metadata = {
  title: "Xeon AI",
  description: "In browser AI for everyone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${ibmPlexMono.variable}`}>
      <head>
        <link rel="icon" href="/xeon-icon.png" sizes="any" />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-JG1WC4V7V2"></Script>
        <Script id="google-analytics">
          {
            `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-JG1WC4V7V2');
            `
          }
          
        </Script>
      </head>
      <body className={`font-sans antialiased min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
