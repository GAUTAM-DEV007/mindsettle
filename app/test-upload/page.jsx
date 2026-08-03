"use client";

import { useRef, useState } from "react";
import * as tus from "tus-js-client";
import { createClient } from "@/lib/supabase/client";

const STORAGE_BUCKET = "videos";
const CHUNK_SIZE = 6 * 1024 * 1024;
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;

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

function createSafeFileName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-");
}

function createFallbackTitle(fileName) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

function getDirectStorageUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not configured."
    );
  }

  const url = new URL(supabaseUrl);
  const projectId = url.hostname.split(".")[0];

  if (!projectId) {
    throw new Error(
      "Could not determine the Supabase project ID."
    );
  }

  return `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`;
}

export default function TestUploadPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadRef = useRef(null);
const fileInputRef = useRef(null);
const [supabase] = useState(() => createClient());

  function resetFileInput() {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    setMessage("");
    setProgress(0);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      resetFileInput();

      setMessage(
        "Unsupported file type. Choose a supported video, audio, or image file."
      );

      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      resetFileInput();

      setMessage(
        "The selected file is larger than the current 5 GB test limit."
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

  async function saveMediaMetadata({
    selectedFile,
    storagePath,
  }) {
    const response = await fetch("/api/media/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: createFallbackTitle(selectedFile.name),
        description: "",
        instructor: "MindSettle",
        storagePath,
        contentType: selectedFile.type,
      }),
    });

    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error(
        "The server returned an invalid response while saving media information."
      );
    }

    if (!response.ok) {
      throw new Error(
        result.error ||
          "The file uploaded, but the media record could not be saved."
      );
    }

    return result;
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
    setProgress(0);
    setMessage("Preparing resumable upload...");

    try {

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(
          `Could not check your login session: ${sessionError.message}`
        );
      }

      if (!session?.access_token) {
        throw new Error(
          "You must be logged in before uploading media."
        );
      }

      const safeFileName = createSafeFileName(file.name);
      const uniqueFileName =
        `${crypto.randomUUID()}-${safeFileName}`;
      const storagePath = `uploads/${uniqueFileName}`;
      const uploadEndpoint = getDirectStorageUrl();
      const selectedFile = file;

      const upload = new tus.Upload(selectedFile, {
        endpoint: uploadEndpoint,

        retryDelays: [
          0,
          3000,
          5000,
          10000,
          20000,
        ],

        headers: {
          authorization:
            `Bearer ${session.access_token}`,
          "x-upsert": "false",
        },

        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        chunkSize: CHUNK_SIZE,

        metadata: {
          bucketName: STORAGE_BUCKET,
          objectName: storagePath,
          contentType:
            selectedFile.type ||
            "application/octet-stream",
          cacheControl: "3600",
        },

        onError(error) {
          console.error("TUS upload error:", error);

          uploadRef.current = null;
          setUploading(false);

          setMessage(
            error?.message ||
              "The resumable upload failed."
          );
        },

        onProgress(bytesUploaded, bytesTotal) {
          const percentage =
            bytesTotal > 0
              ? Math.round(
                  (bytesUploaded / bytesTotal) * 100
                )
              : 0;

          setProgress(percentage);
          setMessage(
            `Uploading media: ${percentage}%`
          );
        },

        async onSuccess() {
          try {
            setProgress(100);
            setMessage(
              "Upload complete. Saving media information..."
            );

            await saveMediaMetadata({
              selectedFile,
              storagePath,
            });

            setMessage(
              `Upload successful: ${storagePath}`
            );

            resetFileInput();
          } catch (error) {
            console.error(
              "Metadata completion error:",
              error
            );

            setMessage(
              error instanceof Error
                ? error.message
                : "The upload finished, but saving the media information failed."
            );
          } finally {
            uploadRef.current = null;
            setUploading(false);
          }
        },
      });

      uploadRef.current = upload;

      const previousUploads =
        await upload.findPreviousUploads();

      if (previousUploads.length > 0) {
        upload.resumeFromPreviousUpload(
          previousUploads[0]
        );

        setMessage(
          "Previous upload found. Resuming upload..."
        );
      } else {
        setMessage("Starting resumable upload...");
      }

      upload.start();
    } catch (error) {
      console.error(
        "Resumable upload setup error:",
        error
      );

      uploadRef.current = null;
      setUploading(false);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not start the resumable upload."
      );
    }
  }

  async function handleCancelUpload() {
    const activeUpload = uploadRef.current;

    if (!activeUpload) {
      return;
    }

    try {
      await activeUpload.abort(true);

      uploadRef.current = null;
      setUploading(false);
      setProgress(0);

      setMessage("Upload cancelled.");
    } catch (error) {
      console.error(
        "Upload cancellation error:",
        error
      );

      setMessage(
        error instanceof Error
          ? `Could not cancel upload: ${error.message}`
          : "Could not cancel the upload."
      );
    }
  }

  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "650px",
      }}
    >
      <h1>Test Resumable Media Upload</h1>

      <p>
        Supported media: video, audio, and images.
      </p>

      <p>
        Files are uploaded directly to Supabase
        Storage using resumable upload.
      </p>

      <form onSubmit={handleUpload}>
        <input
          ref={fileInputRef}
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

        {uploading && (
          <>
            {" "}

            <button
              type="button"
              onClick={handleCancelUpload}
            >
              Cancel Upload
            </button>
          </>
        )}
      </form>

      {uploading && (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <progress
            value={progress}
            max="100"
            style={{
              width: "100%",
              height: "22px",
            }}
          />

          <p>{progress}%</p>
        </div>
      )}

      {message && (
        <p
          style={{
            marginTop: "20px",
            overflowWrap: "anywhere",
          }}
        >
          {message}
        </p>
      )}
    </main>
  );
}