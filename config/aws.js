import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Validate required AWS environment variables.
 * This should ONLY be called when AWS is actually needed.
 */
export function validateAwsEnv() {
  const required = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET'];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required AWS environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Create and return an S3 client.
 * AWS env vars are validated lazily here.
 */
export function getS3Client() {
  validateAwsEnv();

  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Upload a file buffer to S3
 * @param {Object} params
 * @param {Buffer} params.body - file bytes to upload
 * @param {string} params.key - S3 object key, e.g. "users/1234567890/profile.jpg"
 * @param {string} [params.contentType] - file content type, e.g. "application/pdf"
 * @returns {Promise<Object>} - S3 object metadata including bucket, key, and URL
 */

export async function uploadToS3({ body, key, contentType }) {
  if (!body) throw new Error('uploadToS3: Missing body');
  if (!key) throw new Error('uploadToS3: Missing key');

  const s3 = getS3Client(); // init delay

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    },
  });

  await upload.done();

  const url = `https://${process.env.AWS_S3_BUCKET}.s3.${
    process.env.AWS_REGION
  }.amazonaws.com/${encodeURIComponent(key).replaceAll('%2F', '/')}`;

  return {
    bucket: process.env.AWS_S3_BUCKET,
    key,
    url,
  };
}

/**
 * Generate a presigned URL for downloading a file from S3
 * @param {Object} params
 * @param {string} params.key - S3 object key, e.g. "users/1234567890/profile.jpg"
 * @param {number} [params.expiresInSeconds] - number of seconds until the URL expires (default: 600)
 * @param {string} [params.responseContentDisposition] - response content disposition (default: "inline")
 */
export async function getPresignedGetUrl({
  key,
  expiresInSeconds = 600,
  responseContentDisposition = 'inline', // default to inline for display in browser
}) {
  if (!key) throw new Error('getPresignedGetUrl: Missing key');

  const s3 = getS3Client();

  const cmd = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ResponseContentDisposition: responseContentDisposition,
  });

  return await getSignedUrl(s3, cmd, { expiresIn: expiresInSeconds });
}
