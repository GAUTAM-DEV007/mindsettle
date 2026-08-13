"use client";

import { useState } from "react";
import Link from "next/link";

import MediaUploader from "@/components/admin/MediaUploader";

import {
  addCategory,
  updateCategory,
  deleteCategory,
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

export default function AdminDashboardClient({
  stats,
  categories = [],
  moods = [],
  media = [],
  programs = [],
  categoryError = null,
  mediaError = null,
  programError = null,
}) {
  const [activeSection, setActiveSection] =
    useState(
      mediaError
        ? "media"
        : programError
          ? "programs"
          : categoryError
            ? "categories"
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
      id: "categories",
      label: "Categories",
      icon: "▦",
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
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* MOBILE HEADER */}

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-sky-100 bg-white/95 px-5 shadow-sm backdrop-blur lg:hidden">
        <div>
          <p className="text-base font-bold text-slate-950">
            MindSettle
          </p>

          <p className="text-xs font-medium text-emerald-600">
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
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-xl text-white shadow-sm transition hover:bg-emerald-700"
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
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sky-100 bg-white shadow-xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          {/* BRAND */}

          <div className="flex h-24 items-center justify-between border-b border-sky-100 px-6">
            <Link
              href="/admin"
              className="flex items-center gap-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="MindSettle"
                className="h-10 w-10 object-contain"
              />

              <div>
                <p className="text-lg font-bold tracking-tight text-slate-950">
                  MindSettle
                </p>

                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  Administration
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 lg:hidden"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          {/* NAVIGATION */}

          <nav className="flex-1 px-4 py-7">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
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
                          ? "bg-emerald-600 text-white shadow-md"
                          : "text-slate-600 hover:bg-sky-50 hover:text-slate-950"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          active
                            ? "bg-white/15 text-white"
                            : "bg-sky-100 text-sky-700"
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

          <div className="border-t border-sky-100 p-4">
            <Link
              href="/library"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-slate-950"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                ←
              </span>

              Back to site
            </Link>
          </div>
        </aside>

        {/* MAIN CONTENT */}

        <main className="min-w-0 flex-1">
          {/* DESKTOP TOP BAR */}

          <div className="hidden border-b border-sky-100 bg-white lg:block">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-10 py-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
                  MindSettle Administration
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  {currentSection}
                </h1>
              </div>

              <Link
                href="/library"
                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700"
              >
                Back to site
              </Link>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
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

                  <article className="rounded-xl border border-sky-100 bg-white p-6 shadow-md">
                    <div>
                      <h3 className="text-xl font-bold text-slate-950">
                        Subscriptions
                      </h3>

                      <p className="mt-2 text-sm text-slate-600">
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

                  <article className="rounded-xl border border-sky-100 bg-white p-6 shadow-md">
                    <div>
                      <h3 className="text-xl font-bold text-slate-950">
                        User Growth
                      </h3>

                      <p className="mt-2 text-sm text-slate-600">
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
                                  className="border-b border-slate-100 last:border-0"
                                >
                                  <td className="py-2.5 text-slate-600">
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

                                  <td className="py-2.5 text-right font-semibold text-slate-950">
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
                        <p className="text-sm text-slate-500">
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

                <div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
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
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
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
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                    }`}
                  >
                    Upload Media
                  </button>
                </div>

                {/* UPLOAD */}

                {mediaView ===
                  "upload" && (
                  <div className="overflow-hidden rounded-xl border border-sky-100 bg-white shadow-md">
                    <MediaUploader />
                  </div>
                )}

                {/* MANAGE */}

                {mediaView ===
                  "manage" && (
                  <div className="space-y-6">
                    {/* SEARCH + SUMMARY */}

                    <div className="flex flex-col gap-4 rounded-xl border border-sky-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          Media Library
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
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
                          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
                          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </div>
                    </div>

                    {filteredMedia.length ===
                    0 ? (
                      <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/40 px-6 py-14 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          ▶
                        </div>

                        <h3 className="mt-4 text-base font-bold text-slate-950">
                          {media.length ===
                          0
                            ? "No media uploaded yet"
                            : "No matching media"}
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
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
                            className="mt-5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
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

                <article className="rounded-xl border border-sky-100 bg-white p-6 shadow-md">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      Add Program
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Create a program first, then add and order media inside it.
                    </p>
                  </div>

                  <form
                    action={addProgram}
                    className="mt-6 grid gap-4 border-b border-slate-100 pb-7 lg:grid-cols-2"
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
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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
                          className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </FormField>
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <input
                          type="checkbox"
                          name="isPublished"
                          defaultChecked
                          className="mt-1 h-4 w-4 accent-emerald-600"
                        />

                        <span>
                          <span className="block text-sm font-semibold text-slate-800">
                            Published
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-500">
                            Make the program available to users.
                          </span>
                        </span>
                      </label>

                      <button
                        type="submit"
                        className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        Add Program
                      </button>
                    </div>
                  </form>

                  <div className="mt-7">
                    <h3 className="text-lg font-bold text-slate-950">
                      Existing Programs
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Edit program details, add or remove media, and control the session order.
                    </p>
                  </div>
                </article>

                <div className="mt-6 space-y-5">
                  {programs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/40 px-6 py-14 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        ▤
                      </div>
                      <h3 className="mt-4 text-base font-bold text-slate-950">
                        No programs yet
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
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

            {/* ======================================================
                CATEGORIES
            ====================================================== */}

            {activeSection ===
              "categories" && (
              <section>
                <SectionHeader
                  eyebrow="Organisation"
                  title="Categories"
                  description="Create and manage categories used to organise MindSettle content."
                />

                <article className="rounded-xl border border-sky-100 bg-white p-6 shadow-md">
                  {categoryError && (
                    <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {categoryError}
                    </p>
                  )}

                  {/* ADD CATEGORY */}

                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                      Add Category
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      Add a new
                      category to
                      organise media
                      in the user
                      library.
                    </p>
                  </div>

                  <form
                    action={
                      addCategory
                    }
                    className="mt-6 grid gap-4 border-b border-slate-100 pb-8 sm:grid-cols-[1fr_1fr_auto]"
                  >
                    <div>
                      <label
                        htmlFor="new-name"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Name
                      </label>

                      <input
                        id="new-name"
                        name="name"
                        required
                        placeholder="e.g. Meditation"
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="new-slug"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Slug
                      </label>

                      <input
                        id="new-slug"
                        name="slug"
                        required
                        placeholder="e.g. meditation"
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
                      >
                        Add Category
                      </button>
                    </div>
                  </form>

                  {/* EXISTING CATEGORIES */}

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-950">
                      Existing
                      Categories
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      Update category
                      names or remove
                      categories that
                      are no longer
                      required.
                    </p>

                    <div className="mt-5 space-y-3">
                      {categories.length ===
                      0 ? (
                        <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/50 px-6 py-12 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                            ▦
                          </div>

                          <p className="mt-4 text-sm font-medium text-slate-700">
                            No categories
                            yet
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Create the
                            first category
                            using the form
                            above.
                          </p>
                        </div>
                      ) : (
                        categories.map(
                          (
                            category
                          ) => (
                            <form
                              key={
                                category.id
                              }
                              action={
                                updateCategory
                              }
                              className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto_auto]"
                            >
                              <input
                                type="hidden"
                                name="id"
                                value={
                                  category.id
                                }
                              />

                              <input
                                name="name"
                                defaultValue={
                                  category.name
                                }
                                required
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-emerald-500"
                              />

                              <input
                                name="slug"
                                defaultValue={
                                  category.slug
                                }
                                required
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-emerald-500"
                              />

                              <button
                                type="submit"
                                className="rounded-lg border border-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                              >
                                Save
                              </button>

                              <button
                                type="submit"
                                formAction={
                                  deleteCategory
                                }
                                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </form>
                          )
                        )
                      )}
                    </div>
                  </div>
                </article>
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
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-slate-950">
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

            <p className="mt-1 text-xs font-semibold text-slate-400">
              /programs/{program.slug}
            </p>

            {program.description && (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                {program.description}
              </p>
            )}

            <p className="mt-3 text-sm font-semibold text-emerald-700">
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
            className="shrink-0 rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
          >
            {editing
              ? "Close editor"
              : "Edit program"}
          </button>
        </div>
      </div>

      {editing && (
        <div className="border-t border-slate-200 bg-slate-50/80 p-5 sm:p-6">
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
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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
                  className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </FormField>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={
                    Boolean(
                      program.is_published
                    )
                  }
                  className="h-4 w-4 accent-emerald-600"
                />
                Published
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
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

      <div className="border-t border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-950">
              Program sessions
            </h4>
            <p className="mt-1 text-sm text-slate-600">
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
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 sm:w-64"
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
                className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                + Add
              </button>
            </form>
          )}
        </div>

        {programVideos.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
            No media has been added to this program yet.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {programVideos.map(
              (video, index) => (
                <div
                  key={video.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
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
                      <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-500">
                        ▶
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {video.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
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
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
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
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
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
}) {
  const [editing, setEditing] =
    useState(false);

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

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
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
            <div className="flex h-full min-h-[150px] flex-col items-center justify-center text-slate-500">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                ▶
              </span>

              <span className="mt-2 text-xs font-semibold">
                MindSettle Media
              </span>
            </div>
          )}

          {item.is_featured && (
            <span className="absolute left-3 top-3 rounded-full bg-emerald-700/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow backdrop-blur">
              ★ Hero
            </span>
          )}
        </div>

        {/* DETAILS */}

        <div className="p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-950">
                {item.title}
              </h3>

              <p className="mt-1 text-sm font-medium text-slate-600">
                {item.instructor ||
                  "MindSettle"}

                {item.duration_minutes
                  ? ` • ${item.duration_minutes} min`
                  : ""}
              </p>

              {item.description && (
                <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-600">
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
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
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
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                >
                  {mood.emoji}{" "}
                  {mood.name}
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
              className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
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
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                Preview
              </a>
            )}
          </div>
        </div>
      </div>

      {/* EDITOR */}

      {editing && (
        <div className="border-t border-slate-200 bg-slate-50/80 p-5 sm:p-6">
          <form
            action={updateMedia}
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
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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
                  className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </FormField>
            </div>

            {/* MOODS */}

            <div className="mt-7">
              <div>
                <h4 className="text-sm font-bold text-slate-950">
                  Mood assignment
                </h4>

                <p className="mt-1 text-xs leading-5 text-slate-500">
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
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-emerald-300 hover:bg-emerald-50"
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
                        className="h-4 w-4 accent-emerald-600"
                      />

                      <span className="flex min-w-0 items-center gap-2">
                        <span>
                          {
                            mood.emoji
                          }
                        </span>

                        <span className="truncate text-sm font-semibold text-slate-700">
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
              <div className="rounded-xl border border-sky-100 bg-white p-5">
                <h4 className="text-sm font-bold text-slate-950">
                  Placement
                </h4>

                <p className="mt-1 text-xs leading-5 text-slate-500">
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

              <div className="rounded-xl border border-emerald-100 bg-white p-5">
                <h4 className="text-sm font-bold text-slate-950">
                  Access & status
                </h4>

                <p className="mt-1 text-xs leading-5 text-slate-500">
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

            <div className="mt-7 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Save changes
              </button>

              <button
                type="submit"
                formAction={
                  deleteMediaRecord
                }
                className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Delete media permanently
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
        className="mb-2 block text-sm font-semibold text-slate-700"
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
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50">
      <input
        type="checkbox"
        name={name}
        defaultChecked={
          defaultChecked
        }
        className="mt-1 h-4 w-4 accent-emerald-600"
      />

      <span>
        <span className="block text-sm font-semibold text-slate-800">
          {label}
        </span>

        <span className="mt-0.5 block text-xs leading-5 text-slate-500">
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
          ? "bg-emerald-100 text-emerald-800"
          : "bg-slate-100 text-slate-500"
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
    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
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
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        {title}
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
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
      ? "bg-emerald-100 text-emerald-700"
      : "bg-sky-100 text-sky-700";

  return (
    <article className="rounded-xl border border-sky-100 bg-white p-6 shadow-md transition hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">
            {label}
          </p>

          <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
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
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-950">
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
    <article className="rounded-xl border border-sky-100 bg-white p-6 shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-lg text-sky-700">
          {icon}
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-950">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
      </div>

      {!items?.length ? (
        <div className="mt-6 rounded-lg bg-slate-50 px-4 py-8 text-center">
          <p className="text-sm text-slate-500">
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
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {index + 1}
                  </div>

                  <span className="truncate text-sm font-medium text-slate-700">
                    {video.title}
                  </span>
                </div>

                <span className="shrink-0 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
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