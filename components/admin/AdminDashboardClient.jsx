"use client";

import { useState } from "react";
import Link from "next/link";

import MediaUploader from "@/components/admin/MediaUploader";

import {
  updateMedia,
  deleteMediaRecord,
  addProgram,
  updateProgram,
  deleteProgram,
  addVideoToProgram,
  removeVideoFromProgram,
  moveProgramVideoUp,
  moveProgramVideoDown,
} from "@/app/admin/actions";

import { updateMediaPrograms } from "@/app/admin/program-media-actions";

import {
  addMood,
  updateMood,
  deleteMood,
} from "@/app/admin/mood-actions";

import {
  addSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from "@/app/admin/social-actions";

export default function AdminDashboardClient({
  stats,
  categories = [],
  moods = [],
  media = [],
  programs = [],
  socialLinks = [],
  mediaError = null,
  programError = null,
  socialError = null,
}) {
  const [activeSection, setActiveSection] =
    useState(
      mediaError
        ? "media"
        : programError
          ? "programs"
          : socialError
            ? "socials"
            : "overview"
    );

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [mediaView, setMediaView] =
    useState("manage");

  const [searchValue, setSearchValue] =
    useState("");

  const {
    total_users,
    total_videos,
    subscriptions_by_status,
    most_watched_videos,
    most_favourited_videos,
    user_growth,
  } = stats || {};

  const navigation = [
    {
      id: "overview",
      label: "Overview",
      icon: "⌂",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: "▥",
    },
    {
      id: "media",
      label: "Media Management",
      icon: "▶",
    },
    {
      id: "programs",
      label: "Programs",
      icon: "▤",
    },
    {
      id: "moods",
      label: "Mood Management",
      icon: "☻",
    },
    {
      id: "socials",
      label: "Social Media",
      icon: "↗",
    },
  ];

  function selectSection(section) {
    setActiveSection(section);
    setSidebarOpen(false);
  }

  const currentSection =
    navigation.find(
      (item) =>
        item.id === activeSection
    )?.label || "Admin Dashboard";

  const filteredMedia =
    media.filter((item) => {
      const query =
        searchValue
          .trim()
          .toLowerCase();

      if (!query) {
        return true;
      }

      const searchable = `
        ${item.title || ""}
        ${item.description || ""}
        ${item.instructor || ""}
      `.toLowerCase();

      return searchable.includes(
        query
      );
    });

  return (
    <div className="min-h-screen bg-[#f5f5ed] text-[#29383e]">
      {/* MOBILE HEADER */}

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#dfe5dc] bg-[#fffdfa]/95 px-5 shadow-sm backdrop-blur lg:hidden">
        <div>
          <p className="text-base font-bold text-[#163d34]">
            MindSettle
          </p>

          <p className="text-xs font-medium text-[#78906f]">
            Administration
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setSidebarOpen(
              (current) => !current
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#163d34] text-xl text-white shadow-sm transition hover:bg-[#12372f]"
          aria-label="Toggle admin menu"
        >
          ☰
        </button>
      </header>

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="flex min-h-screen">
        {/* SIDEBAR */}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#cfd8cb] bg-[#fffdfa] shadow-xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          {/* BRAND */}

          <div className="flex h-24 items-center justify-between border-b border-[#dfe5dc] px-6">
            <Link
              href="/admin"
              className="group flex items-center gap-3 rounded-2xl px-2 py-1 transition-all duration-300 hover:bg-[#dce8ca]/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-full.png"
                alt="MindSettle"
                className="h-16 w-auto object-contain transition-all duration-300 group-hover:scale-[1.04] group-hover:brightness-110 group-hover:saturate-150"
              />

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#78906f]">
                Administration
              </p>
            </Link>

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-[#6c8178] transition hover:bg-[#eef1ed] hover:text-[#163d34] lg:hidden"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          {/* NAVIGATION */}

          <nav className="flex-1 px-4 py-7">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8a9992]">
              Dashboard
            </p>

            <div className="space-y-2">
              {navigation.map(
                (item) => {
                  const active =
                    activeSection ===
                    item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        selectSection(
                          item.id
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                        active
                          ? "bg-[#163d34] text-white shadow-[0_8px_22px_rgba(18,55,47,0.18)]"
                          : "text-[#5a6d66] hover:bg-[#eef3e8] hover:text-[#163d34]"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          active
                            ? "bg-white/15 text-white"
                            : "bg-[#dfe8d6] text-[#344d5a]"
                        }`}
                      >
                        {item.icon}
                      </span>

                      {item.label}
                    </button>
                  );
                }
              )}
            </div>
          </nav>

          {/* SIDEBAR FOOTER */}

          <div className="border-t border-[#dfe5dc] p-4">
            <Link
              href="/library"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#5a6d66] transition hover:bg-[#eef3e8] hover:text-[#163d34]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef1ed]">
                ←
              </span>

              Back to site
            </Link>
          </div>
        </aside>

        {/* MAIN CONTENT */}

        <main className="min-w-0 flex-1 bg-[#f5f5ed]">
          {/* DESKTOP TOP BAR */}

          <div className="hidden border-b border-[#cfd8cb] bg-[#fffdfa]/95 backdrop-blur-xl lg:block">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-10 py-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#78906f]">
                  MindSettle Administration
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#163d34]">
                  {currentSection}
                </h1>
              </div>

              <Link
                href="/library"
                className="rounded-lg border border-[#dfe5dc] bg-white px-5 py-2.5 text-sm font-semibold text-[#4b615b] shadow-sm transition hover:border-[#78906f] hover:text-[#163d34]"
              >
                Back to site
              </Link>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
            {/* ======================================================
                MOOD MANAGEMENT
            ====================================================== */}

            {activeSection ===
              "moods" && (
              <section>
                <SectionHeader
                  eyebrow="Wellbeing organisation"
                  title="Mood Management"
                  description="Create, edit and remove the moods used across MindSettle. Media can then be assigned to these moods from Media Management."
                />

                <article className="rounded-[22px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_10px_30px_rgba(18,55,47,0.06)]">
                  {/* ADD MOOD */}

                  <div>
                    <h3 className="text-lg font-bold text-[#163d34]">
                      Add Mood
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#5a6d66]">
                      New moods automatically become available to the MindSettle mood experience and to Admin media assignment.
                    </p>
                  </div>

                  <form
                    action={addMood}
                    className="mt-6 grid gap-4 border-b border-[#e4e8df] pb-8 lg:grid-cols-2"
                  >
                    <FormField
                      label="Mood name"
                      htmlFor="new-mood-name"
                    >
                      <input
                        id="new-mood-name"
                        name="name"
                        required
                        placeholder="e.g. Calm"
                        className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition placeholder:text-[#8a9992] focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                      />
                    </FormField>

                    <FormField
                      label="Slug"
                      htmlFor="new-mood-slug"
                    >
                      <input
                        id="new-mood-slug"
                        name="slug"
                        required
                        placeholder="e.g. calm"
                        className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition placeholder:text-[#8a9992] focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                      />
                    </FormField>

                    <FormField
                      label="Emoji"
                      htmlFor="new-mood-emoji"
                    >
                      <input
                        id="new-mood-emoji"
                        name="emoji"
                        placeholder="e.g. 🌿"
                        className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition placeholder:text-[#8a9992] focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                      />
                    </FormField>

                    <div className="lg:col-span-2">
                      <FormField
                        label="Description"
                        htmlFor="new-mood-description"
                      >
                        <textarea
                          id="new-mood-description"
                          name="description"
                          rows={3}
                          placeholder="Describe when this mood should help the user."
                          className="w-full resize-y rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm leading-6 text-[#163d34] outline-none transition placeholder:text-[#8a9992] focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                        />
                      </FormField>
                    </div>

                    <div className="lg:col-span-2">
                      <button
                        type="submit"
                        className="rounded-lg bg-[#163d34] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12372f]"
                      >
                        Add Mood
                      </button>
                    </div>
                  </form>

                  {/* EXISTING MOODS */}

                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-[#163d34]">
                      Existing Moods
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#5a6d66]">
                      Edit the wording, emoji or description. Deleting a mood removes only its mood relationships; it does not delete any media.
                    </p>

                    {moods.length === 0 ? (
                      <div className="mt-5 rounded-xl border border-dashed border-[#cfd8cb] bg-[#eef3e8]/70 px-6 py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#dce8ca] text-xl">
                          ☻
                        </div>

                        <p className="mt-4 text-sm font-semibold text-[#4b615b]">
                          No moods yet
                        </p>

                        <p className="mt-1 text-xs text-[#6c8178]">
                          Create the first mood using the form above.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-5 space-y-4">
                        {moods.map((mood) => (
                          <details
                            key={mood.id}
                            className="group overflow-hidden rounded-xl border border-[#dfe5dc] bg-[#f5f5ed]"
                          >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#eef3e8]">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                                  {mood.emoji || "◌"}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-[#29383e]">
                                    {mood.name}
                                  </p>

                                  <p className="mt-0.5 truncate text-xs text-[#6c8178]">
                                    /{mood.slug}
                                  </p>
                                </div>
                              </div>

                              <div className="group flex items-center gap-3 rounded-2xl px-2 py-1 transition-all duration-300 hover:bg-[#dce8ca]/60">
                                <span className="hidden text-xs font-semibold text-[#6c8178] sm:inline">
                                  Edit mood
                                </span>

                                <svg
                                  viewBox="0 0 20 20"
                                  className="h-5 w-5 shrink-0 text-[#6c8178] transition-transform duration-200 group-open:rotate-180"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path d="M5.5 7.5 10 12l4.5-4.5" />
                                </svg>
                              </div>
                            </summary>

                            <form
                              action={updateMood}
                              className="border-t border-[#dfe5dc] bg-white p-5"
                            >
                              <input
                                type="hidden"
                                name="id"
                                value={mood.id}
                              />

                              <div className="grid gap-4 lg:grid-cols-[1fr_1fr_140px]">
                                <FormField
                                  label="Name"
                                  htmlFor={`mood-name-${mood.id}`}
                                >
                                  <input
                                    id={`mood-name-${mood.id}`}
                                    name="name"
                                    required
                                    defaultValue={mood.name}
                                    className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                                  />
                                </FormField>

                                <FormField
                                  label="Slug"
                                  htmlFor={`mood-slug-${mood.id}`}
                                >
                                  <input
                                    id={`mood-slug-${mood.id}`}
                                    name="slug"
                                    required
                                    defaultValue={mood.slug}
                                    className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                                  />
                                </FormField>

                                <FormField
                                  label="Emoji"
                                  htmlFor={`mood-emoji-${mood.id}`}
                                >
                                  <input
                                    id={`mood-emoji-${mood.id}`}
                                    name="emoji"
                                    defaultValue={mood.emoji || ""}
                                    className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-center text-lg text-[#163d34] outline-none transition focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                                  />
                                </FormField>
                              </div>

                              <div className="mt-4">
                                <FormField
                                  label="Description"
                                  htmlFor={`mood-description-${mood.id}`}
                                >
                                  <textarea
                                    id={`mood-description-${mood.id}`}
                                    name="description"
                                    rows={3}
                                    defaultValue={mood.description || ""}
                                    className="w-full resize-y rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm leading-6 text-[#163d34] outline-none transition focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                                  />
                                </FormField>
                              </div>

                              <div className="mt-5 flex flex-col gap-3 border-t border-[#dfe5dc] pt-4 sm:flex-row sm:justify-between">
                                <button
                                  type="submit"
                                  className="rounded-lg bg-[#163d34] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12372f]"
                                >
                                  Save Mood
                                </button>

                                <button
                                  type="submit"
                                  formAction={deleteMood}
                                  className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  Delete Mood
                                </button>
                              </div>
                            </form>
                          </details>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </section>
            )}

            {/* ======================================================
                SOCIAL MEDIA
            ====================================================== */}

            {activeSection ===
              "socials" && (
              <section>
                <SectionHeader
                  eyebrow="Brand & community"
                  title="Social Media"
                  description="Manage the social media accounts shown across MindSettle. Enabled links with a valid URL can be displayed automatically in the user footer."
                />

                {socialError && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                    {socialError}
                  </div>
                )}

                <article className="rounded-[22px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_10px_30px_rgba(18,55,47,0.06)]">
                  {/* ADD SOCIAL LINK */}

                  <div>
                    <h3 className="text-lg font-bold text-[#163d34]">
                      Add Social Platform
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#5a6d66]">
                      Add another social platform if MindSettle starts using a new account. Existing Instagram, Facebook, YouTube, LinkedIn and TikTok rows can be edited below.
                    </p>
                  </div>

                  <form
                    action={addSocialLink}
                    className="mt-6 grid gap-4 border-b border-[#e4e8df] pb-8 lg:grid-cols-2"
                  >
                    <FormField
                      label="Platform"
                      htmlFor="new-social-platform"
                    >
                      <input
                        id="new-social-platform"
                        name="platform"
                        required
                        placeholder="e.g. Instagram"
                        className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition placeholder:text-[#8a9992] focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                      />
                    </FormField>

                    <FormField
                      label="Profile URL"
                      htmlFor="new-social-url"
                    >
                      <input
                        id="new-social-url"
                        name="url"
                        type="url"
                        placeholder="https://..."
                        className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition placeholder:text-[#8a9992] focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                      />
                    </FormField>

                    <FormField
                      label="Display order"
                      htmlFor="new-social-sort-order"
                    >
                      <input
                        id="new-social-sort-order"
                        name="sortOrder"
                        type="number"
                        min="1"
                        defaultValue={socialLinks.length + 1}
                        className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                      />
                    </FormField>

                    <div className="flex items-end">
                      <label className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-[#dfe5dc] bg-[#f5f5ed] px-4 py-3">
                        <input
                          type="checkbox"
                          name="isEnabled"
                          className="mt-1 h-4 w-4 accent-[#163d34]"
                        />

                        <span>
                          <span className="block text-sm font-semibold text-[#29383e]">
                            Enabled
                          </span>

                          <span className="mt-0.5 block text-xs leading-5 text-[#6c8178]">
                            Show this account once a valid profile URL is saved.
                          </span>
                        </span>
                      </label>
                    </div>

                    <div className="lg:col-span-2">
                      <button
                        type="submit"
                        className="rounded-lg bg-[#163d34] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12372f]"
                      >
                        Add Social Platform
                      </button>
                    </div>
                  </form>

                  {/* EXISTING SOCIAL LINKS */}

                  <div className="mt-8">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-[#163d34]">
                          Existing Social Links
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-[#5a6d66]">
                          Open a platform to edit its URL, visibility or display order.
                        </p>
                      </div>

                      <p className="text-xs font-medium text-[#6c8178]">
                        Enabled links without a URL will stay hidden from the user footer.
                      </p>
                    </div>

                    {socialLinks.length === 0 ? (
                      <div className="mt-5 rounded-xl border border-dashed border-[#cfd8cb] bg-[#eef3e8]/70 px-6 py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#dce8ca] text-xl text-[#163d34]">
                          ↗
                        </div>

                        <p className="mt-4 text-sm font-semibold text-[#4b615b]">
                          No social platforms yet
                        </p>

                        <p className="mt-1 text-xs text-[#6c8178]">
                          Add the first platform using the form above.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-5 space-y-3">
                        {socialLinks.map((social) => (
                          <details
                            key={social.id}
                            className="group overflow-hidden rounded-xl border border-[#dfe5dc] bg-[#f5f5ed]"
                          >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#eef3e8]">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold uppercase text-[#163d34] shadow-sm">
                                  {social.platform
                                    ?.trim()
                                    ?.slice(0, 2) || "↗"}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate text-sm font-bold text-[#29383e]">
                                      {social.platform}
                                    </p>

                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                        social.is_enabled
                                          ? "bg-[#dce8ca] text-[#163d34]"
                                          : "bg-[#dfe5dc] text-[#5a6d66]"
                                      }`}
                                    >
                                      {social.is_enabled
                                        ? "Enabled"
                                        : "Disabled"}
                                    </span>
                                  </div>

                                  <p className="mt-0.5 max-w-xl truncate text-xs text-[#6c8178]">
                                    {social.url ||
                                      "No profile URL saved"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-3">
                                <span className="hidden text-xs font-semibold text-[#6c8178] sm:inline">
                                  Edit link
                                </span>

                                <svg
                                  viewBox="0 0 20 20"
                                  className="h-5 w-5 text-[#6c8178] transition-transform duration-200 group-open:rotate-180"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path d="M5.5 7.5 10 12l4.5-4.5" />
                                </svg>
                              </div>
                            </summary>

                            <form
                              action={updateSocialLink}
                              className="border-t border-[#dfe5dc] bg-white p-5"
                            >
                              <input
                                type="hidden"
                                name="id"
                                value={social.id}
                              />

                              <div className="grid gap-4 lg:grid-cols-[1fr_2fr_150px]">
                                <FormField
                                  label="Platform"
                                  htmlFor={`social-platform-${social.id}`}
                                >
                                  <input
                                    id={`social-platform-${social.id}`}
                                    name="platform"
                                    required
                                    defaultValue={social.platform}
                                    className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                                  />
                                </FormField>

                                <FormField
                                  label="Profile URL"
                                  htmlFor={`social-url-${social.id}`}
                                >
                                  <input
                                    id={`social-url-${social.id}`}
                                    name="url"
                                    type="url"
                                    defaultValue={social.url || ""}
                                    placeholder="https://..."
                                    className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition placeholder:text-[#8a9992] focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                                  />
                                </FormField>

                                <FormField
                                  label="Display order"
                                  htmlFor={`social-order-${social.id}`}
                                >
                                  <input
                                    id={`social-order-${social.id}`}
                                    name="sortOrder"
                                    type="number"
                                    min="1"
                                    defaultValue={social.sort_order || 1}
                                    className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                                  />
                                </FormField>
                              </div>

                              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[#dfe5dc] bg-[#f5f5ed] px-4 py-3">
                                <input
                                  type="checkbox"
                                  name="isEnabled"
                                  defaultChecked={Boolean(
                                    social.is_enabled
                                  )}
                                  className="mt-1 h-4 w-4 accent-[#163d34]"
                                />

                                <span>
                                  <span className="block text-sm font-semibold text-[#29383e]">
                                    Enabled
                                  </span>

                                  <span className="mt-0.5 block text-xs leading-5 text-[#6c8178]">
                                    Allow this social account to appear on MindSettle when a URL is available.
                                  </span>
                                </span>
                              </label>

                              <div className="mt-5 flex flex-col gap-3 border-t border-[#dfe5dc] pt-4 sm:flex-row sm:justify-between">
                                <button
                                  type="submit"
                                  className="rounded-lg bg-[#163d34] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12372f]"
                                >
                                  Save Social Link
                                </button>

                                <button
                                  type="submit"
                                  formAction={deleteSocialLink}
                                  className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  Delete Social Link
                                </button>
                              </div>
                            </form>
                          </details>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </section>
            )}

            {/* ======================================================
                OVERVIEW
            ====================================================== */}

            {activeSection ===
              "overview" && (
              <section>
                <SectionHeader
                  eyebrow="Dashboard"
                  title="Overview"
                  description="A quick view of users, media and subscriptions across the MindSettle platform."
                />

                {/* PRIMARY STATS */}

                <div className="grid gap-6 sm:grid-cols-2">
                  <StatCard
                    label="Registered users"
                    value={
                      total_users
                    }
                    icon="◇"
                    accent="sky"
                  />

                  <StatCard
                    label="Media items"
                    value={
                      total_videos
                    }
                    icon="▶"
                    accent="emerald"
                  />
                </div>

                <div className="mt-8 grid gap-8 xl:grid-cols-2">
                  {/* SUBSCRIPTIONS */}

                  <article className="rounded-[22px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_10px_30px_rgba(18,55,47,0.06)]">
                    <div>
                      <h3 className="text-xl font-bold text-[#163d34]">
                        Subscriptions
                      </h3>

                      <p className="mt-2 text-sm text-[#5a6d66]">
                        Current
                        subscription status
                        across registered
                        facilities.
                      </p>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <MiniStat
                        label="Active"
                        value={
                          subscriptions_by_status
                            ?.active
                        }
                      />

                      <MiniStat
                        label="Trialing"
                        value={
                          subscriptions_by_status
                            ?.trialing
                        }
                      />

                      <MiniStat
                        label="Canceled"
                        value={
                          subscriptions_by_status
                            ?.canceled
                        }
                      />
                    </div>
                  </article>

                  {/* USER GROWTH */}

                  <article className="rounded-[22px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_10px_30px_rgba(18,55,47,0.06)]">
                    <div>
                      <h3 className="text-xl font-bold text-[#163d34]">
                        User Growth
                      </h3>

                      <p className="mt-2 text-sm text-[#5a6d66]">
                        New users
                        registered during
                        the last 30 days.
                      </p>
                    </div>

                    <div className="mt-5 max-h-64 overflow-y-auto pr-2">
                      {user_growth
                        ?.length ? (
                        <table className="w-full text-sm">
                          <tbody>
                            {user_growth.map(
                              (
                                day
                              ) => (
                                <tr
                                  key={
                                    day.date
                                  }
                                  className="border-b border-[#e4e8df] last:border-0"
                                >
                                  <td className="py-2.5 text-[#5a6d66]">
                                    {new Date(
                                      day.date
                                    ).toLocaleDateString(
                                      "en-AU",
                                      {
                                        month:
                                          "short",
                                        day: "numeric",
                                        timeZone:
                                          "Australia/Sydney",
                                      }
                                    )}
                                  </td>

                                  <td className="py-2.5 text-right font-semibold text-[#163d34]">
                                    {
                                      day.new_users
                                    }
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-sm text-[#6c8178]">
                          No user growth
                          data yet.
                        </p>
                      )}
                    </div>
                  </article>
                </div>
              </section>
            )}

            {/* ======================================================
                ANALYTICS
            ====================================================== */}

            {activeSection ===
              "analytics" && (
              <section>
                <SectionHeader
                  eyebrow="Performance"
                  title="Media Analytics"
                  description="Understand which MindSettle videos and audio are watched and saved most."
                />

                <div className="grid gap-8 lg:grid-cols-2">
                  <RankedVideoList
                    title="Most Watched"
                    description="Content with the highest number of completed or recorded viewing sessions."
                    items={
                      most_watched_videos
                    }
                    countKey="watch_count"
                    emptyLabel="No watch history yet."
                    icon="▶"
                  />

                  <RankedVideoList
                    title="Most Favourited"
                    description="Content saved most frequently by MindSettle users."
                    items={
                      most_favourited_videos
                    }
                    countKey="favourite_count"
                    emptyLabel="No favourites yet."
                    icon="♡"
                  />
                </div>
              </section>
            )}

            {/* ======================================================
                MEDIA MANAGEMENT
            ====================================================== */}

            {activeSection ===
              "media" && (
              <section>
                <SectionHeader
                  eyebrow="Content"
                  title="Media Management"
                  description="Upload, organise and manage videos, audio and images used across the MindSettle platform."
                />

                {mediaError && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                    {mediaError}
                  </div>
                )}

                {/* MEDIA SUB NAVIGATION */}

                <div className="mb-6 inline-flex rounded-xl border border-[#dfe5dc] bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() =>
                      setMediaView(
                        "manage"
                      )
                    }
                    className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                      mediaView ===
                      "manage"
                        ? "bg-[#163d34] text-white shadow-sm"
                        : "text-[#5a6d66] hover:bg-[#eef3e8] hover:text-[#163d34]"
                    }`}
                  >
                    Manage Media
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setMediaView(
                        "upload"
                      )
                    }
                    className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                      mediaView ===
                      "upload"
                        ? "bg-[#163d34] text-white shadow-sm"
                        : "text-[#5a6d66] hover:bg-[#eef3e8] hover:text-[#163d34]"
                    }`}
                  >
                    Upload Media
                  </button>
                </div>

                {/* UPLOAD */}

                {mediaView ===
                  "upload" && (
                  <div className="overflow-hidden rounded-xl border border-[#dfe5dc] bg-white shadow-md">
                    <MediaUploader />
                  </div>
                )}

                {/* MANAGE */}

                {mediaView ===
                  "manage" && (
                  <div className="space-y-6">
                    {/* SEARCH + SUMMARY */}

                    <div className="flex flex-col gap-4 rounded-xl border border-[#dfe5dc] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-[#163d34]">
                          Media Library
                        </h3>

                        <p className="mt-1 text-sm text-[#5a6d66]">
                          {
                            media.length
                          }{" "}
                          media item
                          {media.length ===
                          1
                            ? ""
                            : "s"}{" "}
                          currently stored.
                        </p>
                      </div>

                      <div className="relative w-full sm:w-72">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a9992]"
                          aria-hidden="true"
                        >
                          <circle
                            cx="11"
                            cy="11"
                            r="7"
                          />

                          <path d="m20 20-3.5-3.5" />
                        </svg>

                        <input
                          type="search"
                          value={
                            searchValue
                          }
                          onChange={(
                            event
                          ) =>
                            setSearchValue(
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Search media..."
                          className="w-full rounded-lg border border-[#dfe5dc] bg-white py-2.5 pl-10 pr-4 text-sm text-[#163d34] outline-none transition placeholder:text-[#8a9992] focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                        />
                      </div>
                    </div>

                    {filteredMedia.length ===
                    0 ? (
                      <div className="rounded-xl border border-dashed border-[#cfd8cb] bg-[#eef3e8]/70 px-6 py-14 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#dce8ca] text-[#163d34]">
                          ▶
                        </div>

                        <h3 className="mt-4 text-base font-bold text-[#163d34]">
                          {media.length ===
                          0
                            ? "No media uploaded yet"
                            : "No matching media"}
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5a6d66]">
                          {media.length ===
                          0
                            ? "Upload your first MindSettle video, audio file or image to begin building the media library."
                            : "Try another search term."}
                        </p>

                        {media.length ===
                          0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setMediaView(
                                "upload"
                              )
                            }
                            className="mt-5 rounded-lg bg-[#163d34] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12372f]"
                          >
                            Upload Media
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {filteredMedia.map(
                          (item) => (
                            <MediaManagementCard
                              key={
                                item.id
                              }
                              item={
                                item
                              }
                              categories={
                                categories
                              }
                              moods={
                                moods
                              }
                              programs={
                                programs
                              }
                            />
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}


            {/* ======================================================
                PROGRAMS
            ====================================================== */}

            {activeSection ===
              "programs" && (
              <section>
                <SectionHeader
                  eyebrow="Content journeys"
                  title="Programs"
                  description="Create structured MindSettle programs and control which media appears in each program and in what order."
                />

                {programError && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                    {programError}
                  </div>
                )}

                <article className="rounded-[22px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_10px_30px_rgba(18,55,47,0.06)]">
                  <div>
                    <h3 className="text-lg font-bold text-[#163d34]">
                      Add Program
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#5a6d66]">
                      Create a program first, then add and order media inside it.
                    </p>
                  </div>

                  <form
                    action={addProgram}
                    className="mt-6 grid gap-4 border-b border-[#e4e8df] pb-7 lg:grid-cols-2"
                  >
                    <FormField
                      label="Program title"
                      htmlFor="new-program-title"
                    >
                      <input
                        id="new-program-title"
                        name="title"
                        required
                        placeholder="e.g. Better Sleep"
                        className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition placeholder:text-[#8a9992] focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                      />
                    </FormField>

                    <FormField
                      label="Slug"
                      htmlFor="new-program-slug"
                    >
                      <input
                        id="new-program-slug"
                        name="slug"
                        required
                        placeholder="e.g. better-sleep"
                        className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition placeholder:text-[#8a9992] focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                      />
                    </FormField>

                    <div className="lg:col-span-2">
                      <FormField
                        label="Description"
                        htmlFor="new-program-description"
                      >
                        <textarea
                          id="new-program-description"
                          name="description"
                          rows={3}
                          placeholder="Describe what this program helps users work through."
                          className="w-full resize-y rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm leading-6 text-[#163d34] outline-none transition placeholder:text-[#8a9992] focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                        />
                      </FormField>
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#dfe5dc] bg-[#f5f5ed] px-4 py-3">
                        <input
                          type="checkbox"
                          name="isPublished"
                          defaultChecked
                          className="mt-1 h-4 w-4 accent-[#163d34]"
                        />

                        <span>
                          <span className="block text-sm font-semibold text-[#29383e]">
                            Published
                          </span>
                          <span className="mt-0.5 block text-xs text-[#6c8178]">
                            Make the program available to users.
                          </span>
                        </span>
                      </label>

                      <button
                        type="submit"
                        className="rounded-lg bg-[#163d34] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12372f]"
                      >
                        Add Program
                      </button>
                    </div>
                  </form>

                  <div className="mt-7">
                    <h3 className="text-lg font-bold text-[#163d34]">
                      Existing Programs
                    </h3>
                    <p className="mt-1 text-sm text-[#5a6d66]">
                      Edit program details, add or remove media, and control the session order.
                    </p>
                  </div>
                </article>

                <div className="mt-6 space-y-5">
                  {programs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#cfd8cb] bg-[#eef3e8]/70 px-6 py-14 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#dce8ca] text-[#163d34]">
                        ▤
                      </div>
                      <h3 className="mt-4 text-base font-bold text-[#163d34]">
                        No programs yet
                      </h3>
                      <p className="mt-2 text-sm text-[#5a6d66]">
                        Create your first program using the form above.
                      </p>
                    </div>
                  ) : (
                    programs.map((program) => (
                      <ProgramManagementCard
                        key={program.id}
                        program={program}
                        media={media}
                      />
                    ))
                  )}
                </div>
              </section>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}


/* ==========================================================
   PROGRAM MANAGEMENT CARD
========================================================== */

function ProgramManagementCard({
  program,
  media,
}) {
  const [editing, setEditing] =
    useState(false);

  const programVideos =
    Array.isArray(program.videos)
      ? program.videos
      : [];

  const programVideoIds =
    new Set(
      programVideos.map(
        (video) => video.id
      )
    );

  const availableMedia =
    media.filter(
      (item) =>
        !programVideoIds.has(
          item.id
        )
    );

  return (
    <article className="overflow-hidden rounded-xl border border-[#dfe5dc] bg-white shadow-sm">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-[#163d34]">
                {program.title}
              </h3>

              <StatusBadge
                active={
                  program.is_published
                }
                activeLabel="Published"
                inactiveLabel="Hidden"
              />
            </div>

            <p className="mt-1 text-xs font-semibold text-[#8a9992]">
              /programs/{program.slug}
            </p>

            {program.description && (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5a6d66]">
                {program.description}
              </p>
            )}

            <p className="mt-3 text-sm font-semibold text-[#163d34]">
              {programVideos.length}{" "}
              {programVideos.length === 1
                ? "session"
                : "sessions"}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setEditing(
                (current) => !current
              )
            }
            className="shrink-0 rounded-lg border border-[#cfd8cb] px-4 py-2 text-sm font-semibold text-[#163d34] transition hover:bg-[#eef3e8]"
          >
            {editing
              ? "Close editor"
              : "Edit program"}
          </button>
        </div>
      </div>

      {editing && (
        <div className="border-t border-[#dfe5dc] bg-[#f5f5ed]/80 p-5 sm:p-6">
          <form
            action={updateProgram}
            className="grid gap-5 lg:grid-cols-2"
          >
            <input
              type="hidden"
              name="id"
              value={program.id}
            />

            <FormField
              label="Program title"
              htmlFor={`program-title-${program.id}`}
            >
              <input
                id={`program-title-${program.id}`}
                name="title"
                required
                defaultValue={
                  program.title || ""
                }
                className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
              />
            </FormField>

            <FormField
              label="Slug"
              htmlFor={`program-slug-${program.id}`}
            >
              <input
                id={`program-slug-${program.id}`}
                name="slug"
                required
                defaultValue={
                  program.slug || ""
                }
                className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
              />
            </FormField>

            <div className="lg:col-span-2">
              <FormField
                label="Description"
                htmlFor={`program-description-${program.id}`}
              >
                <textarea
                  id={`program-description-${program.id}`}
                  name="description"
                  rows={3}
                  defaultValue={
                    program.description || ""
                  }
                  className="w-full resize-y rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm leading-6 text-[#163d34] outline-none transition focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                />
              </FormField>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-3 border-t border-[#dfe5dc] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#4b615b]">
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={
                    Boolean(
                      program.is_published
                    )
                  }
                  className="h-4 w-4 accent-[#163d34]"
                />
                Published
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-[#163d34] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12372f]"
                >
                  Save program
                </button>

                <button
                  type="submit"
                  formAction={deleteProgram}
                  className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Delete program
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="border-t border-[#dfe5dc] p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h4 className="text-base font-bold text-[#163d34]">
              Program sessions
            </h4>
            <p className="mt-1 text-sm text-[#5a6d66]">
              Add, remove and reorder media in this program.
            </p>
          </div>

          {availableMedia.length > 0 && (
            <form
              action={addVideoToProgram}
              className="flex w-full gap-2 sm:w-auto"
            >
              <input
                type="hidden"
                name="programId"
                value={program.id}
              />

              <select
                name="videoId"
                required
                defaultValue=""
                className="min-w-0 flex-1 rounded-lg border border-[#dfe5dc] bg-white px-3 py-2.5 text-sm text-[#4b615b] outline-none focus:border-[#78906f] sm:w-64"
              >
                <option value="" disabled>
                  Choose media
                </option>

                {availableMedia.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.title}
                    </option>
                  )
                )}
              </select>

              <button
                type="submit"
                className="shrink-0 rounded-lg bg-[#163d34] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12372f]"
              >
                + Add
              </button>
            </form>
          )}
        </div>

        {programVideos.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-[#cfd8cb] bg-[#f5f5ed] px-5 py-8 text-center text-sm text-[#6c8178]">
            No media has been added to this program yet.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {programVideos.map(
              (video, index) => (
                <div
                  key={video.id}
                  className="flex flex-col gap-3 rounded-xl border border-[#dfe5dc] bg-[#f5f5ed] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dce8ca] text-xs font-bold text-[#163d34]">
                      {index + 1}
                    </div>

                    {video.signed_thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          video.signed_thumbnail_url
                        }
                        alt=""
                        className="h-12 w-20 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-[#dfe5dc] text-[#6c8178]">
                        ▶
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#29383e]">
                        {video.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6c8178]">
                        Position {video.position}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <form
                      action={moveProgramVideoUp}
                    >
                      <input
                        type="hidden"
                        name="programId"
                        value={program.id}
                      />
                      <input
                        type="hidden"
                        name="videoId"
                        value={video.id}
                      />
                      <button
                        type="submit"
                        disabled={index === 0}
                        className="rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-xs font-semibold text-[#4b615b] transition hover:bg-[#eef1ed] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ↑ Up
                      </button>
                    </form>

                    <form
                      action={moveProgramVideoDown}
                    >
                      <input
                        type="hidden"
                        name="programId"
                        value={program.id}
                      />
                      <input
                        type="hidden"
                        name="videoId"
                        value={video.id}
                      />
                      <button
                        type="submit"
                        disabled={
                          index ===
                          programVideos.length - 1
                        }
                        className="rounded-lg border border-[#dfe5dc] bg-white px-3 py-2 text-xs font-semibold text-[#4b615b] transition hover:bg-[#eef1ed] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ↓ Down
                      </button>
                    </form>

                    <form
                      action={removeVideoFromProgram}
                    >
                      <input
                        type="hidden"
                        name="programId"
                        value={program.id}
                      />
                      <input
                        type="hidden"
                        name="videoId"
                        value={video.id}
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/* ==========================================================
   MEDIA MANAGEMENT CARD
========================================================== */

function MediaManagementCard({
  item,
  categories,
  moods,
  programs,
}) {
  const [editing, setEditing] =
    useState(false);

  const assignedProgramIds =
    Array.isArray(item.program_ids)
      ? item.program_ids
      : [];

  const category =
    categories.find(
      (categoryItem) =>
        categoryItem.id ===
        item.category_id
    );

  const assignedMoodIds =
    Array.isArray(
      item.mood_ids
    )
      ? item.mood_ids
      : [];

  async function handleSaveMedia(formData) {
    await updateMedia(formData);
    setEditing(false);
  }

  async function handleDeleteMedia(formData) {
    await deleteMediaRecord(formData);
    setEditing(false);
  }

  async function handleUpdatePrograms(formData) {
    await updateMediaPrograms(formData);
    setEditing(false);
  }

  return (
    <article className="overflow-hidden rounded-xl border border-[#dfe5dc] bg-white shadow-sm transition hover:shadow-md">
      {/* SUMMARY */}

      <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* THUMBNAIL */}

        <div className="relative aspect-video bg-gradient-to-br from-sky-100 via-emerald-50 to-slate-100 lg:aspect-auto lg:min-h-[150px]">
          {item.signed_thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                item.signed_thumbnail_url
              }
              alt={`${item.title} thumbnail`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[150px] flex-col items-center justify-center text-[#6c8178]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#163d34] shadow-sm">
                ▶
              </span>

              <span className="mt-2 text-xs font-semibold">
                MindSettle Media
              </span>
            </div>
          )}

          {item.is_featured && (
            <span className="absolute left-3 top-3 rounded-full bg-[#12372f]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow backdrop-blur">
              ★ Hero
            </span>
          )}
        </div>

        {/* DETAILS */}

        <div className="p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-[#163d34]">
                {item.title}
              </h3>

              <p className="mt-1 text-sm font-medium text-[#5a6d66]">
                {item.instructor ||
                  "MindSettle"}

                {item.duration_minutes
                  ? ` • ${item.duration_minutes} min`
                  : ""}
              </p>

              {item.description && (
                <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-[#5a6d66]">
                  {
                    item.description
                  }
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <StatusBadge
                active={
                  item.is_published
                }
                activeLabel="Published"
                inactiveLabel="Hidden"
              />

              {item.is_featured && (
                <SmallBadge>
                  Hero
                </SmallBadge>
              )}

              {item.show_on_homepage && (
                <SmallBadge>
                  Homepage
                </SmallBadge>
              )}

              {item.is_premium && (
                <SmallBadge>
                  Premium
                </SmallBadge>
              )}
            </div>
          </div>

          {/* CATEGORY + MOODS */}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {category && (
              <span className="rounded-full bg-[#eef3e8] px-3 py-1 text-xs font-semibold text-[#344d5a]">
                {category.name}
              </span>
            )}

            {moods
              .filter(
                (mood) =>
                  assignedMoodIds.includes(
                    mood.id
                  )
              )
              .map((mood) => (
                <span
                  key={
                    mood.id
                  }
                  className="rounded-full bg-[#eef3e8] px-3 py-1 text-xs font-semibold text-[#163d34]"
                >
                  {mood.emoji}{" "}
                  {mood.name}
                </span>
              ))}

            {programs
              .filter((program) =>
                assignedProgramIds.includes(
                  program.id
                )
              )
              .map((program) => (
                <span
                  key={program.id}
                  className="rounded-full bg-[#eef1ed] px-3 py-1 text-xs font-semibold text-[#344d5a]"
                >
                  Program:{" "}
                  {program.title}
                </span>
              ))}
          </div>

          {/* ACTIONS */}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setEditing(
                  (current) =>
                    !current
                )
              }
              className="rounded-lg border border-[#cfd8cb] bg-white px-4 py-2 text-sm font-semibold text-[#163d34] transition hover:bg-[#eef3e8]"
            >
              {editing
                ? "Close editor"
                : "Edit media"}
            </button>

            {item.signed_video_url && (
              <a
                href={
                  item.signed_video_url
                }
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-[#dfe5dc] bg-white px-4 py-2 text-sm font-semibold text-[#5a6d66] transition hover:bg-[#f5f5ed] hover:text-[#163d34]"
              >
                Preview
              </a>
            )}
          </div>
        </div>
      </div>

      {/* EDITOR */}

      {editing && (
        <div className="border-t border-[#dfe5dc] bg-[#f5f5ed]/80 p-5 sm:p-6">
          <form
            action={handleSaveMedia}
          >
            <input
              type="hidden"
              name="id"
              value={item.id}
            />

            <div className="grid gap-5 md:grid-cols-2">
              {/* TITLE */}

              <FormField
                label="Title"
                htmlFor={`title-${item.id}`}
              >
                <input
                  id={`title-${item.id}`}
                  name="title"
                  required
                  defaultValue={
                    item.title || ""
                  }
                  className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                />
              </FormField>

              {/* INSTRUCTOR */}

              <FormField
                label="Instructor"
                htmlFor={`instructor-${item.id}`}
              >
                <input
                  id={`instructor-${item.id}`}
                  name="instructor"
                  defaultValue={
                    item.instructor ||
                    "MindSettle"
                  }
                  className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                />
              </FormField>

              {/* CATEGORY */}

              <FormField
                label="Category"
                htmlFor={`category-${item.id}`}
              >
                <select
                  id={`category-${item.id}`}
                  name="categoryId"
                  defaultValue={
                    item.category_id ||
                    ""
                  }
                  className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                >
                  <option value="">
                    No category
                  </option>

                  {categories.map(
                    (
                      categoryItem
                    ) => (
                      <option
                        key={
                          categoryItem.id
                        }
                        value={
                          categoryItem.id
                        }
                      >
                        {
                          categoryItem.name
                        }
                      </option>
                    )
                  )}
                </select>
              </FormField>

              {/* DURATION */}

              <FormField
                label="Duration (minutes)"
                htmlFor={`duration-${item.id}`}
              >
                <input
                  id={`duration-${item.id}`}
                  name="durationMinutes"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={
                    item.duration_minutes ||
                    1
                  }
                  className="w-full rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#163d34] outline-none transition focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                />
              </FormField>
            </div>

            {/* DESCRIPTION */}

            <div className="mt-5">
              <FormField
                label="Description"
                htmlFor={`description-${item.id}`}
              >
                <textarea
                  id={`description-${item.id}`}
                  name="description"
                  rows={4}
                  defaultValue={
                    item.description ||
                    ""
                  }
                  className="w-full resize-y rounded-lg border border-[#dfe5dc] bg-white px-4 py-3 text-sm leading-6 text-[#163d34] outline-none transition focus:border-[#78906f] focus:ring-2 focus:ring-[#dce8ca]"
                />
              </FormField>
            </div>

            {/* MOODS */}

            <div className="mt-7">
              <div>
                <h4 className="text-sm font-bold text-[#163d34]">
                  Mood assignment
                </h4>

                <p className="mt-1 text-xs leading-5 text-[#6c8178]">
                  Choose every mood
                  where this media
                  should appear.
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {moods.map(
                  (mood) => (
                    <label
                      key={
                        mood.id
                      }
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dfe5dc] bg-white p-3 transition hover:border-[#9bb98a] hover:bg-[#eef3e8]"
                    >
                      <input
                        type="checkbox"
                        name="moodIds"
                        value={
                          mood.id
                        }
                        defaultChecked={assignedMoodIds.includes(
                          mood.id
                        )}
                        className="h-4 w-4 accent-[#163d34]"
                      />

                      <span className="flex min-w-0 items-center gap-2">
                        <span>
                          {
                            mood.emoji
                          }
                        </span>

                        <span className="truncate text-sm font-semibold text-[#4b615b]">
                          {
                            mood.name
                          }
                        </span>
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* PLACEMENT */}

            <div className="mt-7 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-[#dfe5dc] bg-white p-5">
                <h4 className="text-sm font-bold text-[#163d34]">
                  Placement
                </h4>

                <p className="mt-1 text-xs leading-5 text-[#6c8178]">
                  Choose special
                  locations where this
                  media should appear.
                </p>

                <div className="mt-4 space-y-3">
                  <ToggleField
                    name="isFeatured"
                    defaultChecked={
                      Boolean(
                        item.is_featured
                      )
                    }
                    label="Featured / Hero"
                    description="Allow this media to appear in a featured hero position."
                  />

                  <ToggleField
                    name="showOnHomepage"
                    defaultChecked={
                      Boolean(
                        item.show_on_homepage
                      )
                    }
                    label="Homepage"
                    description="Allow this media to appear on the public MindSettle homepage."
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#dfe5dc] bg-white p-5">
                <h4 className="text-sm font-bold text-[#163d34]">
                  Access & status
                </h4>

                <p className="mt-1 text-xs leading-5 text-[#6c8178]">
                  Control whether
                  users can see and
                  access this media.
                </p>

                <div className="mt-4 space-y-3">
                  <ToggleField
                    name="isPublished"
                    defaultChecked={
                      Boolean(
                        item.is_published
                      )
                    }
                    label="Published"
                    description="Published media can be shown to users."
                  />

                  <ToggleField
                    name="isPremium"
                    defaultChecked={
                      Boolean(
                        item.is_premium
                      )
                    }
                    label="Premium / subscriber content"
                    description="Mark this media as protected subscription content."
                  />
                </div>
              </div>
            </div>

            {/* SAVE / DELETE */}

            <div className="mt-7 flex flex-col gap-3 border-t border-[#dfe5dc] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                className="rounded-lg bg-[#163d34] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12372f]"
              >
                Save changes
              </button>

              <button
                type="submit"
                formAction={
                  handleDeleteMedia
                }
                className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Delete media permanently
              </button>
            </div>
          </form>

          {/* PROGRAM ASSIGNMENT
              Kept separate from Save changes so the
              working media + mood update flow stays isolated. */}

          <form
            action={handleUpdatePrograms}
            className="mt-7 rounded-xl border border-[#dfe5dc] bg-white p-5"
          >
            <input
              type="hidden"
              name="videoId"
              value={item.id}
            />

            <div>
              <h4 className="text-sm font-bold text-[#163d34]">
                Program assignment
              </h4>

              <p className="mt-1 text-xs leading-5 text-[#6c8178]">
                Choose which Admin-created programs should
                contain this media. Updating this section
                does not delete the media itself.
              </p>
            </div>

            {programs.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {programs.map(
                  (program) => (
                    <label
                      key={program.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#dfe5dc] bg-[#f5f5ed] p-3 transition hover:border-[#9bb98a] hover:bg-[#eef1ed]"
                    >
                      <input
                        type="checkbox"
                        name="programIds"
                        value={program.id}
                        defaultChecked={assignedProgramIds.includes(
                          program.id
                        )}
                        className="mt-1 h-4 w-4 accent-[#344d5a]"
                      />

                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-[#29383e]">
                          {program.title}
                        </span>

                        <span className="mt-0.5 block text-xs text-[#6c8178]">
                          {program.is_published
                            ? "Published program"
                            : "Hidden program"}
                        </span>
                      </span>
                    </label>
                  )
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-[#cfd8cb] bg-[#f5f5ed] px-5 py-7 text-center">
                <p className="text-sm font-semibold text-[#4b615b]">
                  No programs have been created yet.
                </p>

                <p className="mt-1 text-xs text-[#6c8178]">
                  Create a program from Admin → Programs
                  and it will automatically appear here.
                </p>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-[#344d5a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#293d46]"
              >
                Update programs
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}

/* ==========================================================
   FORM FIELD
========================================================== */

function FormField({
  label,
  htmlFor,
  children,
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-semibold text-[#4b615b]"
      >
        {label}
      </label>

      {children}
    </div>
  );
}

/* ==========================================================
   TOGGLE FIELD
========================================================== */

function ToggleField({
  name,
  label,
  description,
  defaultChecked,
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#dfe5dc] bg-[#f5f5ed] p-3 transition hover:border-[#cfd8cb] hover:bg-[#eef3e8]">
      <input
        type="checkbox"
        name={name}
        defaultChecked={
          defaultChecked
        }
        className="mt-1 h-4 w-4 accent-[#163d34]"
      />

      <span>
        <span className="block text-sm font-semibold text-[#29383e]">
          {label}
        </span>

        <span className="mt-0.5 block text-xs leading-5 text-[#6c8178]">
          {description}
        </span>
      </span>
    </label>
  );
}

/* ==========================================================
   STATUS BADGE
========================================================== */

function StatusBadge({
  active,
  activeLabel,
  inactiveLabel,
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        active
          ? "bg-[#dce8ca] text-[#163d34]"
          : "bg-[#eef1ed] text-[#6c8178]"
      }`}
    >
      {active
        ? activeLabel
        : inactiveLabel}
    </span>
  );
}

/* ==========================================================
   SMALL BADGE
========================================================== */

function SmallBadge({
  children,
}) {
  return (
    <span className="rounded-full bg-[#eef3e8] px-3 py-1 text-xs font-semibold text-[#344d5a]">
      {children}
    </span>
  );
}

/* ==========================================================
   SECTION HEADER
========================================================== */

function SectionHeader({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78906f]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#163d34]">
        {title}
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5a6d66]">
        {description}
      </p>
    </div>
  );
}

/* ==========================================================
   MAIN STAT CARD
========================================================== */

function StatCard({
  label,
  value,
  icon,
  accent,
}) {
  const iconStyle =
    accent === "emerald"
      ? "bg-[#dce8ca] text-[#163d34]"
      : "bg-[#dfe8d6] text-[#344d5a]";

  return (
    <article className="rounded-xl border border-[#dfe5dc] bg-white p-6 shadow-[0_10px_30px_rgba(18,55,47,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(18,55,47,0.11)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#5a6d66]">
            {label}
          </p>

          <p className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-[#163d34]">
            {value ?? 0}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full text-lg ${iconStyle}`}
        >
          {icon}
        </div>
      </div>
    </article>
  );
}

/* ==========================================================
   MINI STAT
========================================================== */

function MiniStat({
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-[#dfe5dc] bg-[#f5f5ed] p-4">
      <p className="text-xs font-medium text-[#6c8178]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#163d34]">
        {value ?? 0}
      </p>
    </div>
  );
}

/* ==========================================================
   RANKED MEDIA LIST
========================================================== */

function RankedVideoList({
  title,
  description,
  items,
  countKey,
  emptyLabel,
  icon,
}) {
  return (
    <article className="rounded-[22px] border border-[#dfe5dc] bg-[#fffdfa] p-6 shadow-[0_10px_30px_rgba(18,55,47,0.06)]">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#dfe8d6] text-lg text-[#344d5a]">
          {icon}
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#163d34]">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-[#5a6d66]">
            {description}
          </p>
        </div>
      </div>

      {!items?.length ? (
        <div className="mt-6 rounded-lg bg-[#f5f5ed] px-4 py-8 text-center">
          <p className="text-sm text-[#6c8178]">
            {emptyLabel}
          </p>
        </div>
      ) : (
        <ol className="mt-6 space-y-3">
          {items.map(
            (video, index) => (
              <li
                key={
                  video.video_id
                }
                className="flex items-center justify-between gap-4 rounded-lg border border-[#e4e8df] bg-[#f5f5ed] px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dce8ca] text-xs font-bold text-[#163d34]">
                    {index + 1}
                  </div>

                  <span className="truncate text-sm font-medium text-[#4b615b]">
                    {video.title}
                  </span>
                </div>

                <span className="shrink-0 rounded-full bg-[#dfe8d6] px-3 py-1 text-xs font-semibold text-[#344d5a]">
                  {video[countKey]}
                </span>
              </li>
            )
          )}
        </ol>
      )}
    </article>
  );
}
