import "server-only";

import { Storage } from "megajs";

function getMegaConfig() {
  const email =
    process.env.MEGA_EMAIL?.trim();

  const password =
    process.env.MEGA_PASSWORD;

  const folder =
    process.env.MEGA_ARCHIVE_FOLDER?.trim() ||
    "MindSettle";

  if (!email || !password) {
    return null;
  }

  return {
    email,
    password,
    folder,
  };
}

export function isMegaArchiveConfigured() {
  return Boolean(
    getMegaConfig()
  );
}

async function getMegaStorage() {
  const config =
    getMegaConfig();

  if (!config) {
    throw new Error(
      "MEGA archive is not configured."
    );
  }

  const storage =
    await new Storage({
      email:
        config.email,
      password:
        config.password,
    }).ready;

  return {
    storage,
    config,
  };
}

async function getOrCreateFolder(
  storage,
  folderName
) {
  const existing =
    storage.root.children?.find(
      (item) =>
        item.directory &&
        item.name === folderName
    );

  if (existing) {
    return existing;
  }

  return storage.mkdir(
    folderName
  );
}

export async function uploadBufferToMega({
  buffer,
  filename,
}) {
  if (!buffer) {
    throw new Error(
      "Archive buffer is required."
    );
  }

  if (!filename) {
    throw new Error(
      "Archive filename is required."
    );
  }

  const {
    storage,
    config,
  } = await getMegaStorage();

  try {
    const folder =
      await getOrCreateFolder(
        storage,
        config.folder
      );

    const file =
      await folder.upload({
        name:
          filename,

        size:
          buffer.length,
      }, buffer).complete;

    return {
      provider:
        "mega",

      path:
        `${config.folder}/${filename}`,

      name:
        file.name,
    };
  } finally {
    try {
      storage.close();
    } catch {
      // Ignore shutdown errors.
    }
  }
}
