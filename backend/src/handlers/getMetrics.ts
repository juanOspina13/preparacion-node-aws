import { APIGatewayProxyHandler } from 'aws-lambda';
import { getMetrics } from '../services/metrics.service';
import { ok, internalError } from '../types/api';
import { logger } from '../libs/logger';

export const handler: APIGatewayProxyHandler = async (event) => {
  logger.info('getMetrics invoked', { requestId: event.requestContext.requestId });

  try {
    const metrics = getMetrics();
    return ok(metrics);
  } catch (err) {
    logger.error('Failed to fetch metrics', { err });
    return internalError();
  }
};
