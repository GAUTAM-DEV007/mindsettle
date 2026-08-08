"use client";

import { useRef, useState } from "react";
import * as tus from "tus-js-client";
import { createClient } from "@/lib/supabase/client";

const STORAGE_BUCKET = "videos";
const CHUNK_SIZE = 6 * 1024 * 1024;

// Application-side target.
// The real upload limit can still be lower depending on
// the Supabase project plan and bucket configuration.
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

const ACCEPTED_EXTENSIONS = [
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
].join(",");

function getMediaType(file) {
  if (file?.type?.startsWith("video/")) {
    return "video";
  }

  if (file?.type?.startsWith("audio/")) {
    return "audio";
  }

  if (file?.type?.startsWith("image/")) {
    return "image";
  }

  return "unknown";
}

function getMediaLabel(file) {
  const mediaType = getMediaType(file);

  if (mediaType === "video") return "Video";
  if (mediaType === "audio") return "Audio";
  if (mediaType === "image") return "Image";

  return "Media";
}

function getMediaIcon(file) {
  const mediaType = getMediaType(file);

  if (mediaType === "video") return "▶";
  if (mediaType === "audio") return "♪";
  if (mediaType === "image") return "▣";

  return "↑";
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

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 MB";
  }

  const gb = 1024 * 1024 * 1024;
  const mb = 1024 * 1024;
  const kb = 1024;

  if (bytes >= gb) {
    return `${(bytes / gb).toFixed(2)} GB`;
  }

  if (bytes >= mb) {
    return `${(bytes / mb).toFixed(2)} MB`;
  }

  if (bytes >= kb) {
    return `${(bytes / kb).toFixed(2)} KB`;
  }

  return `${bytes} bytes`;
}

function getDirectStorageUrl() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

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
  const [supabase] = useState(() => createClient());

  const [file, setFile] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [instructor, setInstructor] =
    useState("MindSettle");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("info");

  const [uploading, setUploading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [uploadedBytes, setUploadedBytes] =
    useState(0);

  const [totalBytes, setTotalBytes] =
    useState(0);

  const [dragActive, setDragActive] =
    useState(false);

  const uploadRef = useRef(null);
  const fileInputRef = useRef(null);

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);
  }

  function clearMessage() {
    setMessage("");
    setMessageType("info");
  }

  function resetFileInput() {
    setFile(null);
    setProgress(0);
    setUploadedBytes(0);
    setTotalBytes(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetFormAfterSuccess() {
    resetFileInput();

    setTitle("");
    setDescription("");
    setInstructor("MindSettle");
  }

  function validateAndSelectFile(selectedFile) {
    clearMessage();
    setProgress(0);
    setUploadedBytes(0);
    setTotalBytes(0);

    if (!selectedFile) {
      resetFileInput();
      return;
    }

    if (
      !ALLOWED_FILE_TYPES.includes(
        selectedFile.type
      )
    ) {
      resetFileInput();

      showMessage(
        "Unsupported file type. Please choose a supported video, audio or image file.",
        "error"
      );

      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      resetFileInput();

      showMessage(
        "The selected file is larger than the application's current 5 GB limit.",
        "error"
      );

      return;
    }

    setFile(selectedFile);
    setTotalBytes(selectedFile.size);

    setTitle(
      createFallbackTitle(selectedFile.name)
    );

    showMessage(
      `${getMediaLabel(
        selectedFile
      )} selected successfully.`,
      "info"
    );
  }

  function handleFileChange(event) {
    const selectedFile =
      event.target.files?.[0];

    validateAndSelectFile(selectedFile);
  }

  function handleDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!uploading) {
      setDragActive(true);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!uploading) {
      setDragActive(true);
    }
  }

  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    if (uploading) {
      return;
    }

    const selectedFile =
      event.dataTransfer.files?.[0];

    validateAndSelectFile(selectedFile);
  }

  function openFilePicker() {
    if (uploading) {
      return;
    }

    fileInputRef.current?.click();
  }

  async function saveMediaMetadata({
    selectedFile,
    storagePath,
  }) {
    const response = await fetch(
      "/api/media/complete",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          title:
            title.trim() ||
            createFallbackTitle(
              selectedFile.name
            ),

          description:
            description.trim(),

          instructor:
            instructor.trim() ||
            "MindSettle",

          storagePath,

          contentType:
            selectedFile.type,
        }),
      }
    );

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
          "The file uploaded, but its media information could not be saved."
      );
    }

    return result;
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!file) {
      showMessage(
        "Please choose a video, audio or image file first.",
        "error"
      );

      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadedBytes(0);
    setTotalBytes(file.size);

    showMessage(
      "Preparing secure resumable upload...",
      "info"
    );

    try {
      const {
        data: { session },
        error: sessionError,
      } =
        await supabase.auth.getSession();

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

      const safeFileName =
        createSafeFileName(file.name);

      const uniqueFileName =
        `${crypto.randomUUID()}-${safeFileName}`;

      const storagePath =
        `uploads/${uniqueFileName}`;

      const uploadEndpoint =
        getDirectStorageUrl();

      const selectedFile = file;

      const upload = new tus.Upload(
        selectedFile,
        {
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
            bucketName:
              STORAGE_BUCKET,

            objectName:
              storagePath,

            contentType:
              selectedFile.type ||
              "application/octet-stream",

            cacheControl:
              "3600",
          },

          onError(error) {
            console.error(
              "TUS upload error:",
              error
            );

            uploadRef.current = null;

            setUploading(false);

            showMessage(
              error?.message ||
                "The resumable upload failed.",
              "error"
            );
          },

          onProgress(
            bytesUploaded,
            bytesTotal
          ) {
            const percentage =
              bytesTotal > 0
                ? Math.round(
                    (bytesUploaded /
                      bytesTotal) *
                      100
                  )
                : 0;

            setProgress(percentage);

            setUploadedBytes(
              bytesUploaded
            );

            setTotalBytes(
              bytesTotal
            );

            showMessage(
              `Uploading media: ${percentage}%`,
              "info"
            );
          },

          async onSuccess() {
            try {
              setProgress(100);

              setUploadedBytes(
                selectedFile.size
              );

              showMessage(
                "Upload complete. Saving media information...",
                "info"
              );

              await saveMediaMetadata({
                selectedFile,
                storagePath,
              });

              showMessage(
                "Media uploaded and saved successfully.",
                "success"
              );

              resetFormAfterSuccess();
            } catch (error) {
              console.error(
                "Metadata completion error:",
                error
              );

              showMessage(
                error instanceof Error
                  ? error.message
                  : "The file uploaded, but saving its media information failed.",
                "error"
              );
            } finally {
              uploadRef.current = null;

              setUploading(false);
            }
          },
        }
      );

      uploadRef.current = upload;

      const previousUploads =
        await upload.findPreviousUploads();

      if (
        previousUploads.length > 0
      ) {
        upload.resumeFromPreviousUpload(
          previousUploads[0]
        );

        showMessage(
          "Previous upload found. Resuming from the previous upload...",
          "info"
        );
      } else {
        showMessage(
          "Starting resumable upload...",
          "info"
        );
      }

      upload.start();
    } catch (error) {
      console.error(
        "Resumable upload setup error:",
        error
      );

      uploadRef.current = null;

      setUploading(false);

      showMessage(
        error instanceof Error
          ? error.message
          : "Could not start the resumable upload.",
        "error"
      );
    }
  }

  async function handleCancelUpload() {
    const activeUpload =
      uploadRef.current;

    if (!activeUpload) {
      return;
    }

    try {
      await activeUpload.abort(true);

      uploadRef.current = null;

      setUploading(false);
      setProgress(0);
      setUploadedBytes(0);

      showMessage(
        "Upload cancelled.",
        "info"
      );
    } catch (error) {
      console.error(
        "Upload cancellation error:",
        error
      );

      showMessage(
        error instanceof Error
          ? `Could not cancel upload: ${error.message}`
          : "Could not cancel the upload.",
        "error"
      );
    }
  }

  const statusClasses = {
    success:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",

    error:
      "border-red-500/30 bg-red-500/10 text-red-300",

    info:
      "border-neutral-700 bg-neutral-900 text-neutral-300",
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">

        {/* PAGE HEADER */}

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            MindSettle Administration
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Media Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
            Upload videos, audio files and
            images for the MindSettle
            platform. Media is uploaded
            securely and stored with its
            information in the database.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.7fr]">

          {/* MAIN UPLOAD CARD */}

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8">

            <div>
              <h2 className="text-xl font-semibold text-white">
                Upload new media
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-400">
                Select a supported file and
                provide its information before
                uploading.
              </p>
            </div>

            <form
              onSubmit={handleUpload}
              className="mt-8"
            >

              {/* DRAG & DROP */}

              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFilePicker}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();

                    openFilePicker();
                  }
                }}
                className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
                  dragActive
                    ? "border-emerald-400 bg-emerald-500/10"
                    : "border-neutral-700 bg-neutral-950/60 hover:border-emerald-500 hover:bg-neutral-900"
                } ${
                  uploading
                    ? "cursor-not-allowed opacity-60"
                    : ""
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={
                    ACCEPTED_EXTENSIONS
                  }
                  onChange={
                    handleFileChange
                  }
                  disabled={
                    uploading
                  }
                  className="hidden"
                />

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-2xl text-emerald-400">
                  ↑
                </div>

                <p className="mt-5 text-base font-medium text-white">
                  Drop media here
                </p>

                <p className="mt-2 text-sm text-neutral-400">
                  or{" "}
                  <span className="font-medium text-emerald-400">
                    browse your files
                  </span>
                </p>

                <p className="mt-4 text-xs text-neutral-500">
                  MP4 • MOV • WEBM • MP3 •
                  M4A • WAV • JPG • PNG •
                  WEBP
                </p>
              </div>

              {/* SELECTED FILE */}

              {file && (
                <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950/70 p-5">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xl text-emerald-400">
                      {getMediaIcon(file)}
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-start justify-between gap-2">

                        <div>
                          <p className="truncate font-medium text-white">
                            {file.name}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {getMediaLabel(
                              file
                            )}{" "}
                            •{" "}
                            {formatFileSize(
                              file.size
                            )}
                          </p>
                        </div>

                        {!uploading && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();

                              resetFileInput();

                              clearMessage();
                            }}
                            className="text-xs font-medium text-neutral-400 transition hover:text-white"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MEDIA DETAILS */}

              <div className="mt-8">

                <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-300">
                  Media information
                </h3>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">

                  <div>
                    <label
                      htmlFor="title"
                      className="mb-2 block text-sm font-medium text-neutral-300"
                    >
                      Title
                    </label>

                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(event) =>
                        setTitle(
                          event.target.value
                        )
                      }
                      disabled={
                        uploading
                      }
                      placeholder="Media title"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="instructor"
                      className="mb-2 block text-sm font-medium text-neutral-300"
                    >
                      Instructor
                    </label>

                    <input
                      id="instructor"
                      type="text"
                      value={
                        instructor
                      }
                      onChange={(event) =>
                        setInstructor(
                          event.target.value
                        )
                      }
                      disabled={
                        uploading
                      }
                      placeholder="MindSettle"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-neutral-300"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    rows={4}
                    value={
                      description
                    }
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    disabled={
                      uploading
                    }
                    placeholder="Add a short description of this media..."
                    className="w-full resize-y rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* PROGRESS */}

              {uploading && (
                <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">

                  <div className="flex items-center justify-between gap-4">

                    <div>
                      <p className="text-sm font-medium text-white">
                        Uploading media
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {formatFileSize(
                          uploadedBytes
                        )}{" "}
                        of{" "}
                        {formatFileSize(
                          totalBytes
                        )}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-emerald-400">
                      {progress}%
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800">

                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>
                </div>
              )}

              {/* BUTTONS */}

              <div className="mt-8 flex flex-wrap gap-3">

                <button
                  type="submit"
                  disabled={
                    uploading || !file
                  }
                  className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
                >
                  {uploading
                    ? "Uploading..."
                    : "Upload Media"}
                </button>

                {uploading && (
                  <button
                    type="button"
                    onClick={
                      handleCancelUpload
                    }
                    className="rounded-full border border-red-500/40 px-6 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
                  >
                    Cancel Upload
                  </button>
                )}
              </div>

              {/* STATUS MESSAGE */}

              {message && (
                <div
                  role="status"
                  className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                    statusClasses[
                      messageType
                    ] ||
                    statusClasses.info
                  }`}
                >
                  {message}
                </div>
              )}

            </form>
          </section>

          {/* SIDE INFORMATION */}

          <aside className="space-y-6">

            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
                Upload information
              </p>

              <div className="mt-5 space-y-5">

                <div>
                  <p className="text-sm font-medium text-white">
                    Application target
                  </p>

                  <p className="mt-1 text-sm leading-6 text-neutral-400">
                    Up to 5 GB per file.
                    Actual limits depend on
                    the active storage
                    provider and plan.
                  </p>
                </div>

                <div className="border-t border-neutral-800 pt-5">

                  <p className="text-sm font-medium text-white">
                    Resumable uploads
                  </p>

                  <p className="mt-1 text-sm leading-6 text-neutral-400">
                    Large files are sent in
                    smaller chunks and can
                    continue after temporary
                    connection interruptions.
                  </p>
                </div>

                <div className="border-t border-neutral-800 pt-5">

                  <p className="text-sm font-medium text-white">
                    Access
                  </p>

                  <p className="mt-1 text-sm leading-6 text-neutral-400">
                    Media management is
                    intended for authorised
                    MindSettle administrators.
                  </p>
                </div>

              </div>
            </section>

            <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">

              <p className="text-sm font-medium text-emerald-300">
                Secure media storage
              </p>

              <p className="mt-2 text-sm leading-6 text-neutral-400">
                The current development
                version uses Supabase Storage.
                Additional video delivery
                providers such as Vimeo can
                be integrated later.
              </p>

            </section>

          </aside>
        </div>
      </div>
    </main>
  );
}