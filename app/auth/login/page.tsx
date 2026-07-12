"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/layout/Logo";
import { mockUsers } from "@/lib/mock-data";
import { loginAction, checkUserAction, sendOtpAction } from "@/lib/auth-actions";
import { normalizeDigits } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [step, setStep] = useState<1 | 1.5 | 2>(1); // 1: Phone, 1.5: Name, 2: OTP
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(120); // 2 minutes countdown
  const [loginSuccess, setLoginSuccess] = useState(false);

  const canResend = timer === 0;

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Timer countdown for resending OTP code
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  // Handle phone number input with character normalization
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = normalizeDigits(e.target.value).replace(/\D/g, "");
    
    // Max 11 digits
    if (cleaned.length <= 11) {
      setPhoneNumber(cleaned);
      setError(null);
    }
  };

  // Step 1: Submit Phone Number (Checks if user is new or existing)
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError("لطفاً شماره موبایل خود را وارد کنید.");
      return;
    }
    if (!/^09\d{9}$/.test(phoneNumber)) {
      setError("شماره موبایل وارد شده معتبر نیست. باید با ۰۹ شروع شده و ۱۱ رقم باشد.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const checkResult = await checkUserAction(phoneNumber);
    
    setIsLoading(false);
    if (!checkResult.success) {
      setError(checkResult.error || "خطایی در بررسی اطلاعات رخ داد.");
      return;
    }

    if (checkResult.exists) {
      setIsRegistering(false);
      setStep(2);
      setTimer(120);
      await sendOtpAction(phoneNumber);
      // Auto focus on first OTP box
      setTimeout(() => {
        otpRefs[0].current?.focus();
      }, 100);
    } else {
      setIsRegistering(true);
      setStep(1.5); // Redirect to enter name first
    }
  };

  // Step 1.5: Submit Full Name
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !fullName.trim()) {
      setError("لطفاً نام و نام خانوادگی خود را وارد کنید.");
      return;
    }
    if (fullName.trim().length < 3) {
      setError("نام و نام خانوادگی باید حداقل ۳ حرف باشد.");
      return;
    }

    setError(null);
    setStep(2);
    setTimer(120);
    await sendOtpAction(phoneNumber);

    // Auto focus on first OTP box
    setTimeout(() => {
      otpRefs[0].current?.focus();
    }, 100);
  };

  // OTP inputs value change handler
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = normalizeDigits(value).replace(/\D/g, "");
    
    if (cleaned.length > 1) {
      // Handle pasted values
      const pastedDigits = cleaned.slice(0, 4).split("");
      const newOtp = [...otpCode];
      pastedDigits.forEach((char, idx) => {
        if (idx < 4) newOtp[idx] = char;
      });
      setOtpCode(newOtp);
      otpRefs[Math.min(pastedDigits.length - 1, 3)].current?.focus();
      return;
    }

    const newOtp = [...otpCode];
    newOtp[index] = cleaned;
    setOtpCode(newOtp);
    setError(null);

    // Move to next input if digit entered
    if (cleaned !== "" && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  // Keyboard navigation for OTP (backspace/arrow keys)
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otpCode[index] === "" && index > 0) {
      // Move to previous input on backspace if current is empty
      otpRefs[index - 1].current?.focus();
    } else if (e.key === "ArrowLeft" && index < 3) {
      otpRefs[index + 1].current?.focus();
    } else if (e.key === "ArrowRight" && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Step 2: Submit OTP Verification
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join("");
    
    if (code.length < 4) {
      setError("لطفاً کد تایید ۴ رقمی را به طور کامل وارد کنید.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Call server action to perform authentication
    const result = await loginAction(phoneNumber, code, isRegistering ? fullName : undefined);
    
    setTimeout(() => {
      setIsLoading(false);
      if (result.success) {
        setLoginSuccess(true);
        // Redirect to homepage or previous page after success animation
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setError(result.error || "کد وارد شده صحیح نیست.");
      }
    }, 1200);
  };

  // Resend code
  const handleResendCode = async () => {
    if (!canResend) return;
    setIsLoading(true);
    setError(null);
    await sendOtpAction(phoneNumber);
    setIsLoading(false);
    setTimer(120);
    setOtpCode(["", "", "", ""]);
    otpRefs[0].current?.focus();
  };

  // Developer Helper: auto fill phone and select mock user
  const handleSelectMockUser = (maskedPhone: string) => {
    // Unmask phone (e.g. 0912***4567 -> 09120004567)
    let phone = maskedPhone;
    if (maskedPhone.includes("*")) {
      phone = maskedPhone.replace(/\*\*\*/, "000");
    }
    setPhoneNumber(phone);
    setFullName("");
    setIsRegistering(false);
    setStep(1);
    setError(null);
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <div className="min-h-screen flex items-stretch bg-surface-50">
      
      {/* 1. Left side panel - decorative hero image panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-navy-400/20 rounded-full blur-3xl" />

        {/* Brand / Logo */}
        <Link href="/" className="relative z-10 shrink-0 inline-block self-start">
          <Logo size="lg" className="[&_span]:text-white [&_.text-accent-500]:text-accent-400" />
        </Link>

        {/* Main hero message */}
        <div className="relative z-10 my-auto max-w-lg space-y-8 animate-slide-up">
          <h2 className="text-3xl font-extrabold leading-tight text-white">
            کتاب‌های کنکورت رو ارزان‌تر بخر، راحت‌تر بفروش.
          </h2>
          
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-base font-medium text-navy-100">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-accent-400 shrink-0">💸</span>
              <span>تا ۷۰٪ صرفه‌جویی در هزینه خرید کتاب‌های کنکور</span>
            </li>
            <li className="flex items-center gap-3 text-base font-medium text-navy-100">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-accent-400 shrink-0">📦</span>
              <span>خرید مستقیم و بی‌واسطه از کنکوری‌های سال‌های قبل</span>
            </li>
            <li className="flex items-center gap-3 text-base font-medium text-navy-100">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-accent-400 shrink-0">🌱</span>
              <span>کاهش مصرف کاغذ و کمک به حفظ محیط زیست</span>
            </li>
          </ul>

          {/* Floating glassmorphic card */}
          <div className="glass-dark rounded-2xl p-6 shadow-elevated border border-white/10 animate-float backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-accent-500 text-white flex items-center justify-center text-base">💡</div>
              <h4 className="font-bold text-white text-sm">چرا کنکورباز؟</h4>
            </div>
            <p className="text-xs text-navy-100 leading-relaxed">
              در کنکورباز می‌توانید کتاب‌های خود را پس از اتمام کنکور به فروش برسانید و هزینه آن را دریافت کنید، و کتاب‌های جدید را با قیمت بسیار کمتر تهیه کنید.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="relative z-10 text-xs text-navy-300">
          © ۱۴۰۵ کنکورباز. تمام حقوق محفوظ است.
        </p>
      </div>

      {/* 2. Right side panel - Login/Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-surface-50/50">
        
        {/* Back to Home Button */}
        <Link 
          href="/" 
          className="absolute top-6 right-6 text-sm font-semibold text-surface-500 hover:text-navy-700 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          بازگشت به خانه
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Form Card Container */}
        <div className="w-full max-w-md bg-white rounded-3xl border border-surface-200/60 shadow-card p-8 sm:p-10 animate-fade-in relative overflow-hidden">
          
          {/* Logo on Mobile only */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size="md" />
          </div>

          {/* Success Overlay */}
          {loginSuccess && (
            <div className="absolute inset-0 bg-white z-30 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
              <div className="w-16 h-16 bg-success-50 text-success-500 rounded-full flex items-center justify-center mb-4 text-3xl shadow-sm animate-scale-in">
                ✓
              </div>
              <h3 className="text-xl font-bold text-surface-800 mb-2">
                {isRegistering ? "ثبت‌نام با موفقیت انجام شد" : "ورود با موفقیت انجام شد"}
              </h3>
              <p className="text-sm text-surface-500">خوش آمدید! در حال انتقال به صفحه اصلی...</p>
            </div>
          )}

          {/* Title Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-surface-800 mb-2">
              {step === 1.5 ? "ثبت‌نام در کنکورباز" : isRegistering ? "ایجاد حساب کاربری" : "ورود به حساب کاربری"}
            </h1>
            <p className="text-sm text-surface-500 leading-relaxed">
              {step === 1 && "برای ورود یا ثبت‌نام در کنکورباز، شماره موبایل خود را وارد کنید."}
              {step === 1.5 && "به نظر می‌رسد اولین بار است که وارد می‌شوید. لطفاً نام خود را وارد کنید."}
              {step === 2 && (isRegistering
                ? `کد تایید ۴ رقمی برای شماره جدید ${phoneNumber} ارسال شد:`
                : `کد تایید ۴ رقمی ارسال شده به شماره ${phoneNumber} را وارد کنید:`)}
            </p>
          </div>

          {/* Form switcher based on steps */}
          {step === 1 ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <Input
                label="شماره موبایل"
                type="tel"
                placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                value={phoneNumber}
                onChange={handlePhoneChange}
                error={error || undefined}
                hint="کد تایید به این شماره ارسال خواهد شد."
                className="text-left font-mono tracking-wider text-base"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                }
                autoFocus
                required
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                ادامه
              </Button>
            </form>
          ) : step === 1.5 ? (
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <Input
                label="نام و نام خانوادگی"
                type="text"
                placeholder="مثال: زهرا احمدی"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setError(null);
                }}
                error={error || undefined}
                hint="این نام در پروفایل و آگهی‌های شما نمایش داده می‌شود."
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                autoFocus
                required
              />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  isLoading={isLoading}
                >
                  تایید نام و ادامه
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                  }}
                >
                  بازگشت
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              {/* LTR OTP grid container */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-surface-700">کد تایید</label>
                <div className="flex flex-row-reverse justify-center gap-3 dir-ltr" style={{ direction: "ltr" }}>
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold text-surface-800 bg-surface-50 border border-surface-200 rounded-xl focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 focus:outline-none transition-all duration-150"
                      required
                    />
                  ))}
                </div>
                {error && (
                  <p className="mt-2 text-xs text-danger-500 text-center font-medium" role="alert">
                    {error}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  disabled={otpCode.some((d) => d === "")}
                >
                  {isRegistering ? "ثبت‌نام و ورود" : "تایید و ورود"}
                </Button>

                {/* Resend / Edit info */}
                <div className="flex flex-col gap-2 pt-2 text-xs">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(isRegistering ? 1.5 : 1);
                        setOtpCode(["", "", "", ""]);
                        setError(null);
                      }}
                      className="text-navy-600 hover:text-navy-700 hover:underline font-semibold cursor-pointer"
                    >
                      {isRegistering ? "ویرایش نام" : "ویرایش شماره موبایل"}
                    </button>

                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-accent-600 hover:text-accent-700 hover:underline font-bold cursor-pointer"
                      >
                        ارسال مجدد کد
                      </button>
                    ) : (
                      <span className="text-surface-400 font-mono">
                        ارسال مجدد کد تا {formattedTime}
                      </span>
                    )}
                  </div>

                  {isRegistering && (
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setOtpCode(["", "", "", ""]);
                        setFullName("");
                        setError(null);
                      }}
                      className="text-surface-500 hover:text-surface-600 hover:underline font-medium cursor-pointer self-start"
                    >
                      ویرایش شماره موبایل
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Collapsible Developer Helper — dev only */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 w-full max-w-md animate-slide-up">
            <details className="bg-white/80 backdrop-blur-sm border border-surface-200/80 rounded-2xl p-4 shadow-sm cursor-pointer group">
              <summary className="text-xs font-semibold text-surface-600 select-none flex items-center justify-between">
                <span>🛠️ راهنمای توسعه‌دهنده (تست ورود و ثبت‌نام)</span>
                <span className="text-[10px] text-surface-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 space-y-2 max-h-44 overflow-y-auto pr-1">
                <p className="text-[11px] text-surface-500 leading-relaxed mb-2">
                  <strong>تست ورود:</strong> روی یکی از کاربران زیر کلیک کنید تا شماره آن‌ها وارد شده و فرآیند ورود شبیه‌سازی شود.<br />
                  <strong>تست ثبت‌نام:</strong> یک شماره جدید فرضی وارد کنید (مثلاً شماره خودتان یا شماره‌ای که در لیست زیر نیست) تا صفحه ثبت‌نام نام و نام خانوادگی نمایش داده شود.
                </p>
                {mockUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleSelectMockUser(user.phone || "")}
                    className="p-2.5 bg-surface-50 hover:bg-navy-50/50 border border-surface-100 hover:border-navy-200/50 rounded-xl text-xs flex justify-between items-center transition-all cursor-pointer"
                  >
                    <span className="font-semibold text-surface-700">{user.name}</span>
                    <span className="font-mono text-surface-500 font-semibold">{user.phone}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
        
      </div>
    </div>
  );
}
