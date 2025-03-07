import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Survey Dashboard",
  description: "Dashboard pour la répartition des réponses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
