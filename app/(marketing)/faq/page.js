"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import faqLakeHume from "@/public/faq-lake-hume.jpg";

const FAQS = [
  {
    category: "Access",
    question: "How can my facility access Mindsettle?",
    answer: "Contact Mindsettle to discuss your clinical setting and the right access arrangement for your organisation.",
  },
  {
    category: "About",
    question: "What is Mindsettle?",
    answer: "Mindsettle is an Australian profit-for-purpose enterprise combining tranquil natural imagery and curated soothing music to create calm in clinical settings.",
  },
  {
    category: "Technical",
    question:
      "Where is Mindsettle designed to be used?",
    answer:
      "Mindsettle is designed for clinical environments including waiting rooms, treatment rooms, hospital wards, patient rooms and reception areas, subject to the agreed service arrangement.",
  },
  {
    category: "Wellbeing",
    question: "Is Mindsettle medical treatment?",
    answer: "No. Mindsettle supports general wellbeing and relaxation. It does not diagnose, prevent or treat a condition and is not a substitute for professional medical care.",
  },
  {
    category: "About",
    question: "Who creates the content?",
    answer: "Mindsettle brings together founder and artist Lisa Behan with filmmakers, clinicians, conservationists, photographers and soundscape artists.",
  },
  {
    category: "Access",
    question: "Can organisation accounts manage members?",
    answer: "Yes. Organisation accounts can add and remove members within their own organisation. Added members become active when they sign up with the same email address.",
  },
  {
    category: "Collaboration",
    question: "Can I collaborate with Mindsettle?",
    answer: "Yes. Mindsettle welcomes enquiries from potential clients and creative collaborators through the Contact page.",
  },
];

const CATEGORIES = [
  "All",
  "About",
  "Access",
  "Wellbeing",
  "Technical",
  "Collaboration",
];

const CATEGORY_STYLES = {
  About: "bg-[#e3eadb] text-[#435c4b]",
  Access: "bg-[#dce8ed] text-[#405d69]",
  Wellbeing: "bg-[#f4dfd3] text-[#8a513f]",
  Technical: "bg-[#eee6d6] text-[#705f3e]",
  Collaboration: "bg-[#e8e1ea] text-[#66536b]",
};

const CATEGORY_DOTS = {
  All: "bg-[#163d34]",
  About: "bg-[#86a37f]",
  Access: "bg-[#7fa5b3]",
  Wellbeing: "bg-[#d58f73]",
  Technical: "bg-[#b49a65]",
  Collaboration: "bg-[#9d87a4]",
};

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
    <main className="overflow-hidden bg-[#f7f4ed] pt-24">
      <section className="relative overflow-hidden bg-[#163d34] text-white">
        <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-[#315a4f] blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-32 pt-16 sm:pt-20 lg:grid-cols-[1fr_.9fr] lg:gap-20 lg:px-10 lg:pb-40">
          <div className="relative z-10">
            <p className="eyebrow !text-[#d7f2ad]">Mindsettle help centre</p>
            <h1 className="mt-5 max-w-3xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-7xl">A calmer place to find the answer.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#d9e6de]">Practical guidance for facilities, viewers and collaborators—written clearly, without the overwhelm.</p>
            <div className="mt-9 flex flex-wrap gap-3 text-sm text-[#e7efe9]">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5">{FAQS.length} clear answers</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5">{CATEGORIES.length - 1} useful topics</span>
            </div>
          </div>

          <div className="relative lg:pl-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] border-[8px] border-white/10 shadow-[0_32px_90px_rgba(0,0,0,.25)]">
              <Image src={faqLakeHume} alt="Golden sunrise reflected over Lake Hume in New South Wales" fill preload placeholder="blur" sizes="(min-width: 1024px) 43vw, 100vw" className="object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#24343b]/75 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 flex items-center gap-4 rounded-2xl border border-white/20 bg-[#082720]/70 p-4 text-white shadow-lg backdrop-blur-md sm:inset-x-6 sm:bottom-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d7f2ad] text-[#163d34]" aria-hidden="true">✦</span>
                <div><p className="font-semibold">A quieter place to look.</p><p className="mt-1 text-xs text-[#d9e6de]">Clear guidance, at your pace.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="relative z-10 -mt-16 grid gap-5 rounded-[2.25rem] border border-white/75 bg-white/95 p-5 shadow-[0_24px_70px_rgba(41,56,62,.14)] backdrop-blur-xl sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <label htmlFor="faq-search" className="text-sm font-semibold text-[#29383e]">Search the help centre</label>
              <div className="mt-3 flex items-center rounded-2xl border border-[#bdcbc3] bg-[#fafbf7] px-5 transition focus-within:border-[#6d8b7b] focus-within:ring-4 focus-within:ring-[#dfe8d6]">
                <span className="mr-3 text-2xl text-[#72847c]" aria-hidden="true">⌕</span>
                <input id="faq-search" type="search" placeholder="Try ‘access’, ‘organisation’ or ‘wellbeing’..." value={search} onChange={(event) => setSearch(event.target.value)} className="min-h-16 w-full bg-transparent text-base text-[#29383e] outline-none placeholder:text-[#87958f]" />
              </div>
            </div>
            <div className="rounded-2xl bg-[#e3eadb] px-5 py-4 text-sm text-[#53645e] lg:max-w-56"><span className="font-semibold text-[#29383e]">Can’t find it?</span><br />Our team can help personally.</div>
          </div>

          <div className="mt-20 grid items-start gap-12 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-20">
            <aside className="lg:sticky lg:top-32">
              <p className="eyebrow !text-[#8a513f]">Browse by topic</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#29383e]">Find your way quickly.</h2>
              <div className="mt-7 space-y-2" aria-label="Filter questions by topic">
                {CATEGORIES.map((item) => {
                  const count = item === "All" ? FAQS.length : FAQS.filter((faq) => faq.category === item).length;
                  const isSelected = category === item;
                  return (
                    <button key={item} type="button" aria-pressed={isSelected} onClick={() => { setCategory(item); setOpenIndex(0); }} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition ${isSelected ? "border-[#163d34] bg-[#163d34] text-white shadow-[0_12px_28px_rgba(22,61,52,.18)]" : "border-transparent text-[#53645e] hover:border-[#d2dbd4] hover:bg-white"}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? "bg-[#d7f2ad]" : CATEGORY_DOTS[item]}`} />
                      <span className="flex-1">{item}</span>
                      <span className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs ${isSelected ? "bg-white/15 text-white" : "bg-[#e8ece7] text-[#6b7b73]"}`}>{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-[#e2d5c5] bg-[#f2e7d8] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#8a513f]">Wellbeing note</p>
                <p className="mt-3 text-sm leading-6 text-[#625b50]">Mindsettle supports relaxation and general wellbeing. It is not medical treatment.</p>
              </div>
            </aside>

            <div>
              <div className="flex items-end justify-between gap-6 border-b border-[#cfd8d1] pb-6">
                <div><p className="eyebrow">Helpful answers</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#29383e] sm:text-4xl">{category === "All" ? "Common questions" : `${category} questions`}</h2></div>
                <p className="hidden text-sm text-[#72847c] sm:block">{filteredFaqs.length} {filteredFaqs.length === 1 ? "result" : "results"}</p>
              </div>

              <div className="mt-7 space-y-5">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openIndex === index;
                  const answerId = `faq-answer-${index}`;
                  return (
                    <article key={faq.question} className={`relative overflow-hidden rounded-[1.75rem] border transition ${isOpen ? "border-[#9caf9f] bg-white shadow-[0_18px_48px_rgba(41,56,62,.10)]" : "border-[#d9dfda] bg-[#fcfbf7] hover:-translate-y-0.5 hover:border-[#b7c5bb] hover:shadow-[0_12px_32px_rgba(41,56,62,.07)]"}`}>
                      {isOpen && <div className="absolute inset-y-0 left-0 w-1.5 bg-[#86a37f]" />}
                      <button type="button" onClick={() => setOpenIndex(isOpen ? -1 : index)} className="flex w-full items-center gap-5 px-5 py-6 text-left sm:px-8 sm:py-7" aria-expanded={isOpen} aria-controls={answerId}>
                        <span className="hidden text-3xl font-light tracking-[-0.04em] text-[#a3b0aa] sm:block">{String(index + 1).padStart(2, "0")}</span>
                        <span className="min-w-0 flex-1"><span className={`inline-flex rounded-full px-3 py-1 text-[.66rem] font-semibold uppercase tracking-[0.14em] ${CATEGORY_STYLES[faq.category]}`}>{faq.category}</span><span className="mt-3 block text-lg font-semibold leading-7 text-[#29383e] sm:text-xl">{faq.question}</span></span>
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl transition ${isOpen ? "rotate-45 bg-[#163d34] text-white" : "border border-[#cad5cd] bg-white text-[#163d34]"}`} aria-hidden="true">+</span>
                      </button>
                      {isOpen && <div id={answerId} role="region" className="border-t border-[#dbe2dc] px-5 py-7 sm:pl-[6.7rem] sm:pr-20 sm:py-8"><p className="max-w-2xl text-[1.05rem] leading-8 text-[#53645e]">{faq.answer}</p></div>}
                    </article>
                  );
                })}
              </div>

              {filteredFaqs.length === 0 && <div className="mt-7 rounded-[2rem] border border-dashed border-[#b9c7bd] bg-white/60 p-12 text-center"><p className="text-xl font-semibold text-[#29383e]">No matching questions yet.</p><p className="mt-2 text-[#6c7d76]">Try another word, choose a different topic, or send us your question.</p></div>}
            </div>
          </div>

          <div className="relative mt-24 overflow-hidden rounded-[3rem] bg-[#344d5a] px-7 py-12 text-white shadow-[0_24px_70px_rgba(52,77,90,.18)] sm:px-12 sm:py-16 lg:px-16">
            <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[44px] border-[#f0bfa8]/25" />
            <div className="absolute -bottom-24 right-40 h-60 w-60 rounded-full bg-[#dfe8d6]/10" />
            <div className="relative max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f3c5ad]">A real person is here to help</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Your question doesn’t have to fit into a category.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#dce8ed]">Tell us about your facility, collaboration idea or access needs and we’ll help you find the clearest next step.</p>
              <Link href="/contact" className="mt-8 inline-flex min-h-14 items-center rounded-full bg-[#f8f4e9] px-7 text-sm font-semibold text-[#344d5a] transition hover:-translate-y-0.5 hover:bg-[#d7f2ad]">Ask Mindsettle <span className="ml-3" aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
