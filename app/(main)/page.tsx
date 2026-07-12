import HeroSection from "@/components/home/HeroSection";
import CategoryCards from "@/components/home/CategoryCards";
import BookSection from "@/components/home/BookSection";
import BundleDeals from "@/components/home/BundleDeals";
import PopularPublishers from "@/components/home/PopularPublishers";
import HowItWorks from "@/components/home/HowItWorks";
import SustainabilitySection from "@/components/home/SustainabilitySection";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";
import {
  getRecommendedListings,
  getRecentListings,
  getBundleListings,
} from "@/lib/mock-data";

export default function HomePage() {
  const recommended = getRecommendedListings(8);
  const recent = getRecentListings(8);
  const bundles = getBundleListings();

  return (
    <>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Category Cards */}
      <CategoryCards />

      {/* 3. Recommended Books */}
      <BookSection
        title="پیشنهادی برای شما"
        subtitle="کتاب‌های پرطرفدار با بهترین قیمت"
        listings={recommended}
        viewAllHref="/marketplace?sort=views"
      />

      {/* 4. Recently Added */}
      <BookSection
        title="تازه‌ترین کتاب‌ها"
        subtitle="آخرین کتاب‌های اضافه شده به بازار"
        listings={recent}
        viewAllHref="/marketplace?sort=newest"
      />

      {/* 5. Bundle Deals */}
      <BundleDeals bundles={bundles} />

      {/* 6. Popular Publishers */}
      <PopularPublishers />

      {/* 7. How It Works */}
      <HowItWorks />

      {/* 8. Sustainability */}
      <SustainabilitySection />

      {/* 9. Testimonials */}
      <Testimonials />

      {/* 10. CTA */}
      <CTASection />
    </>
  );
}
