"use client";

import { useMemo, useState } from "react";

const CONTENT = [
  {
    title: "Ocean Sunrise",
    duration: "3:45",
    type: "HD",
    category: "Ocean",
  },
  {
    title: "Forest Rain",
    duration: "5:12",
    type: "Calming",
    category: "Ocean",
  },
  {
    title: "Mountain Calm",
    duration: "4:30",
    type: "Calming",
    category: "Mountains",
  },
  {
    title: "Gentle Stream",
    duration: "6:15",
    type: "HD",
    category: "Forest",
  },
  {
    title: "Night Sky",
    duration: "4:45",
    type: "HD",
    category: "Relaxation",
  },
  {
    title: "Desert Wind",
    duration: "4:35",
    type: "HD",
    category: "Relaxation",
  },
  {
    title: "Rainforest",
    duration: "3:45",
    type: "HD",
    category: "Forest",
  },
  {
    title: "River Flow",
    duration: "4:30",
    type: "HD",
    category: "Forest",
  },
  {
    title: "Coastal Breeze",
    duration: "5:20",
    type: "HD",
    category: "Ocean",
  },
  {
    title: "Autumn Leaves",
    duration: "4:10",
    type: "Calming",
    category: "Nature Sounds",
  },
  {
    title: "Morning Mist",
    duration: "3:55",
    type: "HD",
    category: "Nature Sounds",
  },
  {
    title: "Meadow Birds",
    duration: "4:45",
    type: "HD",
    category: "Nature Sounds",
  },
];

const CATEGORIES = [
  "All",
  "Ocean",
  "Forest",
  "Nature Sounds",
  "Relaxation",
  "Mountains",
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredContent = useMemo(() => {
    return CONTENT.filter((item) => {
      const matchesCategory =
        category === "All" || item.category === category;

      const matchesSearch = item.title
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <main className="pt-24">
      <section className="bg-gradient-to-r from-sky-50 via-white to-emerald-50">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Explore Mindsettle
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Browse our calming content library.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <input
              type="search"
              placeholder="Search content..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 lg:max-w-lg"
            />

            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
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
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredContent.map((item) => (
              <article
                key={item.title}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative flex min-h-44 items-center justify-center bg-slate-100 text-sm text-slate-400">
                  <span className="absolute left-3 top-3 rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white">
                    {item.category}
                  </span>

                  {item.title}
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-semibold text-slate-950">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-600">
                    {item.duration} | {item.type} | {item.category}
                  </p>

                  <button
                    type="button"
                    className="mt-4 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
                  >
                    + Add
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredContent.length === 0 && (
            <div className="mt-10 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-600">
              No content matched your search.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}