"use client";

import { useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  // Video
  "video/mp4",
  "video/webm",
  "video/quicktime",

  // Audio
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",

  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function getMediaType(file) {
  if (file.type.startsWith("video/")) {
    return "video";
  }

  if (file.type.startsWith("audio/")) {
    return "audio";
  }

  if (file.type.startsWith("image/")) {
    return "image";
  }

  return "unknown";
}

export default function TestUploadPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    setMessage("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setFile(null);
      event.target.value = "";

      setMessage(
        "Unsupported file type. Choose a supported video, audio, or image file."
      );

      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      event.target.value = "";

      setMessage(
        "This standard test upload currently supports files up to 10 MB. Larger media files will require resumable upload."
      );

      return;
    }

    const mediaType = getMediaType(selectedFile);
    const sizeInMB = (
      selectedFile.size /
      (1024 * 1024)
    ).toFixed(2);

    setFile(selectedFile);

    setMessage(
      `Selected ${mediaType}: ${selectedFile.name} (${sizeInMB} MB)`
    );
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!file) {
      setMessage(
        "Please choose a valid video, audio, or image file first."
      );
      return;
    }

    setUploading(true);
    setMessage("Uploading...");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          result.error || "Media upload failed."
        );
      }

      setMessage(
        `Upload successful: ${result.data.upload.path}`
      );

      setFile(null);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Media upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "600px",
      }}
    >
      <h1>Test Media Upload</h1>

      <p>
        Supported media: video, audio, and images.
      </p>

      <p>
        Current standard upload limit: 10 MB.
      </p>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept={[
            ".mp4",
            ".webm",
            ".mov",
            ".mp3",
            ".m4a",
            ".wav",
            ".ogg",
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".gif",
            "video/*",
            "audio/*",
            "image/*",
          ].join(",")}
          onChange={handleFileChange}
          disabled={uploading}
        />

        <br />
        <br />

        <button
          type="submit"
          disabled={uploading || !file}
        >
          {uploading
            ? "Uploading..."
            : "Upload Media"}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "20px" }}>
          {message}
        </p>
      )}
    </main>
  );
}