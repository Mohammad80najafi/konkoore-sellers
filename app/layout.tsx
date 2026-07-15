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
    default: "کنکورباز — اهدای کتاب کنکور | بخون و ببخش",
    template: "%s | کنکورباز",
  },
  description:
    "سامانه اهدای رایگان کتاب‌های دست دوم کنکور. کتاب مورد نیازت را پیدا کن یا کتاب‌هایت را به دانش‌آموز بعدی ببخش.",
  keywords: [
    "کنکور",
    "کتاب دست دوم",
    "اهدای کتاب کنکور",
    "کتاب کنکور رایگان",
    "کتاب تجربی",
    "کتاب ریاضی",
    "کتاب انسانی",
    "کنکورباز",
  ],
  authors: [{ name: "کنکورباز" }],
  openGraph: {
    title: "کنکورباز — بخون و ببخش",
    description:
      "کتاب کنکورت را رایگان پیدا کن یا به دانش‌آموز بعدی ببخش. بخون و ببخش.",
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
      data-scroll-behavior="smooth"
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
