import { APIGatewayProxyHandler } from 'aws-lambda';
import { PatchMetricsSchema } from '../models/metrics';
import { patchMetric } from '../services/metrics.service';
import { ok, badRequest, notFound, internalError } from '../types/api';
import { logger } from '../libs/logger';

export const handler: APIGatewayProxyHandler = async (event) => {
  logger.info('updateMetric invoked', { requestId: event.requestContext.requestId });

  const id = event.pathParameters?.id;
  if (!id) return badRequest('Missing path parameter: id', event.path);

  try {
    const body = JSON.parse(event.body ?? '{}');
    const parsed = PatchMetricsSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues.map(i => i.message).join(', '), event.path);
    }

    const record = await patchMetric(id, parsed.data);
    if (!record) return notFound(`Metric ${id} not found`, event.path);

    return ok(record);
  } catch (err) {
    logger.error('Failed to update metric', { err });
    return internalError(event.path);
  }
};
