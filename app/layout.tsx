import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const vazirmatn = localFont({
  src: [
    {
      path: "../public/fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Vazirmatn-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Vazirmatn-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/fonts/Vazirmatn-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "کنکورباز — خرید و فروش کتاب دست دوم کنکور",
    template: "%s | کنکورباز",
  },
  description:
    "بازار آنلاین خرید و فروش کتاب‌های دست دوم کنکور. کتاب‌های تجربی، ریاضی، انسانی، هنر و زبان را ارزان‌تر بخرید یا کتاب‌هایتان را بفروشید.",
  keywords: [
    "کنکور",
    "کتاب دست دوم",
    "خرید کتاب کنکور",
    "فروش کتاب کنکور",
    "کتاب تجربی",
    "کتاب ریاضی",
    "کتاب انسانی",
    "کنکورباز",
  ],
  authors: [{ name: "کنکورباز" }],
  openGraph: {
    title: "کنکورباز — خرید و فروش کتاب دست دوم کنکور",
    description:
      "کتاب‌های کنکورت رو ارزون‌تر بخر، راحت‌تر بفروش. بازار آنلاین کتاب‌های دست دوم کنکور.",
    siteName: "کنکورباز",
    locale: "fa_IR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
