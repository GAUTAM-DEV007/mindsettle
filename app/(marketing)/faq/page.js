"use client";

import { useMemo, useState } from "react";

const FAQS = [
  {
    category: "Pricing",
    question: "How much does Mindsettle cost?",
    answer:
      "We offer three plans: Trial for 14 days, Basic at $19 per month, and Premium at $39 per month. All plans include access to the full content library.",
  },
  {
    category: "Pricing",
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes. You can cancel your subscription at any time from your account settings. Access continues until the end of your current billing period.",
  },
  {
    category: "Technical",
    question:
      "Does the platform work on smart TVs and tablets in hospital waiting rooms?",
    answer:
      "Yes. Mindsettle is designed to work across modern browsers, tablets, laptops, and supported smart display devices.",
  },
  {
    category: "Security",
    question: "Is patient data stored on the Mindsettle platform?",
    answer:
      "Mindsettle is designed to minimise the collection of sensitive information. Access controls and privacy settings should be configured according to your organisation's policies.",
  },
  {
    category: "Technical",
    question: "How do I upload content to the system?",
    answer:
      "Authorised administrators can upload and manage approved content through the admin portal.",
  },
  {
    category: "Support",
    question: "What happens when my free trial ends?",
    answer:
      "At the end of the free trial, you can select a paid plan to continue using the service. Your account information remains available during the upgrade process.",
  },
  {
    category: "Features",
    question: "How many users can I have on one account?",
    answer:
      "The number of users depends on your subscription plan. Organisation plans support multiple members and role-based access.",
  },
];

const CATEGORIES = [
  "All",
  "Pricing",
  "Features",
  "Security",
  "Technical",
  "Support",
];

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState(0);

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory =
        category === "All" || faq.category === category;

      const searchText = search.toLowerCase();
      const matchesSearch =
        faq.question.toLowerCase().includes(searchText) ||
        faq.answer.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <main className="pt-24">
      <section className="bg-gradient-to-r from-sky-50 via-white to-emerald-50">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Frequently Asked Questions
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Everything you need to know about Mindsettle.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <input
            type="search"
            placeholder="Search questions..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />

          <div className="mt-5 flex flex-wrap gap-3">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setCategory(item);
                  setOpenIndex(0);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  category === item
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-sky-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <article
                  key={faq.question}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                  >
                    <span className="font-semibold text-slate-950">
                      {faq.question}
                    </span>

                    <span className="text-xl text-emerald-700">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-200 px-5 py-5">
                      <p className="text-sm leading-7 text-slate-600">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="mt-8 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-600">
              No questions matched your search.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}