"use client";

import { useRef, useState } from "react";
import * as tus from "tus-js-client";
import { createClient } from "@/lib/supabase/client";

const STORAGE_BUCKET = "videos";
const CHUNK_SIZE = 6 * 1024 * 1024;

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;
const MAX_THUMBNAIL_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_THUMBNAIL_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
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

const ACCEPTED_THUMBNAIL_EXTENSIONS =
  ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

function getMediaType(file) {
  if (file?.type?.startsWith("video/")) return "video";
  if (file?.type?.startsWith("audio/")) return "audio";
  if (file?.type?.startsWith("image/")) return "image";
  return "unknown";
}

function getMediaLabel(file) {
  const type = getMediaType(file);
  if (type === "video") return "Video";
  if (type === "audio") return "Audio";
  if (type === "image") return "Image";
  return "Media";
}

function getMediaIcon(file) {
  const type = getMediaType(file);
  if (type === "video") return "▶";
  if (type === "audio") return "♪";
  if (type === "image") return "▣";
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

function createThumbnailFileName(fileName) {
  const baseName = createSafeFileName(
    fileName.replace(/\.[^/.]+$/, "")
  );

  return `${baseName || "video"}-thumbnail.jpg`;
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";

  const gb = 1024 * 1024 * 1024;
  const mb = 1024 * 1024;
  const kb = 1024;

  if (bytes >= gb) return `${(bytes / gb).toFixed(2)} GB`;
  if (bytes >= mb) return `${(bytes / mb).toFixed(2)} MB`;
  if (bytes >= kb) return `${(bytes / kb).toFixed(2)} KB`;

  return `${bytes} bytes`;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${mins}:${secs}`;
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

function createThumbnailFromVideoAtTime(videoFile, timeSeconds) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(videoFile);
    const video = document.createElement("video");

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    function cleanup() {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    }

    video.onerror = () => {
      cleanup();
      reject(
        new Error(
          "Could not read this video to create a thumbnail."
        )
      );
    };

    video.onloadedmetadata = () => {
      const duration =
        Number.isFinite(video.duration)
          ? video.duration
          : 0;

      const safeTime =
        duration > 0
          ? Math.min(
              Math.max(timeSeconds, 0),
              Math.max(duration - 0.1, 0)
            )
          : 0;

      video.currentTime = safeTime;
    };

    video.onseeked = () => {
      try {
        const sourceWidth = video.videoWidth || 1280;
        const sourceHeight = video.videoHeight || 720;

        const maxWidth = 1280;
        const scale =
          sourceWidth > maxWidth
            ? maxWidth / sourceWidth
            : 1;

        const width = Math.max(
          1,
          Math.round(sourceWidth * scale)
        );
        const height = Math.max(
          1,
          Math.round(sourceHeight * scale)
        );

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          cleanup();
          reject(
            new Error(
              "Could not prepare the thumbnail image."
            )
          );
          return;
        }

        context.drawImage(
          video,
          0,
          0,
          width,
          height
        );

        canvas.toBlob(
          (blob) => {
            cleanup();

            if (!blob) {
              reject(
                new Error(
                  "Could not create a thumbnail from the selected frame."
                )
              );
              return;
            }

            resolve(
              new File(
                [blob],
                createThumbnailFileName(videoFile.name),
                {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }
              )
            );
          },
          "image/jpeg",
          0.85
        );
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    video.src = objectUrl;
  });
}

function getAutomaticThumbnailTime(videoFile) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(videoFile);
    const video = document.createElement("video");

    video.preload = "metadata";

    function cleanup() {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    }

    video.onerror = () => {
      cleanup();
      reject(
        new Error(
          "Could not read this video to generate a thumbnail."
        )
      );
    };

    video.onloadedmetadata = () => {
      const duration =
        Number.isFinite(video.duration)
          ? video.duration
          : 0;

      let targetTime = duration > 0
        ? duration * 0.15
        : 0;

      if (duration > 0 && duration <= 2) {
        targetTime = duration / 2;
      } else if (duration > 2) {
        targetTime = Math.max(
          1,
          Math.min(targetTime, 3)
        );
      }

      if (duration > 0) {
        targetTime = Math.min(
          targetTime,
          Math.max(duration - 0.1, 0)
        );
      }

      cleanup();

      resolve({
        duration,
        targetTime,
      });
    };

    video.src = objectUrl;
  });
}

export default function MediaUploader({
  onUploadComplete,
}) {
  const [supabase] = useState(() => createClient());

  const [file, setFile] = useState(null);

  const [thumbnailMode, setThumbnailMode] =
    useState("auto");

  const [thumbnailFile, setThumbnailFile] =
    useState(null);

  const [thumbnailPreview, setThumbnailPreview] =
    useState(null);

  const [generatingThumbnail, setGeneratingThumbnail] =
    useState(false);

  const [videoPreviewUrl, setVideoPreviewUrl] =
    useState(null);

  const [videoDuration, setVideoDuration] =
    useState(0);

  const [selectedFrameTime, setSelectedFrameTime] =
    useState(0);

  const videoPreviewRef = useRef(null);

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
  const thumbnailInputRef = useRef(null);

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);
  }

  function clearMessage() {
    setMessage("");
    setMessageType("info");
  }

  function clearThumbnailState() {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    setThumbnailFile(null);
    setThumbnailPreview(null);
    setGeneratingThumbnail(false);

    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  }

  function clearVideoPreview() {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    setVideoPreviewUrl(null);
    setVideoDuration(0);
    setSelectedFrameTime(0);
  }

  function setThumbnailSelection(selectedThumbnail) {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    setThumbnailFile(selectedThumbnail);

    setThumbnailPreview(
      URL.createObjectURL(selectedThumbnail)
    );
  }

  async function createAutomaticThumbnail(
    selectedVideo
  ) {
    setGeneratingThumbnail(true);

    showMessage(
      "Generating thumbnail from the video...",
      "info"
    );

    try {
      const { duration, targetTime } =
        await getAutomaticThumbnailTime(
          selectedVideo
        );

      setVideoDuration(duration);
      setSelectedFrameTime(targetTime);

      const generatedThumbnail =
        await createThumbnailFromVideoAtTime(
          selectedVideo,
          targetTime
        );

      setThumbnailSelection(
        generatedThumbnail
      );

      showMessage(
        "Video selected and automatic thumbnail created.",
        "success"
      );
    } catch (error) {
      console.error(
        "Automatic thumbnail error:",
        error
      );

      clearThumbnailState();

      showMessage(
        "Video selected, but automatic thumbnail generation failed. You can choose a frame manually or upload a custom thumbnail.",
        "error"
      );
    } finally {
      setGeneratingThumbnail(false);
    }
  }

  async function switchToAutomaticThumbnail() {
    if (
      !file ||
      getMediaType(file) !== "video" ||
      uploading
    ) {
      return;
    }

    setThumbnailMode("auto");
    clearThumbnailState();

    await createAutomaticThumbnail(file);
  }

  function switchToFramePicker() {
    if (
      !file ||
      getMediaType(file) !== "video" ||
      uploading
    ) {
      return;
    }

    setThumbnailMode("frame");
    clearThumbnailState();

    if (!videoPreviewUrl) {
      setVideoPreviewUrl(
        URL.createObjectURL(file)
      );
    }

    showMessage(
      "Move the slider to the frame you want, then click Use this frame.",
      "info"
    );
  }

  function switchToManualThumbnail() {
    if (uploading) {
      return;
    }

    setThumbnailMode("manual");
    clearThumbnailState();

    showMessage(
      getMediaType(file) === "audio"
        ? "Choose a cover image for this audio file."
        : "Choose a custom thumbnail image.",
      "info"
    );
  }

  async function useSelectedVideoFrame() {
    if (
      !file ||
      getMediaType(file) !== "video"
    ) {
      return;
    }

    setGeneratingThumbnail(true);

    try {
      const generatedThumbnail =
        await createThumbnailFromVideoAtTime(
          file,
          selectedFrameTime
        );

      setThumbnailSelection(
        generatedThumbnail
      );

      showMessage(
        `Selected frame at ${formatTime(
          selectedFrameTime
        )} will be used as the thumbnail.`,
        "success"
      );
    } catch (error) {
      console.error(
        "Frame thumbnail error:",
        error
      );

      showMessage(
        error instanceof Error
          ? error.message
          : "Could not create the thumbnail from this frame.",
        "error"
      );
    } finally {
      setGeneratingThumbnail(false);
    }
  }

  function handleFrameSliderChange(event) {
    const nextTime = Number(
      event.target.value
    );

    setSelectedFrameTime(nextTime);

    if (videoPreviewRef.current) {
      videoPreviewRef.current.currentTime =
        nextTime;
    }
  }

  function resetFileInput() {
    setFile(null);
    setProgress(0);
    setUploadedBytes(0);
    setTotalBytes(0);
    setThumbnailMode("auto");
    clearThumbnailState();
    clearVideoPreview();

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

  async function validateAndSelectFile(
    selectedFile
  ) {
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

    clearThumbnailState();
    clearVideoPreview();

    const mediaType =
      getMediaType(selectedFile);

    setFile(selectedFile);
    setTotalBytes(selectedFile.size);

    setTitle(
      createFallbackTitle(
        selectedFile.name
      )
    );

    if (mediaType === "video") {
      setVideoPreviewUrl(
        URL.createObjectURL(selectedFile)
      );

      setThumbnailMode("auto");

      await createAutomaticThumbnail(
        selectedFile
      );

      return;
    }

    if (mediaType === "audio") {
      setThumbnailMode("manual");

      showMessage(
        "Audio selected successfully. You can optionally add a cover image.",
        "info"
      );

      return;
    }

    setThumbnailMode("auto");

    showMessage(
      `${getMediaLabel(
        selectedFile
      )} selected successfully.`,
      "info"
    );
  }

  async function handleFileChange(event) {
    const selectedFile =
      event.target.files?.[0];

    await validateAndSelectFile(
      selectedFile
    );
  }

  function validateAndSelectThumbnail(
    selectedFile
  ) {
    clearMessage();

    if (!selectedFile) {
      clearThumbnailState();
      return;
    }

    if (
      !ALLOWED_THUMBNAIL_TYPES.includes(
        selectedFile.type
      )
    ) {
      clearThumbnailState();

      showMessage(
        "Thumbnail must be a JPG, PNG or WEBP image.",
        "error"
      );

      return;
    }

    if (
      selectedFile.size >
      MAX_THUMBNAIL_SIZE
    ) {
      clearThumbnailState();

      showMessage(
        "Thumbnail must be smaller than 10 MB.",
        "error"
      );

      return;
    }

    setThumbnailSelection(
      selectedFile
    );

    showMessage(
      getMediaType(file) === "audio"
        ? "Cover image selected successfully."
        : "Custom thumbnail selected successfully.",
      "success"
    );
  }

  function handleThumbnailChange(event) {
    const selectedFile =
      event.target.files?.[0];

    validateAndSelectThumbnail(
      selectedFile
    );
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

  async function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    if (uploading) {
      return;
    }

    const selectedFile =
      event.dataTransfer.files?.[0];

    await validateAndSelectFile(
      selectedFile
    );
  }

  function openFilePicker() {
    if (uploading) {
      return;
    }

    fileInputRef.current?.click();
  }

  async function uploadThumbnail() {
    if (!thumbnailFile) {
      return null;
    }

    const safeThumbnailName =
      createSafeFileName(
        thumbnailFile.name
      );

    const thumbnailPath =
      `thumbnails/${crypto.randomUUID()}-${safeThumbnailName}`;

    const { error } =
      await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(
          thumbnailPath,
          thumbnailFile,
          {
            contentType:
              thumbnailFile.type,
            cacheControl: "3600",
            upsert: false,
          }
        );

    if (error) {
      throw new Error(
        `Thumbnail upload failed: ${error.message}`
      );
    }

    return thumbnailPath;
  }

  async function removeUploadedObject(path) {
    if (!path) return;

    const { error } =
      await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([path]);

    if (error) {
      console.error(
        `Could not remove uploaded object ${path}:`,
        error
      );
    }
  }

  async function saveMediaMetadata({
    selectedFile,
    storagePath,
    thumbnailPath,
  }) {
    const response = await fetch(
      "/api/media/complete",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
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

          thumbnailPath:
            thumbnailPath || null,

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

    if (generatingThumbnail) {
      showMessage(
        "Please wait for the thumbnail to finish generating.",
        "info"
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
            setUploadedBytes(bytesUploaded);
            setTotalBytes(bytesTotal);

            showMessage(
              `Uploading media: ${percentage}%`,
              "info"
            );
          },

          async onSuccess() {
            let thumbnailPath = null;

            try {
              setProgress(100);
              setUploadedBytes(
                selectedFile.size
              );

              if (
                thumbnailFile &&
                getMediaType(
                  selectedFile
                ) !== "image"
              ) {
                showMessage(
                  thumbnailMode === "auto"
                    ? "Media uploaded. Uploading generated thumbnail..."
                    : thumbnailMode === "frame"
                      ? "Media uploaded. Uploading selected video frame..."
                      : "Media uploaded. Uploading cover image...",
                  "info"
                );

                thumbnailPath =
                  await uploadThumbnail();
              }

              showMessage(
                "Upload complete. Saving media information...",
                "info"
              );

              const result =
                await saveMediaMetadata({
                  selectedFile,
                  storagePath,
                  thumbnailPath,
                });

              showMessage(
                "Media uploaded and saved successfully.",
                "success"
              );

              resetFormAfterSuccess();

              if (
                typeof onUploadComplete ===
                "function"
              ) {
                onUploadComplete(result);
              }
            } catch (error) {
              console.error(
                "Media completion error:",
                error
              );

              if (!thumbnailPath) {
                await removeUploadedObject(
                  storagePath
                );
              }

              showMessage(
                error instanceof Error
                  ? error.message
                  : "The upload finished, but completing the media record failed.",
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

    if (!activeUpload) return;

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

  const selectedMediaType =
    getMediaType(file);

  const isVideo =
    selectedMediaType === "video";

  const isAudio =
    selectedMediaType === "audio";

  const canUseThumbnail =
    isVideo || isAudio;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            MindSettle Administration
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Media Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
            Upload videos, audio files and
            images for the MindSettle platform.
            Media is stored securely together
            with its information.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.7fr]">

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
                    event.key === "Enter" ||
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
                  accept={ACCEPTED_EXTENSIONS}
                  onChange={handleFileChange}
                  disabled={uploading}
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
                  M4A • WAV • JPG • PNG • WEBP
                </p>
              </div>

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
                            {getMediaLabel(file)}
                            {" • "}
                            {formatFileSize(file.size)}
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

              {canUseThumbnail && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-300">
                    Thumbnail / Cover Image
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    {isVideo
                      ? "Choose how the video thumbnail should be created."
                      : "Audio has no video frame, so you can optionally add a cover image."}
                  </p>

                  {isVideo && (
                    <div className="mt-4 grid gap-3 md:grid-cols-3">

                      <button
                        type="button"
                        onClick={switchToAutomaticThumbnail}
                        disabled={
                          uploading ||
                          generatingThumbnail
                        }
                        className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                          thumbnailMode === "auto"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                            : "border-neutral-700 bg-neutral-950 text-neutral-400 hover:border-neutral-600 hover:text-white"
                        }`}
                      >
                        <span className="block font-medium">
                          Automatic
                        </span>
                        <span className="mt-1 block text-xs opacity-75">
                          System chooses a frame.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={switchToFramePicker}
                        disabled={uploading}
                        className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                          thumbnailMode === "frame"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                            : "border-neutral-700 bg-neutral-950 text-neutral-400 hover:border-neutral-600 hover:text-white"
                        }`}
                      >
                        <span className="block font-medium">
                          Choose from video
                        </span>
                        <span className="mt-1 block text-xs opacity-75">
                          Scrub to the exact frame.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={switchToManualThumbnail}
                        disabled={uploading}
                        className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                          thumbnailMode === "manual"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                            : "border-neutral-700 bg-neutral-950 text-neutral-400 hover:border-neutral-600 hover:text-white"
                        }`}
                      >
                        <span className="block font-medium">
                          Custom image
                        </span>
                        <span className="mt-1 block text-xs opacity-75">
                          Upload your own JPG/PNG/WEBP.
                        </span>
                      </button>
                    </div>
                  )}

                  {thumbnailMode === "frame" &&
                    isVideo &&
                    videoPreviewUrl && (
                      <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5">

                        <video
                          ref={videoPreviewRef}
                          src={videoPreviewUrl}
                          className="aspect-video w-full rounded-xl bg-black object-contain"
                          controls
                          muted
                          preload="metadata"
                          onLoadedMetadata={(event) => {
                            const duration =
                              event.currentTarget.duration || 0;

                            setVideoDuration(duration);

                            if (
                              selectedFrameTime >
                              duration
                            ) {
                              setSelectedFrameTime(0);
                            }
                          }}
                        />

                        <div className="mt-5">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-medium text-white">
                              Select frame
                            </p>

                            <p className="text-sm text-emerald-400">
                              {formatTime(
                                selectedFrameTime
                              )}
                              {" / "}
                              {formatTime(
                                videoDuration
                              )}
                            </p>
                          </div>

                          <input
                            type="range"
                            min="0"
                            max={Math.max(
                              videoDuration,
                              0
                            )}
                            step="0.1"
                            value={
                              selectedFrameTime
                            }
                            onChange={
                              handleFrameSliderChange
                            }
                            className="mt-4 w-full accent-emerald-500"
                          />

                          <button
                            type="button"
                            onClick={
                              useSelectedVideoFrame
                            }
                            disabled={
                              generatingThumbnail
                            }
                            className="mt-4 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:opacity-60"
                          >
                            {generatingThumbnail
                              ? "Creating thumbnail..."
                              : "Use this frame"}
                          </button>
                        </div>
                      </div>
                    )}

                  {generatingThumbnail &&
                    thumbnailMode !== "frame" && (
                      <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 text-sm text-neutral-400">
                        Generating thumbnail...
                      </div>
                    )}

                  {thumbnailFile && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/70">
                      <div className="grid gap-0 sm:grid-cols-[200px_1fr]">

                        <div className="aspect-video bg-black sm:aspect-auto">
                          {thumbnailPreview && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumbnailPreview}
                              alt="Selected thumbnail preview"
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-4 p-5">
                          <div className="min-w-0">

                            <p className="truncate text-sm font-medium text-white">
                              {thumbnailFile.name}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {isVideo &&
                              thumbnailMode === "auto"
                                ? "Automatically generated frame"
                                : isVideo &&
                                    thumbnailMode === "frame"
                                  ? `Selected video frame at ${formatTime(
                                      selectedFrameTime
                                    )}`
                                  : isAudio
                                    ? "Audio cover image"
                                    : "Custom thumbnail"}
                              {" • "}
                              {formatFileSize(
                                thumbnailFile.size
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {(isAudio ||
                    thumbnailMode === "manual") && (
                    <>
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept={
                          ACCEPTED_THUMBNAIL_EXTENSIONS
                        }
                        onChange={
                          handleThumbnailChange
                        }
                        disabled={uploading}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          thumbnailInputRef.current?.click()
                        }
                        disabled={uploading}
                        className="mt-4 w-full rounded-2xl border border-dashed border-neutral-700 bg-neutral-950/60 px-6 py-6 text-left transition hover:border-emerald-500 hover:bg-neutral-900 disabled:opacity-60"
                      >
                        <p className="font-medium text-white">
                          {thumbnailFile
                            ? "Replace image"
                            : isAudio
                              ? "Choose cover image"
                              : "Choose custom thumbnail"}
                        </p>

                        <p className="mt-2 text-sm text-neutral-500">
                          JPG, PNG or WEBP • Maximum 10 MB
                        </p>
                      </button>
                    </>
                  )}
                </div>
              )}

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
                        setTitle(event.target.value)
                      }
                      disabled={uploading}
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
                      value={instructor}
                      onChange={(event) =>
                        setInstructor(
                          event.target.value
                        )
                      }
                      disabled={uploading}
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
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    disabled={uploading}
                    placeholder="Add a short description of this media..."
                    className="w-full resize-y rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-500"
                  />
                </div>
              </div>

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
                        )}
                        {" of "}
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

              <div className="mt-8 flex flex-wrap gap-3">

                <button
                  type="submit"
                  disabled={
                    uploading ||
                    !file ||
                    generatingThumbnail
                  }
                  className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
                >
                  {generatingThumbnail
                    ? "Preparing Thumbnail..."
                    : uploading
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
                    Designed to support files
                    up to 5 GB. Actual limits
                    depend on the storage
                    provider and plan.
                  </p>
                </div>

                <div className="border-t border-neutral-800 pt-5">
                  <p className="text-sm font-medium text-white">
                    Thumbnail options
                  </p>

                  <p className="mt-1 text-sm leading-6 text-neutral-400">
                    Videos can use an automatic
                    frame, an exact frame chosen
                    by the admin, or a custom
                    uploaded image.
                  </p>
                </div>

                <div className="border-t border-neutral-800 pt-5">
                  <p className="text-sm font-medium text-white">
                    Audio covers
                  </p>

                  <p className="mt-1 text-sm leading-6 text-neutral-400">
                    Standalone audio can use an
                    optional JPG, PNG or WEBP
                    cover image.
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
          </aside>
        </div>
      </div>
    </main>
  );
}