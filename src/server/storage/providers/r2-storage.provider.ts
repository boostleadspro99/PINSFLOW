import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";
import { StorageProvider, UploadResult, StorageProviderType } from "../storage.types";
import { logger } from "@/lib/logger";

let client: S3Client | null = null;

function getConfig(): { bucket: string; publicBaseUrl: string } | null {
  const accountId = env.CLOUDFLARE_R2_ACCOUNT_ID || env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucket = env.CLOUDFLARE_R2_BUCKET;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  const publicBaseUrl =
    env.CLOUDFLARE_R2_PUBLIC_BASE_URL ||
    `https://${bucket}.${accountId}.r2.cloudflarestorage.com`;

  return { bucket, publicBaseUrl };
}

function getS3Client(): S3Client | null {
  const config = getConfig();
  if (!config) return null;

  if (!client) {
    const accountId = env.CLOUDFLARE_R2_ACCOUNT_ID || env.CLOUDFLARE_ACCOUNT_ID!;
    client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    });
  }
  return client;
}

export function isR2Configured(): boolean {
  return getConfig() !== null;
}

export class R2StorageProvider implements StorageProvider {
  readonly type: StorageProviderType = "R2";

  async upload(options: {
    imageData: string | Buffer;
    filename: string;
    mimeType?: string;
  }): Promise<UploadResult> {
    const config = getConfig();
    if (!config) {
      throw new Error("R2 storage is not configured. Set CLOUDFLARE_R2_* env vars.");
    }

    const s3 = getS3Client();
    if (!s3) {
      throw new Error("Failed to initialize R2 S3 client.");
    }

    const mimeType = options.mimeType || "image/png";
    const key = `pinflow-assets/${Date.now()}-${options.filename}`;

    try {
      const body =
        typeof options.imageData === "string"
          ? Buffer.from(options.imageData, "base64")
          : options.imageData;

      await s3.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: body,
          ContentType: mimeType,
          CacheControl: "public, max-age=31536000",
        }),
      );

      const publicUrl = `${config.publicBaseUrl}/${key}`;

      logger.info("Image uploaded to R2", { key, publicUrl });

      return {
        url: publicUrl,
        provider: "R2",
      };
    } catch (err) {
      logger.error("R2 upload failed", {
        error: err instanceof Error ? err.message : "Unknown error",
        key,
      });
      throw new Error("Failed to upload image to R2 storage.");
    }
  }
}
