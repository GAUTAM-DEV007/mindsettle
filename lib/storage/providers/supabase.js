import { StorageProvider } from "../provider";
import { createClient } from "../../supabase/server";

const DEFAULT_BUCKET = "videos";

export class SupabaseStorageProvider extends StorageProvider {
  constructor(bucket = DEFAULT_BUCKET) {
    super();
    this.bucket = bucket;
  }

  async uploadFile({ file, path, contentType }) {
    if (!file) {
      throw new Error("A file is required.");
    }

    if (!path) {
      throw new Error("A storage path is required.");
    }

    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(path, file, {
        contentType: contentType || file.type,
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    return {
      provider: "supabase",
      bucket: this.bucket,
      path: data.path,
    };
  }

  async deleteFile({ path }) {
    if (!path) {
      throw new Error("A storage path is required.");
    }

    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(this.bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`);
    }

    return {
      provider: "supabase",
      bucket: this.bucket,
      path,
      data,
    };
  }

  async createSignedUrl({ path, expiresIn = 3600 }) {
    if (!path) {
      throw new Error("A storage path is required.");
    }

    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(
        `Supabase signed URL generation failed: ${error.message}`
      );
    }

    return {
      provider: "supabase",
      bucket: this.bucket,
      path,
      signedUrl: data.signedUrl,
      expiresIn,
    };
  }
}