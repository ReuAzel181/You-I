"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAnalytics } from "@/providers/SettingsProvider";
import { useAuth } from "@/providers/AuthProvider";
import { getSupabaseClient } from "@/lib/supabaseClient";

const faqItems = [
  {
    question: "How do I choose between free and paid plans?",
    answer:
      "Tell us how many people are designing or reviewing interfaces and how often you run checks. We will suggest a plan that fits your current workflow.",
  },
  {
    question: "Can Zanari match the files and tools we already use?",
    answer:
      "Share which design tools, repos, or handoff flows you rely on today and we will outline how pinned tools and presets can slot into that setup.",
  },
  {
    question: "How do analytics and privacy work in Zanari?",
    answer:
      "Let us know what your team privacy requirements look like and we will explain how local analytics and account data are handled.",
  },
  {
    question: "Can I use Zanari on a small client project?",
    answer:
      "Yes. Include a short description of the client work, timelines, and how often you expect to run checks so we can suggest a lightweight setup.",
  },
  {
    question: "Do you support larger accessibility teams or agencies?",
    answer:
      "Tell us how many designers and reviewers you have and how you currently collaborate. We can outline how presets, workspaces, and seats scale with your team.",
  },
  {
    question: "What if I only need a one-off audit or review?",
    answer:
      "Describe the interface or flow you are reviewing and what kind of report you need. We will suggest how to use Zanari for focused reviews.",
  },
  {
    question: "How quickly do you usually reply to messages?",
    answer:
      "Most questions receive a reply within one business day. If your note is more complex, we will let you know what to expect next.",
  },
];

export default function ContactPage() {
  const { analyticsEnabled, trackEvent } = useAnalytics();
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [topic, setTopic] = useState("other");
  const [usage, setUsage] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [openFaq, setOpenFaq] = useState<boolean[]>(() => faqItems.map(() => false));
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    trackEvent("view_contact", { path: "/contact" });
  }, [analyticsEnabled, trackEvent]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setHasHydrated(true);
    }, 0);

    return () => {
      window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const nextEmail = user.email ?? "";

    setEmail((current) => {
      if (current) {
        return current;
      }

      return nextEmail;
    });
  }, [user]);

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        {!hasHydrated ? (
          <ContactSkeleton />
        ) : (
          <>
            <section className="border-b border-zinc-200 bg-white/80">
              <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      Contact
                    </div>
                    <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                      Questions about pricing or using Zanari?
                    </h1>
                    <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                      Reach out with questions about plans, workflows, or how Zanari fits into your
                      team&apos;s design process. We keep replies focused on real interface work, not
                      sales scripts.
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2 text-[11px] text-zinc-600 md:w-64 md:items-start">
                    <p className="max-w-xs text-left">
                      Wondering which plan to pick, or how a feature works in your setup? Start with a
                      short note including your team size and tools.
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      View pricing
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-8 md:py-10">
              <div className="mx-auto max-w-6xl px-4 md:px-8">
                <div className="grid gap-5 md:grid-cols-[minmax(0,1.6fr),minmax(0,1.4fr)] md:items-start">
                  <article className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-6">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-red-500">
                      Talk to us
                    </p>
                    <h2 className="mt-1 text-sm font-semibold text-zinc-900">
                      Share what you&apos;re designing and what you need from Zanari
                    </h2>
                    <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                      The more context you share, the more specific we can be in our reply. Include the
                      tools you use today, how often you run accessibility checks, and where Zanari would
                      sit in your workflow.
                    </p>
                    <form
                      className="mt-4 space-y-4 text-[11px] text-zinc-700"
                      onSubmit={async (event) => {
                        event.preventDefault();

                        if (isSubmitting) {
                          return;
                        }

                        setIsSubmitting(true);
                        setSubmitState("idle");

                        try {
                          const supabase = getSupabaseClient();

                          const payload = {
                            full_name: fullName.trim(),
                            email: email.trim(),
                            team_size: teamSize || null,
                            topic,
                            usage: usage || null,
                            message: message.trim(),
                          };

                          const { error } = await supabase.from("inquiries").insert(payload);

                          if (error) {
                            setSubmitState("error");
                            return;
                          }

                          setSubmitState("success");
                          setFullName("");
                          setEmail("");
                          setTeamSize("");
                          setTopic("other");
                          setUsage("");
                          setMessage("");
                        } catch {
                          setSubmitState("error");
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label htmlFor="contact-name" className="font-medium text-zinc-800">
                            Name
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            autoComplete="name"
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[11px] text-zinc-900 outline-none ring-0 transition-colors focus:border-red-400 focus:bg-red-50/40"
                            placeholder="Your name"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label htmlFor="contact-email" className="font-medium text-zinc-800">
                              Work email
                            </label>
                            {email.endsWith("@") && (
                              <span className="text-[10px] font-medium text-emerald-500">
                                Press Tab to complete
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              id="contact-email"
                              type="email"
                              value={email}
                              onChange={(event) => setEmail(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Tab" && email.endsWith("@")) {
                                  event.preventDefault();
                                  setEmail(`${email}gmail.com`);
                                }
                              }}
                              autoComplete="email"
                              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-900 outline-none ring-0 transition-colors focus:border-red-400 focus:bg-red-50/40"
                              placeholder="you@example.com"
                              required
                              readOnly={Boolean(user)}
                            />
                            {email.endsWith("@") && !user && (
                              <div className="pointer-events-none absolute inset-0 flex items-center px-3 text-[11px]">
                                <span className="opacity-0">{email}</span>
                                <span className="text-zinc-300">gmail.com</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1.1fr),minmax(0,1.4fr),minmax(0,1.1fr)]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label htmlFor="contact-team-size" className="font-medium text-zinc-800">
                              Team size
                            </label>
                            <span className="text-[10px] text-zinc-400">Optional</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { value: "solo", label: "Just me" },
                              { value: "duo", label: "Duo" },
                              { value: "3-5", label: "3–5" },
                              { value: "6-plus", label: "6+" },
                            ].map((option) => {
                              const isActive = teamSize === option.value;

                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() =>
                                    setTeamSize((current) =>
                                      current === option.value ? "" : option.value,
                                    )
                                  }
                                  className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                                    isActive
                                      ? "border-red-400 bg-red-500 text-white shadow-sm"
                                      : "border-zinc-200 bg-white text-zinc-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="contact-topic" className="font-medium text-zinc-800">
                            Topic
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { value: "other", label: "Something else" },
                              { value: "pricing", label: "Pricing and plans" },
                              { value: "bugs", label: "Bugs and issues" },
                              { value: "workflow", label: "Workflow and tools" },
                              { value: "accessibility", label: "Accessibility questions" },
                            ].map((option) => {
                              const isActive = topic === option.value;

                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => setTopic(option.value)}
                                  className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                                    isActive
                                      ? "border-red-400 bg-red-500 text-white shadow-sm"
                                      : "border-zinc-200 bg-white text-zinc-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-zinc-800">Usage</span>
                            <span className="text-[10px] text-zinc-400">Optional</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { value: "first-time", label: "First time" },
                              { value: "exploring", label: "Just exploring" },
                              { value: "sometimes", label: "Sometimes" },
                              { value: "often", label: "Often" },
                              { value: "daily", label: "Daily" },
                            ].map((option) => {
                              const isActive = usage === option.value;

                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() =>
                                    setUsage((current) =>
                                      current === option.value ? "" : option.value,
                                    )
                                  }
                                  className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                                    isActive
                                      ? "border-red-400 bg-red-500 text-white shadow-sm"
                                      : "border-zinc-200 bg-white text-zinc-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="contact-message" className="font-medium text-zinc-800">
                          What are you working on?
                        </label>
                        <textarea
                          id="contact-message"
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                          rows={5}
                          className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[11px] text-zinc-900 outline-none ring-0 transition-colors focus:border-red-400 focus:bg-red-50/40"
                          placeholder="Share a short note about your product, your current accessibility checks, and what you hope Zanari can help with."
                          required
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSubmitting ? "Sending…" : "Send message"}
                        </button>
                        <p className="text-[10px] text-zinc-500">
                          We typically reply within one business day. No mailing lists, just a direct
                          response.
                        </p>
                      </div>
                      {submitState === "success" && (
                        <p className="mt-2 text-[10px] font-medium text-emerald-600">
                          Thanks for reaching out — we&apos;ll get back to you shortly.
                        </p>
                      )}
                      {submitState === "error" && (
                        <p className="mt-2 text-[10px] font-medium text-red-600">
                          Something went wrong sending your message. Try again in a moment.
                        </p>
                      )}
                    </form>
                  </article>

                  <aside className="rounded-2xl border border-dashed border-zinc-200 bg-white px-4 py-4 text-[11px] leading-relaxed text-zinc-600 sm:px-5 sm:py-5">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-red-500">
                      FAQ
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-zinc-800">
                      Typical questions we can help with
                    </h3>
                    <div className="mt-3 space-y-2">
                      {faqItems.map((item, index) => {
                        const isOpen = openFaq[index];

                        const handleToggle = () => {
                          setOpenFaq((current) =>
                            current.map((value, valueIndex) =>
                              valueIndex === index ? !value : value,
                            ),
                          );
                        };

                        return (
                          <div
                            key={item.question}
                            role="button"
                            tabIndex={0}
                            onClick={handleToggle}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleToggle();
                              }
                            }}
                            className={`cursor-pointer rounded-lg border bg-white px-3 py-2 transition-colors ${
                              isOpen
                                ? "border-red-200 bg-red-50/40"
                                : "border-zinc-200 hover:border-red-200 hover:bg-red-50/30"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-zinc-800">{item.question}</p>
                              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center">
                                <Image
                                  src={isOpen ? "/icons/faq/minus.svg" : "/icons/faq/plus.svg"}
                                  alt=""
                                  width={10}
                                  height={10}
                                  className="h-3 w-3 text-zinc-400"
                                />
                              </span>
                            </div>
                            <div
                              className={`mt-1 overflow-hidden text-[11px] text-zinc-600 transition-[max-height,opacity] duration-400 ease-in-out ${
                                isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                              }`}
                            >
                              <p>{item.answer}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </aside>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ContactSkeleton() {
  return (
    <>
      <section className="border-b border-zinc-200 bg-white/80">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-medium text-zinc-400 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                <span className="h-3 w-32 rounded-full bg-zinc-200" />
              </div>
              <div className="space-y-2">
                <div className="h-6 w-64 rounded-full bg-zinc-200 animate-pulse" />
                <div className="h-3 w-72 rounded-full bg-zinc-200 animate-pulse" />
                <div className="h-3 w-60 rounded-full bg-zinc-200 animate-pulse" />
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 text-[11px] text-zinc-600 md:w-64 md:items-start">
              <div className="h-3 w-40 rounded-full bg-zinc-200 animate-pulse" />
              <div className="h-7 w-28 rounded-full bg-zinc-200 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-8 md:py-10">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1.6fr),minmax(0,1.4fr)] md:items-start">
            <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded-full bg-zinc-200 animate-pulse" />
                <div className="h-4 w-40 rounded-full bg-zinc-200 animate-pulse" />
                <div className="h-3 w-64 rounded-full bg-zinc-200 animate-pulse" />
              </div>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="h-3 w-20 rounded-full bg-zinc-200 animate-pulse" />
                    <div className="h-8 w-full rounded-lg bg-zinc-100 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-24 rounded-full bg-zinc-200 animate-pulse" />
                    <div className="h-8 w-full rounded-lg bg-zinc-100 animate-pulse" />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-[minmax(0,1.1fr),minmax(0,1.4fr),minmax(0,1.1fr)]">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="h-3 w-20 rounded-full bg-zinc-200 animate-pulse" />
                        <div className="h-3 w-12 rounded-full bg-zinc-100 animate-pulse" />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from({ length: 4 }).map((_, buttonIndex) => (
                          <div
                            key={buttonIndex}
                            className="h-7 w-20 rounded-full bg-zinc-100 animate-pulse"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-40 rounded-full bg-zinc-200 animate-pulse" />
                  <div className="h-28 w-full rounded-lg bg-zinc-100 animate-pulse" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="h-7 w-28 rounded-full bg-zinc-200 animate-pulse" />
                  <div className="h-3 w-48 rounded-full bg-zinc-100 animate-pulse" />
                </div>
              </div>
            </article>
            <aside className="rounded-2xl border border-dashed border-zinc-200 bg-white px-4 py-4 text-[11px] leading-relaxed text-zinc-600 sm:px-5 sm:py-5">
              <div className="space-y-2">
                <div className="h-3 w-16 rounded-full bg-zinc-200 animate-pulse" />
                <div className="h-4 w-40 rounded-full bg-zinc-200 animate-pulse" />
              </div>
              <div className="mt-3 space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="space-y-1 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="h-3 w-40 rounded-full bg-zinc-200 animate-pulse" />
                      <div className="h-4 w-4 rounded-full bg-zinc-100 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-3 w-56 rounded-full bg-zinc-100 animate-pulse" />
                      <div className="h-3 w-48 rounded-full bg-zinc-100 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
