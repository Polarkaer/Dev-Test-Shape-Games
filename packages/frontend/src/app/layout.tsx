import type { Metadata } from "next";
import "bulma/css/bulma.min.css";

export const metadata: Metadata = {
  title: "Toll Passage Manager",
  description:
    "Review and manage congestion tax passages with hourly rules and fee caps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="has-background-black has-text-white">{children}</body>
    </html>
  );
}
