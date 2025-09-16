import type { Metadata } from "next";
import { Inter, Red_Hat_Mono } from "next/font/google";
import "./globals.css";
import { getSession } from "@/app/auth";
import Providers from "./providers";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const redhatMono = Red_Hat_Mono({
  variable: "--font-redhat-mono",
  subsets: ["latin"],
});

const APP_NAME = "Babel Wall Demo";
const APP_DEFAULT_TITLE = "Babel Wall Demo";
const APP_TITLE_TEMPLATE = "%s - Babel Wall Demo";
const APP_DESCRIPTION =
  "An Ultra-Overflowing List Inspired by the Library of Babel.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body
        className={`${interSans.variable} ${redhatMono.variable} antialiased`}
      >
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
