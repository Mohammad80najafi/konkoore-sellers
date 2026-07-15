// KonkoorBaz Application Constants

export const SITE_NAME = "کنکورباز";
export const SITE_NAME_EN = "KonkoorBaz";
export const SITE_DESCRIPTION =
  "سامانه اهدای رایگان کتاب‌های دست دوم کنکور — بخون و ببخش";

// ===== Fields of Study =====
export const FIELDS_OF_STUDY = [
  { id: "experimental", label: "تجربی", icon: "🔬" },
  { id: "mathematics", label: "ریاضی", icon: "📐" },
  { id: "humanities", label: "انسانی", icon: "📚" },
  { id: "art", label: "هنر", icon: "🎨" },
  { id: "languages", label: "زبان", icon: "🌍" },
] as const;

export type FieldOfStudy = (typeof FIELDS_OF_STUDY)[number]["id"];

// ===== Grades =====
export const GRADES = [
  { id: "10", label: "پایه دهم" },
  { id: "11", label: "پایه یازدهم" },
  { id: "12", label: "پایه دوازدهم" },
  { id: "konkoor", label: "جمع‌بندی کنکور" },
] as const;

export type Grade = (typeof GRADES)[number]["id"];

// ===== Book Conditions =====
export const BOOK_CONDITIONS = [
  {
    id: "like-new",
    label: "نو",
    description: "بدون هیچ استفاده‌ای، مثل نو",
    color: "text-success-600",
    bgColor: "bg-success-50",
    score: 5,
  },
  {
    id: "excellent",
    label: "عالی",
    description: "استفاده بسیار کم، بدون خط‌خوردگی",
    color: "text-navy-600",
    bgColor: "bg-navy-50",
    score: 4,
  },
  {
    id: "good",
    label: "خوب",
    description: "استفاده معمولی، ممکن است خط‌خوردگی جزئی داشته باشد",
    color: "text-accent-600",
    bgColor: "bg-accent-50",
    score: 3,
  },
  {
    id: "acceptable",
    label: "قابل قبول",
    description: "استفاده زیاد، خط‌خوردگی و یادداشت دارد",
    color: "text-warning-600",
    bgColor: "bg-warning-50",
    score: 2,
  },
  {
    id: "heavily-used",
    label: "استفاده شدید",
    description: "استفاده بسیار زیاد، ممکن است آسیب‌دیدگی داشته باشد",
    color: "text-danger-600",
    bgColor: "bg-danger-50",
    score: 1,
  },
] as const;

export type BookConditionId = (typeof BOOK_CONDITIONS)[number]["id"];

// ===== Condition Defects =====
export const CONDITION_DEFECTS = [
  { id: "highlighting", label: "هایلایت شده", icon: "🖍️" },
  { id: "handwritten-notes", label: "یادداشت دست‌نویس", icon: "✏️" },
  { id: "torn-pages", label: "صفحات پاره", icon: "📄" },
  { id: "missing-pages", label: "صفحات گمشده", icon: "❌" },
  { id: "answers-completed", label: "تست‌ها پاسخ داده شده", icon: "✅" },
  { id: "cover-damaged", label: "جلد آسیب‌دیده", icon: "📕" },
  { id: "has-cd", label: "سی‌دی / DVD دارد", icon: "💿" },
  { id: "has-supplement", label: "کتاب تکمیلی دارد", icon: "📎" },
] as const;

// ===== Price Indicator =====
export const PRICE_INDICATORS = {
  great: { label: "اهدای رایگان", color: "text-success-600", bgColor: "bg-success-50", icon: "🎁" },
  fair: { label: "آماده اهدا", color: "text-accent-600", bgColor: "bg-accent-50", icon: "🤲" },
  high: { label: "در انتظار هماهنگی", color: "text-warning-600", bgColor: "bg-warning-50", icon: "💬" },
} as const;

export type PriceIndicator = keyof typeof PRICE_INDICATORS;

// ===== Subjects Per Field =====
export const SUBJECTS: Record<string, { id: string; label: string }[]> = {
  experimental: [
    { id: "math", label: "ریاضی" },
    { id: "physics", label: "فیزیک" },
    { id: "chemistry", label: "شیمی" },
    { id: "biology", label: "زیست‌شناسی" },
    { id: "persian", label: "ادبیات فارسی" },
    { id: "arabic", label: "عربی" },
    { id: "english", label: "زبان انگلیسی" },
    { id: "religion", label: "دین و زندگی" },
    { id: "general", label: "دروس عمومی" },
  ],
  mathematics: [
    { id: "math", label: "ریاضی" },
    { id: "physics", label: "فیزیک" },
    { id: "chemistry", label: "شیمی" },
    { id: "geometry", label: "هندسه" },
    { id: "discrete-math", label: "ریاضیات گسسته" },
    { id: "persian", label: "ادبیات فارسی" },
    { id: "arabic", label: "عربی" },
    { id: "english", label: "زبان انگلیسی" },
    { id: "religion", label: "دین و زندگی" },
  ],
  humanities: [
    { id: "persian", label: "ادبیات فارسی" },
    { id: "arabic", label: "عربی" },
    { id: "english", label: "زبان انگلیسی" },
    { id: "religion", label: "دین و زندگی" },
    { id: "history", label: "تاریخ" },
    { id: "geography", label: "جغرافیا" },
    { id: "sociology", label: "جامعه‌شناسی" },
    { id: "philosophy", label: "فلسفه و منطق" },
    { id: "psychology", label: "روان‌شناسی" },
    { id: "economics", label: "اقتصاد" },
  ],
  art: [
    { id: "persian", label: "ادبیات فارسی" },
    { id: "arabic", label: "عربی" },
    { id: "english", label: "زبان انگلیسی" },
    { id: "art-basics", label: "مبانی هنر" },
    { id: "drawing", label: "طراحی" },
    { id: "art-history", label: "تاریخ هنر" },
  ],
  languages: [
    { id: "persian", label: "ادبیات فارسی" },
    { id: "english", label: "زبان انگلیسی" },
    { id: "arabic", label: "عربی" },
    { id: "linguistics", label: "زبان‌شناسی" },
    { id: "grammar", label: "دستور زبان" },
  ],
};

// ===== Popular Publishers =====
export const PUBLISHERS = [
  { id: "gaj", name: "گاج", logo: "" },
  { id: "ghalam-chi", name: "قلم‌چی", logo: "" },
  { id: "khayyam", name: "خیلی سبز", logo: "" },
  { id: "mega", name: "مگا بوک", logo: "" },
  { id: "neshre-algor", name: "نشر الگو", logo: "" },
  { id: "madreseh", name: "مدرسه", logo: "" },
  { id: "kanoon", name: "کانون فرهنگی آموزش", logo: "" },
  { id: "mabna", name: "مبتکران", logo: "" },
  { id: "iqa", name: "خوشخوان", logo: "" },
  { id: "mehr-o-mah", name: "مهروماه", logo: "" },
  { id: "mikreh", name: "میکرو طبقه‌بندی", logo: "" },
  { id: "nardebaan", name: "نردبان", logo: "" },
] as const;

// ===== Provinces & Cities =====
export const PROVINCES = [
  {
    id: "tehran",
    name: "تهران",
    cities: ["تهران", "شهریار", "اسلامشهر", "ورامین", "پاکدشت", "ری"],
  },
  {
    id: "isfahan",
    name: "اصفهان",
    cities: ["اصفهان", "کاشان", "نجف‌آباد", "خمینی‌شهر"],
  },
  {
    id: "fars",
    name: "فارس",
    cities: ["شیراز", "مرودشت", "جهرم", "فسا"],
  },
  {
    id: "khorasan-razavi",
    name: "خراسان رضوی",
    cities: ["مشهد", "نیشابور", "سبزوار", "تربت حیدریه"],
  },
  {
    id: "east-azarbaijan",
    name: "آذربایجان شرقی",
    cities: ["تبریز", "مراغه", "مرند", "اهر"],
  },
  {
    id: "mazandaran",
    name: "مازندران",
    cities: ["ساری", "بابل", "آمل", "قائم‌شهر"],
  },
  {
    id: "khuzestan",
    name: "خوزستان",
    cities: ["اهواز", "آبادان", "دزفول", "خرمشهر"],
  },
  {
    id: "alborz",
    name: "البرز",
    cities: ["کرج", "فردیس", "نظرآباد", "اشتهارد"],
  },
  {
    id: "gilan",
    name: "گیلان",
    cities: ["رشت", "لاهیجان", "بندر انزلی", "آستارا"],
  },
  {
    id: "qom",
    name: "قم",
    cities: ["قم"],
  },
  {
    id: "kermanshah",
    name: "کرمانشاه",
    cities: ["کرمانشاه", "اسلام‌آباد غرب"],
  },
  {
    id: "hormozgan",
    name: "هرمزگان",
    cities: ["بندرعباس", "قشم", "کیش"],
  },
] as const;

// ===== Shipping Methods =====
export const SHIPPING_METHODS = [
  { id: "post", label: "پست پیشتاز", price: 45000, days: "۲ تا ۴ روز کاری" },
  { id: "tipax", label: "تیپاکس", price: 65000, days: "۱ تا ۲ روز کاری" },
  { id: "pickup", label: "تحویل حضوری", price: 0, days: "توافقی" },
] as const;

// ===== Sort Options =====
export const SORT_OPTIONS = [
  { id: "newest", label: "جدیدترین" },
  { id: "condition", label: "بهترین وضعیت" },
  { id: "closest", label: "نزدیک‌ترین اهداکننده" },
  { id: "views", label: "پربازدیدترین" },
] as const;

// ===== Listing Types =====
export const LISTING_TYPES = [
  { id: "single", label: "تکی" },
  { id: "bundle", label: "پکیج" },
] as const;

// ===== How It Works Steps =====
export const HOW_IT_WORKS_STEPS = {
  buy: [
    {
      step: 1,
      title: "جستجو کنید",
      description: "کتاب مورد نظرتان را بر اساس رشته، پایه یا ناشر پیدا کنید",
      icon: "search",
    },
    {
      step: 2,
      title: "بررسی و انتخاب",
      description: "وضعیت و محل تحویل کتاب‌ها را ببینید و مناسب‌ترین را انتخاب کنید",
      icon: "compare",
    },
    {
      step: 3,
      title: "هماهنگی دریافت",
      description: "با اهداکننده گفت‌وگو کنید و روش تحویل کتاب را هماهنگ کنید",
      icon: "secure",
    },
  ],
  sell: [
    {
      step: 1,
      title: "عکس بگیرید",
      description: "از کتابتان چند عکس واضح بگیرید و وضعیتش را مشخص کنید",
      icon: "camera",
    },
    {
      step: 2,
      title: "روش تحویل را مشخص کنید",
      description: "شهر و امکان ارسال پستی یا تحویل حضوری را انتخاب کنید",
      icon: "share",
    },
    {
      step: 3,
      title: "ببخشید",
      description: "گیرنده پیدا شد؛ کتاب را تحویل دهید و چرخه مطالعه را ادامه دهید",
      icon: "give",
    },
  ],
};

// ===== Testimonials =====
export const TESTIMONIALS = [
  {
    id: 1,
    name: "سارا محمدی",
    field: "تجربی",
    avatar: "",
    text: "کتاب‌های کنکورم را از کنکورباز رایگان گرفتم. همه در وضعیت خوبی بودند و بعد از کنکور دوباره اهداشان می‌کنم.",
    rating: 5,
    savedAmount: 3200000,
  },
  {
    id: 2,
    name: "علی رضایی",
    field: "ریاضی",
    avatar: "",
    text: "بعد از کنکور، همه کتاب‌هایم را اینجا اهدا کردم. خیلی سریع به دست چند دانش‌آموز دیگر رسیدند.",
    rating: 5,
    savedAmount: 0,
  },
  {
    id: 3,
    name: "مریم حسینی",
    field: "انسانی",
    avatar: "",
    text: "کتاب شیمی‌ام را بخشیدم و یک کتاب فلسفه اهدایی پیدا کردم. حس ادامه‌دادن این چرخه خیلی خوب است.",
    rating: 4,
    savedAmount: 450000,
  },
  {
    id: 4,
    name: "امیرحسین کریمی",
    field: "تجربی",
    avatar: "",
    text: "پکیج کامل زیست را رایگان تحویل گرفتم. کیفیت کتاب‌ها عالی بود و قرار است بعداً به نفر بعدی برسند.",
    rating: 5,
    savedAmount: 1800000,
  },
];

// ===== Sustainability Stats =====
export const SUSTAINABILITY_STATS = [
  { label: "کتاب بازیافت شده", value: "۱۲,۵۰۰+", icon: "book" },
  { label: "اهدای موفق کتاب", value: "۹,۸۰۰+", icon: "gift" },
  { label: "صفحه کاغذ نجات‌یافته", value: "۳.۸ میلیون", icon: "leaf" },
  { label: "دانش‌آموز فعال", value: "۲۵,۰۰۰+", icon: "users" },
];
