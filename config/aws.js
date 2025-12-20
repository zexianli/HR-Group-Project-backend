import 'dotenv/config';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const {
    AWS_REGION,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET,
} = process.env;

if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
    throw new Error('Missing required AWS environment variables');
}

export const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

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

    const upload = new Upload({
        client: s3,
        params: {
            Bucket: AWS_S3_BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType,
        },
    });

    await upload.done();

    const url = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${encodeURIComponent(
        key
    ).replaceAll('%2F', '/')}`;

    return { bucket: AWS_S3_BUCKET, key, url };
}