import "./globals.css";

export const metadata = {
  title: { default: "Mindsettle — Calm for healthcare spaces", template: "%s | Mindsettle" },
  description: "Mindsettle calms patients in clinical settings through tranquil natural imagery and curated soothing music.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
