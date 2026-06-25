import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../libs/s3';
import { logger } from '../libs/logger';

const BUCKET = process.env.S3_BUCKET ?? 'gym-connect-bucket';
const IMG_PREFIX = 'img/';

export async function createFolder(folderName: string): Promise<string> {
  const key = `${IMG_PREFIX}${folderName}/`;
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: '' }));
  return key;
}

export async function uploadFile(
  folderSrc: string,
  fileName: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  const key = `${IMG_PREFIX}${folderSrc}/${fileName}`;
  logger.info(`Uploading file to s3://${BUCKET}/${key}`);
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
  return key;
}
