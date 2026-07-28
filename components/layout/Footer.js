export default function Footer() {
  return (
    <footer className="border-t border-neutral-200">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-neutral-500 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} mindsettle. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="/pricing" className="hover:text-neutral-800">
            Pricing
          </a>
          <a href="mailto:support@mindsettle.app" className="hover:text-neutral-800">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
