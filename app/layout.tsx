import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "porQpine Reel Brief — Plan a $10 vertical edit",
    template: "%s | porQpine Reel Brief",
  },
  description:
    "Plan one focused 9:16 edit, check it against the fixed $10 scope, and prepare a clean production handoff.",
  applicationName: "porQpine Reel Brief",
  keywords: [
    "vertical video editing",
    "reel brief",
    "short video",
    "9:16 video",
    "video editing brief",
  ],
  authors: [{ name: "porQpine" }],
  openGraph: {
    type: "website",
    title: "porQpine Reel Brief",
    description:
      "A clear, interactive scope checker for one $10 vertical short edit.",
    siteName: "porQpine Reel Brief",
  },
  twitter: {
    card: "summary",
    title: "porQpine Reel Brief",
    description:
      "Plan one 9:16 edit and check it against the fixed $10 package.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
