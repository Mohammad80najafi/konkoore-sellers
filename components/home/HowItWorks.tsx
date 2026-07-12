import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

const stepIcons: Record<string, string> = {
  search: "🔍",
  compare: "⚖️",
  secure: "🛡️",
  camera: "📸",
  price: "💰",
  sell: "🎉",
};

export default function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-3 text-center">
        چطور کار می‌کنه؟
      </h2>
      <p className="text-surface-500 text-center mb-10 max-w-xl mx-auto">
        خرید و فروش کتاب دست دوم کنکور در سه مرحله ساده
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Buy steps */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card">
          <div className="inline-flex items-center gap-2 bg-navy-50 text-navy-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            🛒 خرید کتاب
          </div>

          <div className="space-y-6">
            {HOW_IT_WORKS_STEPS.buy.map((step, index) => (
              <div key={step.step} className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center text-2xl">
                    {stepIcons[step.icon]}
                  </div>
                  {index < HOW_IT_WORKS_STEPS.buy.length - 1 && (
                    <div className="w-0.5 h-6 bg-navy-100 mx-auto mt-2" aria-hidden="true" />
                  )}
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-navy-800 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-surface-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sell steps */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card">
          <div className="inline-flex items-center gap-2 bg-accent-50 text-accent-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            💰 فروش کتاب
          </div>

          <div className="space-y-6">
            {HOW_IT_WORKS_STEPS.sell.map((step, index) => (
              <div key={step.step} className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center text-2xl">
                    {stepIcons[step.icon]}
                  </div>
                  {index < HOW_IT_WORKS_STEPS.sell.length - 1 && (
                    <div className="w-0.5 h-6 bg-accent-100 mx-auto mt-2" aria-hidden="true" />
                  )}
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-navy-800 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-surface-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
