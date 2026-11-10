import { assetPath } from "../lib/site-assets";
import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "../components/language-provider";

export const metadata: Metadata = {
  title: "Al Shehza Foundation | Compassion in Action",
  description: "Supporting people and families through water access, food assistance, seasonal giving, and learning resources. Compassion in action. Dignity for all.",
  icons: {
    icon: assetPath("/images/brand/al-shehza-circle-dark.webp"),
    shortcut: assetPath("/images/brand/al-shehza-circle-dark.webp"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{__html: `(function(){try{var t=localStorage.getItem('al-shehza-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light';document.documentElement.style.colorScheme=t==='dark'?'dark':'light'}catch(e){}})();`}}/></head>
      <body className="antialiased"><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}
