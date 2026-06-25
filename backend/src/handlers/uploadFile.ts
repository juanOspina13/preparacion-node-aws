import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import busboy from 'busboy';
import { uploadFile } from '../services/s3.service';
import { created, badRequest, internalError } from '../types/api';
import { logger } from '../libs/logger';

interface ParsedMultipart {
  folderSrc: string;
  fileName: string;
  fileBuffer: Buffer;
  contentType: string;
}

function parseMultipart(event: APIGatewayProxyEvent): Promise<ParsedMultipart> {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: { 'content-type': event.headers['Content-Type'] ?? event.headers['content-type'] } });

    let folderSrc = '';
    let fileName = '';
    let contentType = 'application/octet-stream';
    let fileBuffer: Buffer | null = null;

    bb.on('field', (name, value) => {
      if (name === 'folderSrc') folderSrc = value;
    });

    bb.on('file', (_name, stream, info) => {
      fileName = info.filename;
      contentType = info.mimeType;
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => { fileBuffer = Buffer.concat(chunks); });
    });

    bb.on('finish', () => {
      if (!folderSrc) return reject(new Error('folderSrc: required'));
      if (!fileBuffer || !fileName) return reject(new Error('file: required'));
      resolve({ folderSrc, fileName, fileBuffer, contentType });
    });

    bb.on('error', reject);

    const raw = event.isBase64Encoded
      ? Buffer.from(event.body ?? '', 'base64')
      : Buffer.from(event.body ?? '');

    bb.write(raw);
    bb.end();
  });
}

export const handler: APIGatewayProxyHandler = async (event) => {
  logger.info('uploadFile invoked', { requestId: event.requestContext.requestId });

  try {
    const { folderSrc, fileName, fileBuffer, contentType } = await parseMultipart(event);
    const key = await uploadFile(folderSrc, fileName, fileBuffer, contentType);
    return created({ key, fileName, folderSrc });
  } catch (err) {
    if (err instanceof Error && err.message.includes(': required')) {
      return badRequest(err.message, event.path);
    }
    logger.error('Failed to upload file', { err });
    return internalError(event.path);
  }
};
