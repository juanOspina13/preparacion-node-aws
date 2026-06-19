import { APIGatewayProxyHandler } from 'aws-lambda';
import { deleteMetric } from '../services/metrics.service';
import { noContent, badRequest, notFound, internalError } from '../types/api';
import { logger } from '../libs/logger';

export const handler: APIGatewayProxyHandler = async (event) => {
  logger.info('deleteMetric invoked', { requestId: event.requestContext.requestId });

  const id = event.pathParameters?.id;
  if (!id) return badRequest('Missing path parameter: id', event.path);

  try {
    const deleted = await deleteMetric(id);
    if (!deleted) return notFound(`Metric ${id} not found`, event.path);

    return noContent();
  } catch (err) {
    logger.error('Failed to delete metric', { err });
    return internalError(event.path);
  }
};
