import Link from "next/link";
import Logo from "./Logo";

const footerLinks = {
  marketplace: {
    title: "بازار",
    links: [
      { href: "/marketplace", label: "همه کتاب‌ها" },
      { href: "/marketplace?type=bundle", label: "پکیج‌ها" },
      { href: "/marketplace?field=experimental", label: "کتاب‌های تجربی" },
      { href: "/marketplace?field=mathematics", label: "کتاب‌های ریاضی" },
      { href: "/marketplace?field=humanities", label: "کتاب‌های انسانی" },
    ],
  },
  sellers: {
    title: "فروشندگان",
    links: [
      { href: "/create-listing", label: "فروش کتاب" },
      { href: "/dashboard", label: "داشبورد من" },
      { href: "/faq", label: "راهنمای فروش" },
    ],
  },
  support: {
    title: "پشتیبانی",
    links: [
      { href: "/about", label: "درباره ما" },
      { href: "/faq", label: "سؤالات متداول" },
      { href: "/safety", label: "راهنمای امنیت" },
      { href: "/terms", label: "قوانین و مقررات" },
    ],
  },
};

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" className="mb-4 [&_span]:text-white [&_.text-accent-500]:text-accent-400" />
            <p className="text-sm text-navy-200 leading-relaxed mb-4">
              بازار آنلاین خرید و فروش کتاب‌های دست دوم کنکور. ارزان‌تر بخر، راحت‌تر بفروش و به محیط زیست کمک کن.
            </p>
            <div className="flex items-center gap-3">
              {/* Social placeholder icons */}
              <a
                href="#"
                className="w-9 h-9 bg-navy-800 hover:bg-navy-700 rounded-lg flex items-center justify-center transition-colors"
                aria-label="اینستاگرام"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-navy-800 hover:bg-navy-700 rounded-lg flex items-center justify-center transition-colors"
                aria-label="تلگرام"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-sm text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-navy-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-10 pt-8 border-t border-navy-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-navy-300 text-xs">
              <svg className="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              پرداخت امن
            </div>
            <div className="flex items-center gap-2 text-navy-300 text-xs">
              <svg className="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              ضمانت بازگشت وجه
            </div>
            <div className="flex items-center gap-2 text-navy-300 text-xs">
              <svg className="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              پشتیبانی ۲۴/۷
            </div>
          </div>

          <p className="text-xs text-navy-400">
            © ۱۴۰۵ کنکورباز. تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
}
