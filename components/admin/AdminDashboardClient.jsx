"use client";

import { useState } from "react";
import Link from "next/link";
import MediaUploader from "@/components/admin/MediaUploader";

import {
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/app/admin/actions";

export default function AdminDashboardClient({
  stats,
  categories,
  categoryError,
}) {
  const [activeSection, setActiveSection] =
    useState("overview");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const {
    total_users,
    total_videos,
    subscriptions_by_status,
    most_watched_videos,
    most_favourited_videos,
    user_growth,
  } = stats;

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">

      {/* MOBILE HEADER */}

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-sky-100 bg-white/95 px-5 shadow-sm backdrop-blur lg:hidden">
        <div>
          <p className="text-base font-bold text-slate-950">
            mindsettle
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

            <div>
              <p className="text-xl font-bold tracking-tight text-slate-950">
                mindsettle
              </p>

              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Administration
              </p>
            </div>

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
              href="/"
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
                href="/"
                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700"
              >
                Back to site
              </Link>

            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">

            {/* OVERVIEW */}

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
                    value={total_users}
                    icon="◇"
                    accent="sky"
                  />

                  <StatCard
                    label="Media items"
                    value={total_videos}
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
                        Current subscription
                        status across registered
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
                        New users registered
                        during the last 30 days.
                      </p>
                    </div>

                    <div className="mt-5 max-h-64 overflow-y-auto pr-2">

                      {user_growth?.length ? (
                        <table className="w-full text-sm">

                          <tbody>
                            {user_growth.map(
                              (day) => (
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
                                      undefined,
                                      {
                                        month:
                                          "short",
                                        day: "numeric",
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
                          No user growth data
                          yet.
                        </p>
                      )}

                    </div>
                  </article>

                </div>
              </section>
            )}

            {/* ANALYTICS */}

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

            {/* MEDIA MANAGEMENT */}

            {activeSection ===
              "media" && (
              <section>

                <SectionHeader
                  eyebrow="Content"
                  title="Media Management"
                  description="Upload and prepare videos, audio and images for the MindSettle library."
                />

                <div className="overflow-hidden rounded-xl border border-sky-100 bg-white shadow-md">
                  <MediaUploader />
                </div>

              </section>
            )}

            {/* CATEGORIES */}

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
                      Add a new category to
                      organise media in the
                      user library.
                    </p>
                  </div>

                  <form
                    action={addCategory}
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
                      Existing Categories
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      Update category names or
                      remove categories that
                      are no longer required.
                    </p>

                    <div className="mt-5 space-y-3">

                      {categories.length ===
                      0 ? (
                        <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/50 px-6 py-12 text-center">

                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                            ▦
                          </div>

                          <p className="mt-4 text-sm font-medium text-slate-700">
                            No categories yet
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Create the first
                            category using the
                            form above.
                          </p>

                        </div>
                      ) : (
                        categories.map(
                          (category) => (
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

/* --------------------------------------------------
   SECTION HEADER
-------------------------------------------------- */

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

/* --------------------------------------------------
   MAIN STAT CARD
-------------------------------------------------- */

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

/* --------------------------------------------------
   SMALL STAT CARD
-------------------------------------------------- */

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

/* --------------------------------------------------
   RANKED MEDIA LIST
-------------------------------------------------- */

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