import { APIGatewayProxyHandler } from 'aws-lambda';
import { z } from 'zod';
import { createFolder } from '../services/s3.service';
import { created, badRequest, internalError } from '../types/api';
import { logger } from '../libs/logger';

const CreateFolderSchema = z.object({
  folderName: z
    .string({ required_error: 'required', invalid_type_error: 'must be a string' })
    .min(1, 'must not be empty')
    .regex(/^[a-zA-Z0-9_-]+$/, 'must only contain letters, numbers, hyphens, and underscores'),
});

export const handler: APIGatewayProxyHandler = async (event) => {
  logger.info('createFolder invoked', { requestId: event.requestContext.requestId });

  try {
    const body = JSON.parse(event.body ?? '{}');
    const parsed = CreateFolderSchema.safeParse(body);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map(i => `${i.path.join('.') || 'body'}: ${i.message}`)
        .join('; ');
      return badRequest(detail, event.path);
    }

    const key = await createFolder(parsed.data.folderName);
    return created({ folderName: parsed.data.folderName, s3Key: key });
  } catch (err) {
    logger.error('Failed to create S3 folder', { err });
    return internalError(event.path);
  }
};
