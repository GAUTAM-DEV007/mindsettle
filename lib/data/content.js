// Placeholder catalog data. Replace with Supabase queries against
// `videos` / `programs` tables once the schema is in place.

export const VIDEOS = [
  {
    id: "morning-breathwork",
    title: "10-Minute Morning Breathwork",
    instructor: "Priya Nair",
    durationMinutes: 10,
    category: "Breathwork",
    thumbnailUrl: null,
    src: null,
  },
  {
    id: "gentle-vinyasa-flow",
    title: "Gentle Vinyasa Flow",
    instructor: "Alex Rivera",
    durationMinutes: 25,
    category: "Yoga",
    thumbnailUrl: null,
    src: null,
  },
  {
    id: "deep-sleep-meditation",
    title: "Deep Sleep Meditation",
    instructor: "Priya Nair",
    durationMinutes: 20,
    category: "Meditation",
    thumbnailUrl: null,
    src: null,
  },
];

export const PROGRAMS = [
  {
    slug: "7-day-mindfulness-reset",
    title: "7-Day Mindfulness Reset",
    description: "A week of short daily practices to build a calmer baseline.",
    videoIds: ["morning-breathwork", "deep-sleep-meditation"],
  },
  {
    slug: "beginner-yoga-foundations",
    title: "Beginner Yoga Foundations",
    description: "Build strength and flexibility with a gentle, guided series.",
    videoIds: ["gentle-vinyasa-flow"],
  },
];

export function getVideoById(id) {
  return VIDEOS.find((video) => video.id === id) ?? null;
}

export function getProgramBySlug(slug) {
  return PROGRAMS.find((program) => program.slug === slug) ?? null;
}
