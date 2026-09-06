import { createHmac, createHash } from 'node:crypto';
import type { UploadResult } from './types';

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || '';
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'oa-proctor-snapshots';
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

export const isR2Configured = Boolean(accountId && accessKeyId && secretAccessKey);

function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string) {
  const kDate = createHmac('sha256', 'AWS4' + key).update(dateStamp).digest();
  const kRegion = createHmac('sha256', kDate).update(regionName).digest();
  const kService = createHmac('sha256', kRegion).update(serviceName).digest();
  const kSigning = createHmac('sha256', kService).update('aws4_request').digest();
  return kSigning;
}

export type { UploadResult };

/**
 * Uploads a proctoring snapshot to Cloudflare R2 (or fallback storage if R2 keys are unconfigured)
 * Uses native Node.js crypto AWS SigV4 - zero external npm package dependencies!
 *
 * @param submissionId - The candidate assessment submission ID
 * @param eventType - The violation or telemetry event type
 * @param imageBuffer - The binary image buffer (WebP or JPEG)
 * @param contentType - Image MIME type ('image/webp' or 'image/jpeg')
 */
export async function uploadProctorSnapshot(
  submissionId: string,
  eventType: string,
  imageBuffer: Buffer,
  contentType = 'image/webp'
): Promise<UploadResult> {
  const timestamp = Date.now();
  const sanitizedEvent = eventType.replace(/[^a-z0-9_-]/gi, '_');
  const key = `proctor/${submissionId}/${timestamp}_${sanitizedEvent}.webp`;

  if (isR2Configured) {
    try {
      const now = new Date();
      const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
      const dateStamp = amzDate.slice(0, 8);
      const region = 'auto';
      const service = 's3';
      const host = `${accountId}.r2.cloudflarestorage.com`;
      const path = `/${bucketName}/${key}`;

      const payloadHash = createHash('sha256').update(imageBuffer).digest('hex');

      const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
      const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

      const canonicalRequest = `PUT\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
      const canonicalRequestHash = createHash('sha256').update(canonicalRequest).digest('hex');

      const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
      const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

      const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, service);
      const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');

      const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

      const response = await fetch(`https://${host}${path}`, {
        method: 'PUT',
        headers: {
          Host: host,
          'x-amz-date': amzDate,
          'x-amz-content-sha256': payloadHash,
          Authorization: authorizationHeader,
          'Content-Type': contentType,
        },
        body: new Uint8Array(imageBuffer),
      });

      if (response.ok) {
        const url = publicUrl
          ? `${publicUrl.replace(/\/$/, '')}/${key}`
          : `https://${host}/${bucketName}/${key}`;

        return { url, key, storage: 'r2' };
      } else {
        console.warn('R2 upload returned status', response.status, await response.text());
      }
    } catch (err) {
      console.warn('Cloudflare R2 native upload error, using fallback:', err);
    }
  }

  // Graceful zero-cost fallback for local development or when R2 credentials are unconfigured
  const base64 = imageBuffer.toString('base64');
  return {
    url: `data:${contentType};base64,${base64}`,
    key,
    storage: 'data_fallback',
  };
}
