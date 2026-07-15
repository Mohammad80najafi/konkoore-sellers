import { setServers } from "node:dns";
import mongoose from "mongoose";
import Conversation from "../lib/models/Conversation";
import Listing from "../lib/models/Listing";
import Message from "../lib/models/Message";
import Publisher from "../lib/models/Publisher";
import User from "../lib/models/User";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "konkoorbaz";
const ALLOW_LOCAL_SEED = process.env.ALLOW_LOCAL_SEED === "true";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required. Add the Atlas connection string to .env.local.");
}

const isLocalTarget = /(?:localhost|127\.0\.0\.1|\[::1\])/i.test(MONGODB_URI);

if (isLocalTarget && !ALLOW_LOCAL_SEED) {
  throw new Error(
    "The seed target is local MongoDB. Set an Atlas MONGODB_URI, or explicitly set ALLOW_LOCAL_SEED=true.",
  );
}

if (process.platform === "win32" && MONGODB_URI.startsWith("mongodb+srv://")) {
  setServers(["1.1.1.1", "8.8.8.8"]);
}

const publishers = [
  { name: "گاج", slug: "gaj" },
  { name: "قلم‌چی", slug: "ghalam-chi" },
  { name: "خیلی سبز", slug: "kheili-sabz" },
  { name: "مگا بوک", slug: "mega-book" },
  { name: "نشر الگو", slug: "nashr-olgu" },
  { name: "مبتکران", slug: "mobtakeran" },
  { name: "کانون فرهنگی آموزش", slug: "kanoon" },
  { name: "مدرسه", slug: "madreseh" },
  { name: "مهروماه", slug: "mehr-o-mah" },
  { name: "میکرو طبقه‌بندی", slug: "micro" },
  { name: "نردبان", slug: "nardebaan" },
  { name: "خوشخوان", slug: "khoshkhaan" },
] as const;

const names = [
  "محمد رضایی",
  "زهرا احمدی",
  "امیرعلی حسینی",
  "فاطمه موسوی",
  "رضا کریمی",
  "نازنین عباسی",
  "حسین نوری",
  "سارا محمدی",
  "علی اکبری",
  "مریم قاسمی",
  "پارسا مرادی",
  "نگار حیدری",
  "آرمان صادقی",
  "یلدا کاظمی",
  "سامان جعفری",
  "ریحانه رستمی",
  "کیان محمودی",
  "آوا شریفی",
  "متین یوسفی",
  "هستی امینی",
  "محمدمهدی رحیمی",
  "بهار سلیمانی",
  "آریا نادری",
  "مبینا طاهری",
  "بردیا قربانی",
  "ستایش زارعی",
  "عرفان میرزایی",
  "ترانه فراهانی",
  "پوریا اسدی",
  "مهسا نوروزی",
] as const;

const locations = [
  { province: "تهران", city: "تهران" },
  { province: "اصفهان", city: "اصفهان" },
  { province: "فارس", city: "شیراز" },
  { province: "خراسان رضوی", city: "مشهد" },
  { province: "آذربایجان شرقی", city: "تبریز" },
  { province: "مازندران", city: "ساری" },
  { province: "خوزستان", city: "اهواز" },
  { province: "البرز", city: "کرج" },
  { province: "گیلان", city: "رشت" },
  { province: "قم", city: "قم" },
  { province: "کرمانشاه", city: "کرمانشاه" },
  { province: "هرمزگان", city: "بندرعباس" },
] as const;

const books = [
  { title: "زیست‌شناسی جامع کنکور", author: "اشکان هاشمی", publisher: "gaj", field: "experimental", grade: "konkoor", subject: "biology", price: 980_000 },
  { title: "ریاضی تجربی جامع", author: "مهدی امینی‌راد", publisher: "ghalam-chi", field: "experimental", grade: "konkoor", subject: "math", price: 850_000 },
  { title: "فیزیک دوازدهم", author: "محمد عبداللهی", publisher: "kheili-sabz", field: "experimental", grade: "12", subject: "physics", price: 720_000 },
  { title: "شیمی جامع کنکور", author: "بهمن بازرگانی", publisher: "gaj", field: "experimental", grade: "konkoor", subject: "chemistry", price: 920_000 },
  { title: "هندسه تحلیلی و جبر خطی", author: "احمد صادقی", publisher: "mobtakeran", field: "mathematics", grade: "12", subject: "geometry", price: 780_000 },
  { title: "حسابان دوازدهم", author: "مصطفی باقری", publisher: "kheili-sabz", field: "mathematics", grade: "12", subject: "math", price: 690_000 },
  { title: "ریاضیات گسسته", author: "علیرضا علیزاده", publisher: "nashr-olgu", field: "mathematics", grade: "12", subject: "discrete-math", price: 640_000 },
  { title: "فیزیک جامع رشته ریاضی", author: "رضا ناظمی", publisher: "mehr-o-mah", field: "mathematics", grade: "konkoor", subject: "physics", price: 890_000 },
  { title: "ادبیات فارسی جامع", author: "علی‌اصغر حسینی", publisher: "nashr-olgu", field: "humanities", grade: "konkoor", subject: "persian", price: 650_000 },
  { title: "عربی کامل کنکور", author: "حسین ادیب", publisher: "ghalam-chi", field: "humanities", grade: "konkoor", subject: "arabic", price: 580_000 },
  { title: "تاریخ ایران و جهان", author: "مریم افشار", publisher: "madreseh", field: "humanities", grade: "konkoor", subject: "history", price: 560_000 },
  { title: "جغرافیای جامع", author: "کامران فرهمند", publisher: "kanoon", field: "humanities", grade: "konkoor", subject: "geography", price: 510_000 },
  { title: "جامعه‌شناسی جامع", author: "سارا نامور", publisher: "gaj", field: "humanities", grade: "konkoor", subject: "sociology", price: 590_000 },
  { title: "فلسفه و منطق جامع", author: "کامران رحیمی", publisher: "nashr-olgu", field: "humanities", grade: "konkoor", subject: "philosophy", price: 620_000 },
  { title: "روان‌شناسی جامع کنکور", author: "لیلا شهبازی", publisher: "ghalam-chi", field: "humanities", grade: "konkoor", subject: "psychology", price: 540_000 },
  { title: "اقتصاد کنکور", author: "مهدی آزاد", publisher: "kheili-sabz", field: "humanities", grade: "konkoor", subject: "economics", price: 480_000 },
  { title: "درک عمومی هنر", author: "نیلوفر احمدی", publisher: "kanoon", field: "art", grade: "konkoor", subject: "art-basics", price: 760_000 },
  { title: "تاریخ هنر ایران و جهان", author: "بهنام رضوانی", publisher: "madreseh", field: "art", grade: "konkoor", subject: "art-history", price: 680_000 },
  { title: "طراحی پایه کنکور هنر", author: "سمانه قنبری", publisher: "nardebaan", field: "art", grade: "konkoor", subject: "drawing", price: 820_000 },
  { title: "خلاقیت تصویری", author: "مونا پاکدل", publisher: "mega-book", field: "art", grade: "konkoor", subject: "art-basics", price: 710_000 },
  { title: "زبان انگلیسی جامع", author: "فرشید یوسفی", publisher: "gaj", field: "languages", grade: "konkoor", subject: "english", price: 750_000 },
  { title: "واژگان تخصصی زبان", author: "الهام رفیعی", publisher: "kheili-sabz", field: "languages", grade: "konkoor", subject: "english", price: 490_000 },
  { title: "گرامر جامع کنکور زبان", author: "کیوان امیدی", publisher: "mehr-o-mah", field: "languages", grade: "konkoor", subject: "grammar", price: 570_000 },
  { title: "زبان‌شناسی مقدماتی", author: "نرگس توکلی", publisher: "madreseh", field: "languages", grade: "konkoor", subject: "linguistics", price: 530_000 },
] as const;

const conditionGrades = ["like-new", "excellent", "good", "acceptable"] as const;
const listingStatuses = ["active", "active", "active", "active", "sold", "reserved"] as const;
const messageTemplates = [
  "سلام، این کتاب هنوز موجوده؟",
  "سلام، بله موجوده و می‌تونم همین هفته ارسال کنم.",
  "وضعیت جلد و صفحه‌ها دقیقاً چطوره؟",
  "جلد سالمه و هیچ صفحه‌ای کم یا پاره نشده.",
  "امکان تخفیف جزئی دارید؟",
  "قیمت منصفانه گذاشتم، ولی برای خرید قطعی کمی راه میام.",
  "ارسال به شهر من با پست انجام می‌شه؟",
  "بله، با پست پیشتاز یا تیپاکس قابل ارساله.",
  "خیلی خوبه، برای هماهنگی نهایی پیام می‌دم.",
  "حتماً، هر زمان آماده بودید در خدمتم.",
] as const;

async function runInBatches<T>(
  items: readonly T[],
  action: (item: T, index: number) => Promise<unknown>,
  batchSize = 25,
) {
  for (let offset = 0; offset < items.length; offset += batchSize) {
    await Promise.all(
      items.slice(offset, offset + batchSize).map((item, index) =>
        action(item, offset + index),
      ),
    );
  }
}

async function seed() {
  console.log("Connecting to configured remote MongoDB...");
  await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB,
    serverSelectionTimeoutMS: 15_000,
  });
  console.log(`Connected to database: ${mongoose.connection.name}`);

  await runInBatches(publishers, (publisher) =>
    Publisher.updateOne(
      { slug: publisher.slug },
      { $set: { ...publisher, logo: "" } },
      { upsert: true },
    ),
  );

  const userSeeds = names.map((name, index) => {
    const location = locations[index % locations.length];
    return {
      name,
      email: `seed.user.${index + 1}@konkoorbaz.test`,
      phone: index === 0 ? "09120004567" : `091${String(index).padStart(8, "0")}`,
      role: "user" as const,
      isVerified: index % 5 !== 0,
      province: location.province,
      city: location.city,
      rating: Number((4.2 + (index % 9) * 0.1).toFixed(1)),
      totalSales: 4 + ((index * 7) % 53),
      totalPurchases: 1 + ((index * 3) % 18),
    };
  });

  await runInBatches(userSeeds, (user) =>
    User.updateOne({ phone: user.phone }, { $set: user }, { upsert: true }),
  );

  const [createdUsers, createdPublishers] = await Promise.all([
    User.find({ phone: { $in: userSeeds.map((user) => user.phone) } }),
    Publisher.find({ slug: { $in: publishers.map((publisher) => publisher.slug) } }),
  ]);
  const usersByPhone = new Map(createdUsers.map((user) => [user.phone, user]));
  const publishersBySlug = new Map(
    createdPublishers.map((publisher) => [publisher.slug, publisher]),
  );

  const listingSeeds = Array.from({ length: 120 }, (_, index) => {
    const book = books[index % books.length];
    const userSeed = userSeeds[index % userSeeds.length];
    const seller = usersByPhone.get(userSeed.phone);
    const publisher = publishersBySlug.get(book.publisher);
    const condition = conditionGrades[index % conditionGrades.length];
    const year = 1401 + (index % 5);
    const originalPrice = book.price + (index % 4) * 35_000;
    const priceRatio = 0.38 + (index % 5) * 0.08;

    if (!seller || !publisher) throw new Error("Seed references could not be resolved.");

    return {
      seller: seller._id,
      book: {
        title: `${book.title} — چاپ ${year}`,
        author: book.author,
        publisher: { name: publisher.name, slug: publisher.slug },
        field: book.field,
        grade: book.grade,
        subject: book.subject,
        originalPrice,
        coverImage: "",
      },
      price: Math.round((originalPrice * priceRatio) / 10_000) * 10_000,
      originalPrice,
      condition: {
        grade: condition,
        highlighting: index % 4 === 0,
        handwrittenNotes: index % 7 === 0,
        tornPages: false,
        missingPages: false,
        answersCompleted: index % 6 === 0,
        coverDamaged: index % 17 === 0,
        hasCd: index % 8 === 0,
        hasSupplement: index % 11 === 0,
        notes: condition === "like-new" ? "تقریباً بدون استفاده" : "شرح وضعیت در تصاویر و توضیحات درج شده است.",
      },
      images: [],
      description: `نسخه چاپ ${year}، مناسب برای مطالعه و جمع‌بندی. کتاب کامل است و با بسته‌بندی مطمئن ارسال می‌شود.`,
      year,
      edition: 1 + (index % 12),
      city: userSeed.city,
      province: userSeed.province,
      shippingAvailable: true,
      pickupAvailable: index % 3 === 0,
      isBundle: false,
      bundleBooks: [],
      priceIndicator: index % 4 === 0 ? "great" as const : "fair" as const,
      views: 35 + ((index * 47) % 1_900),
      favorites: 2 + ((index * 13) % 95),
      status: listingStatuses[index % listingStatuses.length],
    };
  });

  await runInBatches(listingSeeds, (listing) =>
    Listing.updateOne(
      { seller: listing.seller, "book.title": listing.book.title },
      { $set: listing },
      { upsert: true },
    ),
  );

  const seededListings = await Listing.find({
    seller: { $in: createdUsers.map((user) => user._id) },
    "book.title": { $in: listingSeeds.map((listing) => listing.book.title) },
  }).sort({ createdAt: 1 });

  const conversationSeeds = seededListings.slice(0, 40).map((listing, index) => {
    const sellerId = listing.seller.toString();
    const buyer = createdUsers.find(
      (user, userIndex) => userIndex >= index % createdUsers.length && user._id.toString() !== sellerId,
    ) || createdUsers.find((user) => user._id.toString() !== sellerId);

    if (!buyer) throw new Error("A buyer could not be selected for a seeded conversation.");

    return { listing: listing._id, participants: [listing.seller, buyer._id] };
  });

  await runInBatches(conversationSeeds, (conversation, index) =>
    Conversation.updateOne(
      { listing: conversation.listing },
      {
        $set: {
          participants: conversation.participants,
          listing: conversation.listing,
          lastMessageAt: new Date(Date.UTC(2026, 5, 1 + index, 12)),
        },
      },
      { upsert: true },
    ),
  );

  const seededConversations = await Conversation.find({
    listing: { $in: conversationSeeds.map((conversation) => conversation.listing) },
  }).sort({ createdAt: 1 });

  const messageSeeds = seededConversations.flatMap((conversation, conversationIndex) =>
    messageTemplates.map((content, messageIndex) => ({
      conversation: conversation._id,
      sender: conversation.participants[messageIndex % 2],
      content,
      image: "",
      isRead: messageIndex < 8 || conversationIndex % 3 === 0,
      createdAt: new Date(Date.UTC(2026, 5, 1 + conversationIndex, 12 + messageIndex)),
    })),
  );

  await runInBatches(messageSeeds, (message) =>
    Message.updateOne(
      { conversation: message.conversation, sender: message.sender, content: message.content },
      {
        $set: { image: message.image, isRead: message.isRead },
        $setOnInsert: { createdAt: message.createdAt },
      },
      { upsert: true },
    ),
  );

  await runInBatches(seededConversations, async (conversation) => {
    const lastMessage = await Message.findOne({ conversation: conversation._id }).sort({ createdAt: -1 });
    if (!lastMessage) return;
    await Conversation.updateOne(
      { _id: conversation._id },
      { $set: { lastMessage: lastMessage._id, lastMessageAt: lastMessage.createdAt } },
    );
  });

  const seededCounts = await Promise.all([
    User.countDocuments({ phone: { $in: userSeeds.map((user) => user.phone) } }),
    Publisher.countDocuments({ slug: { $in: publishers.map((publisher) => publisher.slug) } }),
    Listing.countDocuments({ _id: { $in: seededListings.map((listing) => listing._id) } }),
    Conversation.countDocuments({ _id: { $in: seededConversations.map((conversation) => conversation._id) } }),
    Message.countDocuments({ conversation: { $in: seededConversations.map((conversation) => conversation._id) } }),
  ]);

  console.log("Seed complete (safe to rerun):");
  console.log(`  Users: ${seededCounts[0]}`);
  console.log(`  Publishers: ${seededCounts[1]}`);
  console.log(`  Listings: ${seededCounts[2]}`);
  console.log(`  Conversations: ${seededCounts[3]}`);
  console.log(`  Messages: ${seededCounts[4]}`);
}

seed()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown seed error";
    console.error(`Seed failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
