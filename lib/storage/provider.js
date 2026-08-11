/**
 * Storage provider contract.
 *
 * Every cloud storage provider should implement these methods:
 *
 * uploadFile()
 * deleteFile()
 * createSignedUrl()
 */
export class StorageProvider {
  async uploadFile({ file, path, contentType }) {
    throw new Error("uploadFile() must be implemented.");
  }

  async deleteFile({ path }) {
    throw new Error("deleteFile() must be implemented.");
  }

  async createSignedUrl({ path, expiresIn }) {
    throw new Error("createSignedUrl() must be implemented.");
  }
}