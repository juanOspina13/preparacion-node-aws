import { S3Client } from '@aws-sdk/client-s3';

// S3 client initialized once per execution environment (reused across warm invocations).
export const s3 = new S3Client({ region: process.env.AWS_REGION ?? 'us-east-1' });
