import { v2 as cloudinary } from "cloudinary";
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";
import type { Adapter, CollectionOptions, GeneratedAdapter } from "@payloadcms/plugin-cloud-storage/types";
import type { Config, UploadCollectionSlug } from "payload";

type CloudinaryStorageOptions = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder?: string;
  collections: Partial<Record<UploadCollectionSlug, true>>;
};

function publicIdFor(folder: string, filename: string): string {
  // Cloudinary appends the detected format extension to delivery URLs itself,
  // so the public_id must NOT include the file extension (else it doubles up:
  // "name.png" upload -> served at ".../name.png.png").
  const withoutExtension = filename.replace(/\.[^./]+$/, "");
  return `${folder}/${withoutExtension}`;
}

function createCloudinaryAdapter(folder: string): Adapter {
  return () => {
    const handleUpload: GeneratedAdapter["handleUpload"] = async ({ data, file }) => {
      await new Promise<void>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            public_id: publicIdFor(folder, file.filename),
            resource_type: "auto",
            overwrite: true,
          },
          (error) => (error ? reject(error) : resolve()),
        );
        stream.end(file.buffer);
      });
      return data;
    };

    const handleDelete: GeneratedAdapter["handleDelete"] = async ({ filename }) => {
      await cloudinary.uploader.destroy(publicIdFor(folder, filename), { resource_type: "image" });
    };

    const generateURL: GeneratedAdapter["generateURL"] = ({ filename }) =>
      cloudinary.url(publicIdFor(folder, filename), {
        secure: true,
        fetch_format: "auto",
        quality: "auto",
      });

    const staticHandler: GeneratedAdapter["staticHandler"] = (_req, { params }) =>
      Response.redirect(
        cloudinary.url(publicIdFor(folder, params.filename), {
          secure: true,
          fetch_format: "auto",
          quality: "auto",
        }),
        302,
      );

    return {
      name: "cloudinary",
      generateURL,
      handleDelete,
      handleUpload,
      staticHandler,
    };
  };
}

/**
 * Minimal, self-owned Cloudinary storage adapter for @payloadcms/plugin-cloud-storage.
 * There is no official Cloudinary adapter for Payload (only S3/Azure/GCS), so this
 * mirrors the shape of the official @payloadcms/storage-s3 adapter directly against
 * Cloudinary's SDK — no third-party Payload+Cloudinary package involved.
 */
export function cloudinaryStorage(options: CloudinaryStorageOptions) {
  return (incomingConfig: Config): Config => {
    cloudinary.config({
      cloud_name: options.cloudName,
      api_key: options.apiKey,
      api_secret: options.apiSecret,
      secure: true,
    });

    const folder = options.folder ?? "365-ajedrez";
    const adapter = createCloudinaryAdapter(folder);

    // `disablePayloadAccessControl: true` is what makes the plugin call our
    // `generateURL` (Cloudinary's own CDN URL) instead of Payload's local,
    // access-controlled `/api/<collection>/file/<name>` route — files are public
    // on Cloudinary anyway, so there's no reason to proxy them through our server.
    const collectionsWithAdapter = Object.keys(options.collections).reduce<
      Record<string, CollectionOptions>
    >((acc, slug) => ({ ...acc, [slug]: { adapter, disablePayloadAccessControl: true } }), {});

    return cloudStoragePlugin({
      collections: collectionsWithAdapter,
    })(incomingConfig);
  };
}
