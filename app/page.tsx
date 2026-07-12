import ShellLayout from "@/components/layout/ShellLayout";
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
} from "@/lib/data";

export default async function HomePage() {
  const [recommended, recent, bundles] = await Promise.all([
    getRecommendedListings(8),
    getRecentListings(8),
    getBundleListings(),
  ]);

  return (
    <ShellLayout>
      <HeroSection />
      <CategoryCards />
      <BookSection
        title="پیشنهادی برای شما"
        subtitle="کتاب‌های پرطرفدار با بهترین قیمت"
        listings={recommended}
        viewAllHref="/marketplace?sort=views"
      />
      <BookSection
        title="تازه‌ترین کتاب‌ها"
        subtitle="آخرین کتاب‌های اضافه شده به بازار"
        listings={recent}
        viewAllHref="/marketplace?sort=newest"
      />
      <BundleDeals bundles={bundles} />
      <PopularPublishers />
      <HowItWorks />
      <SustainabilitySection />
      <Testimonials />
      <CTASection />
    </ShellLayout>
  );
}
