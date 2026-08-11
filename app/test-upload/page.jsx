import MediaUploader from "@/components/admin/MediaUploader";

export default function TestUploadPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Test Media Upload
        </h1>

        <p className="mt-2 text-sm text-neutral-600">
          Test the reusable media uploader before integrating it into the admin dashboard.
        </p>
      </div>

      <MediaUploader />
    </main>
  );
}