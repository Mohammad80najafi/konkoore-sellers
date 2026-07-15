"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/layout/Logo";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { loginAction, requestOtpAction } from "@/lib/auth-actions";
import { normalizeDigits } from "@/lib/utils";

const PHONE_PATTERN = /^09\d{9}$/;
const OTP_SECONDS = 120;

export default function LoginPage() {
  const router = useRouter();
  const otpInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [shownOtp, setShownOtp] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(OTP_SECONDS);

  useEffect(() => {
    if (step !== "otp" || timer === 0) return;
    const timeout = window.setTimeout(() => setTimer((time) => time - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [step, timer]);

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const phone = normalizeDigits(event.target.value).replace(/\D/g, "").slice(0, 11);
    setPhoneNumber(phone);
    setError(null);
  };

  const requestOtp = async () => {
    const result = await requestOtpAction(phoneNumber);
    if (!result.success) {
      setError(result.error || "دریافت کد ورود انجام نشد. دوباره تلاش کنید.");
      return false;
    }

    setIsNewUser(!result.exists);
    setShownOtp(result.devCode || "");
    setOtpCode("");
    setTimer(OTP_SECONDS);
    setStep("otp");
    window.setTimeout(() => otpInput.current?.focus(), 100);
    return true;
  };

  const handlePhoneSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!PHONE_PATTERN.test(phoneNumber)) {
      setError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم داشته باشد.");
      return;
    }

    setIsLoading(true);
    setError(null);
    await requestOtp();
    setIsLoading(false);
  };

  const handleVerifySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isNewUser && fullName.trim().length < 3) {
      setError("برای ساخت حساب، نام و نام خانوادگی خود را وارد کنید.");
      return;
    }
    if (otpCode.length !== 4) {
      setError("کد ورود ۴ رقمی را کامل وارد کنید.");
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await loginAction(
      phoneNumber,
      otpCode,
      isNewUser ? fullName : undefined,
    );

    if (!result.success) {
      setError(result.error || "کد وارد شده صحیح نیست.");
      setIsLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setIsLoading(true);
    setError(null);
    await requestOtp();
    setIsLoading(false);
  };

  const resetPhone = () => {
    setStep("phone");
    setOtpCode("");
    setShownOtp("");
    setFullName("");
    setError(null);
  };

  const formattedTime = `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f7f5ef] text-surface-900">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(30,51,149,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(30,51,149,0.04)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative mx-auto grid min-h-dvh w-full max-w-[1440px] grid-cols-1 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-navy-950 px-12 py-10 text-white lg:flex lg:flex-col xl:px-16">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-navy-500/25 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-accent-500/15 blur-3xl" />

          <Link href="/" className="relative z-10 w-fit rounded-xl focus-visible:outline-white">
            <Logo size="lg" className="[&_span]:text-white" />
          </Link>

          <div className="relative z-10 my-auto max-w-xl py-14">
            <p className="mb-5 flex items-center gap-3 text-sm font-semibold text-accent-300">
              <span className="h-px w-10 bg-accent-400" />
              سامانه اهدای کتاب‌های کنکور
            </p>
            <h2 className="text-balance text-4xl font-black leading-[1.55] xl:text-5xl">
              یک کتاب، دو مسیر؛
              <span className="block text-accent-300">بخون و ببخش.</span>
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-navy-100">
              با شماره موبایل وارد شو و کتاب‌های اهدایی، درخواست‌ها و گفت‌وگوهایت را از همان‌جایی که رها کردی ادامه بده.
            </p>

            <div className="mt-12 grid grid-cols-3 border-y border-white/10 py-6">
              {[
                ["۱", "شماره موبایل"],
                ["۲", "کد ورود"],
                ["۳", "ورود امن"],
              ].map(([number, label], index) => (
                <div
                  key={number}
                  className={`px-4 ${index > 0 ? "border-r border-white/10" : ""}`}
                >
                  <span className="block font-mono text-2xl font-bold text-accent-300">{number}</span>
                  <span className="mt-1 block text-sm text-navy-100">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-navy-300">
            کنکورباز · اهدای مستقیم میان دانش‌آموزان
          </p>
        </section>

        <section className="flex min-h-dvh min-w-0 flex-col px-5 py-5 sm:px-8 sm:py-8 lg:px-14 xl:px-24">
          <header className="flex items-center justify-between">
            <Link href="/" className="rounded-xl lg:hidden">
              <Logo size="md" />
            </Link>
            <Link
              href="/"
              className="mr-auto inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-surface-600 transition-colors duration-200 hover:bg-white hover:text-navy-800"
            >
              بازگشت به خانه
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </header>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-[480px]">
              <div className="mb-8 flex items-center gap-3" aria-label={`مرحله ${step === "phone" ? "۱" : "۲"} از ۲`}>
                <span className="h-1.5 flex-1 rounded-full bg-navy-700" />
                <span className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step === "otp" ? "bg-navy-700" : "bg-surface-200"}`} />
                <span className="text-xs font-bold text-surface-500">{step === "phone" ? "۱ از ۲" : "۲ از ۲"}</span>
              </div>

              <div className="rounded-[28px] border border-white bg-white/95 p-6 shadow-[0_24px_80px_rgba(17,29,86,0.10)] sm:p-9">
                <div className="mb-8">
                  <p className="mb-3 text-sm font-bold text-accent-700">
                    {step === "phone" ? "ورود یا ساخت حساب" : isNewUser ? "تکمیل حساب و ورود" : "تأیید شماره موبایل"}
                  </p>
                  <h1 className="text-3xl font-black leading-snug text-navy-950 sm:text-[34px]">
                    {step === "phone" ? "خوش آمدی به کنکورباز" : "کد ورودت آماده است"}
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-surface-600">
                    {step === "phone"
                      ? "شماره موبایلت را وارد کن؛ ورود و ثبت‌نام هر دو از همین‌جا انجام می‌شود."
                      : `کد ۴ رقمی این ورود برای ${phoneNumber} ساخته شده است.`}
                  </p>
                </div>

                {step === "phone" ? (
                  <form onSubmit={handlePhoneSubmit} className="space-y-6" noValidate>
                    <Input
                      id="phone-number"
                      label="شماره موبایل"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      error={error || undefined}
                      hint="فقط شماره‌های ایران با پیش‌شماره ۰۹"
                      className="min-h-13 text-left font-mono text-lg tracking-[0.12em]"
                      dir="ltr"
                      autoFocus
                    />
                    <Button type="submit" size="lg" fullWidth isLoading={isLoading} className="min-h-13">
                      دریافت کد ورود
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifySubmit} className="space-y-5" noValidate>
                    {shownOtp ? (
                      <button
                        type="button"
                        onClick={() => {
                          setOtpCode(shownOtp);
                          setError(null);
                          otpInput.current?.focus();
                        }}
                        className="group relative w-full overflow-hidden rounded-2xl border border-dashed border-accent-300 bg-accent-50 px-5 py-4 text-right transition-colors duration-200 hover:border-accent-500 hover:bg-[#fff4d9]"
                        aria-label={`استفاده از کد ورود ${shownOtp}`}
                      >
                        <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-accent-200 bg-white" />
                        <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-accent-200 bg-white" />
                        <span className="block text-xs font-bold text-accent-800">کد ورود آزمایشی · پیامک غیرفعال است</span>
                        <span className="mt-2 flex items-end justify-between gap-4">
                          <span className="text-xs font-medium text-surface-600">برای وارد کردن کد، این کارت را بزن</span>
                          <b dir="ltr" className="font-mono text-3xl tracking-[0.28em] text-navy-950 tabular-nums">{shownOtp}</b>
                        </span>
                      </button>
                    ) : null}

                    {isNewUser ? (
                      <Input
                        id="full-name"
                        label="نام و نام خانوادگی"
                        type="text"
                        autoComplete="name"
                        placeholder="مثلاً زهرا احمدی"
                        value={fullName}
                        onChange={(event) => {
                          setFullName(event.target.value);
                          setError(null);
                        }}
                        hint="این نام در پروفایل و آگهی‌های تو نمایش داده می‌شود."
                        className="min-h-12 text-base"
                      />
                    ) : null}

                    <div>
                      <label htmlFor="otp-code" className="mb-1.5 block text-sm font-medium text-surface-700">
                        کد ورود ۴ رقمی
                      </label>
                      <input
                        ref={otpInput}
                        id="otp-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={otpCode}
                        onChange={(event) => {
                          setOtpCode(normalizeDigits(event.target.value).replace(/\D/g, "").slice(0, 4));
                          setError(null);
                        }}
                        className={`min-h-16 w-full rounded-2xl border bg-surface-50 px-5 text-center font-mono text-2xl font-bold tracking-[0.5em] text-navy-950 transition-colors duration-200 focus:outline-none focus:ring-2 ${error ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20" : "border-surface-200 hover:border-surface-300 focus:border-navy-500 focus:ring-navy-500/20"}`}
                        dir="ltr"
                        aria-describedby={error ? "login-error" : undefined}
                      />
                      {error ? <p id="login-error" className="mt-2 text-xs font-medium text-danger-600" role="alert">{error}</p> : null}
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      fullWidth
                      isLoading={isLoading}
                      disabled={otpCode.length !== 4}
                      className="min-h-13"
                    >
                      {isNewUser ? "ساخت حساب و ورود" : "تأیید و ورود"}
                    </Button>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-sm">
                      <button
                        type="button"
                        onClick={resetPhone}
                        className="min-h-11 rounded-xl px-2 font-semibold text-surface-600 transition-colors hover:bg-surface-100 hover:text-navy-800"
                      >
                        ویرایش شماره
                      </button>
                      {timer === 0 ? (
                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={isLoading}
                          className="min-h-11 rounded-xl px-2 font-bold text-accent-700 transition-colors hover:bg-accent-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          ساخت کد جدید
                        </button>
                      ) : (
                        <span className="font-medium text-surface-500">کد جدید تا <b dir="ltr" className="font-mono text-surface-700">{formattedTime}</b></span>
                      )}
                    </div>
                  </form>
                )}
              </div>

              <p className="mt-5 text-center text-xs leading-6 text-surface-500">
                با ادامه، قوانین استفاده و حریم خصوصی کنکورباز را می‌پذیری.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
