"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");

    if (!email.trim() || !password) {
      setMessage("Please enter your email address and password.");
      return;
    }

    setLoggingIn(true);
    setMessage("Signing in...");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessage("Login successful. Opening media management...");

      router.push("/admin/media");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Admin login failed."
      );
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "linear-gradient(135deg, #06243a 0%, #006b67 100%)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "40px",
          borderRadius: "20px",
          background: "#ffffff",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <p
            style={{
              margin: "0 0 10px",
              color: "#008b72",
              fontWeight: "700",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            MindSettle Administration
          </p>

          <h1
            style={{
              margin: "0 0 10px",
              color: "#071126",
              fontSize: "34px",
            }}
          >
            Admin Login
          </h1>

          <p
            style={{
              margin: 0,
              color: "#52627a",
              lineHeight: 1.6,
            }}
          >
            Sign in to upload and manage MindSettle media.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#26344b",
              fontWeight: "700",
            }}
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            disabled={loggingIn}
            placeholder="admin@example.com"
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginBottom: "20px",
              padding: "14px 16px",
              border: "1px solid #bfd0e5",
              borderRadius: "10px",
              fontSize: "16px",
            }}
          />

          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#26344b",
              fontWeight: "700",
            }}
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            disabled={loggingIn}
            placeholder="Enter your password"
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginBottom: "24px",
              padding: "14px 16px",
              border: "1px solid #bfd0e5",
              borderRadius: "10px",
              fontSize: "16px",
            }}
          />

          <button
            type="submit"
            disabled={loggingIn}
            style={{
              width: "100%",
              padding: "15px",
              border: "none",
              borderRadius: "10px",
              background:
                "linear-gradient(90deg, #078fd4 0%, #00a574 100%)",
              color: "#ffffff",
              fontSize: "17px",
              fontWeight: "700",
              cursor: loggingIn ? "not-allowed" : "pointer",
              opacity: loggingIn ? 0.7 : 1,
            }}
          >
            {loggingIn ? "Signing in..." : "Admin Login"}
          </button>
        </form>

        {message && (
          <p
            role="status"
            style={{
              marginTop: "20px",
              padding: "12px",
              borderRadius: "8px",
              background: "#eef7f6",
              color: "#164d48",
              textAlign: "center",
            }}
          >
            {message}
          </p>
        )}

        <p
          style={{
            marginTop: "24px",
            marginBottom: 0,
            textAlign: "center",
          }}
        >
          <Link
            href="/login"
            style={{
              color: "#087cac",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Return to regular login
          </Link>
        </p>
      </section>
    </main>
  );
}