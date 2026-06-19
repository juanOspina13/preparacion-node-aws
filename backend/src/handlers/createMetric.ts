import { APIGatewayProxyHandler } from 'aws-lambda';
import { MetricsSchema } from '../models/metrics';
import { createMetric } from '../services/metrics.service';
import { created, badRequest, internalError } from '../types/api';
import { logger } from '../libs/logger';

export const handler: APIGatewayProxyHandler = async (event) => {
  logger.info('createMetric invoked', { requestId: event.requestContext.requestId });

  try {
    const body = JSON.parse(event.body ?? '{}');
    const parsed = MetricsSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues.map(i => i.message).join(', '), event.path);
    }

    const record = await createMetric(parsed.data);
    return created(record);
  } catch (err) {
    logger.error('Failed to create metric', { err });
    return internalError(event.path);
  }
};
