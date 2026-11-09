import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Al Shehza Foundation | Compassion in Action",
  description: "Supporting people and families through water access, food assistance, seasonal giving, and learning resources. Compassion in action. Dignity for all.",
  icons: {
    icon: "/images/brand/al-shehza-circle-dark.webp",
    shortcut: "/images/brand/al-shehza-circle-dark.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
