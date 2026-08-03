const CONTACT_DETAILS = [
  {
    icon: "◉",
    text: "Sydney, NSW, Australia",
  },
  {
    icon: "✉",
    text: "hello@mindsettle.com",
  },
  {
    icon: "☎",
    text: "+61 2 0000 0000",
  },
  {
    icon: "◷",
    text: "Mon–Fri 9am–5pm AEST",
  },
];

const SOCIALS = ["LinkedIn", "Instagram", "Facebook", "Twitter"];

export default function ContactPage() {
  return (
    <main className="pt-24">
      <section className="bg-gradient-to-r from-sky-50 via-white to-emerald-50">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Get in Touch
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            We would love to hear from you.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
          <form className="rounded-2xl bg-slate-50 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">
              Send Us a Message
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="organisation"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Organisation / Hospital
                </label>

                <input
                  id="organisation"
                  name="organisation"
                  type="text"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Your Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Send Message
            </button>
          </form>

          <div className="space-y-6">
            <section className="rounded-2xl border-t-4 border-emerald-500 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-950">
                Contact Information
              </h2>

              <div className="mt-6 space-y-5">
                {CONTACT_DETAILS.map((item) => (
                  <div key={item.text} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      {item.icon}
                    </div>

                    <span className="text-sm text-slate-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Follow Us</h2>

              <div className="mt-5 flex flex-wrap gap-3">
                {SOCIALS.map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-200"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </section>

            <div className="flex min-h-64 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400">
              Map — Sydney, NSW
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}