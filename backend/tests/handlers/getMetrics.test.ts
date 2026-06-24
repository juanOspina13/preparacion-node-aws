import * as metricsService from '../../src/services/metrics.service';
import { handler } from '../../src/handlers/getMetrics';
import { mockAPIGatewayEvent } from '../helpers';
import { MetricRecord } from '../../src/models/metrics';

const MOCK_METRICS: MetricRecord = {
  lambdaInvocations: 120,
  s3StorageMB: 450,
  apiErrors: 3,
  responseTime: 250,
  userActivity: 75,
  id: "1"
};


afterEach(() => jest.restoreAllMocks());

describe('when the service resolves', () => {
  beforeEach(() => {
    jest.spyOn(metricsService, 'getMetrics').mockResolvedValue([MOCK_METRICS]);
  });

  it('returns 200 with the metrics payload', async () => {
    const result = await handler(mockAPIGatewayEvent(), {} as never, () => undefined);
    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result?.body ?? '')).toEqual([MOCK_METRICS]);
  });

  it('sets CORS and application/json headers', async () => {
    const result = await handler(mockAPIGatewayEvent(), {} as never, () => undefined);
    expect(result?.headers?.['Access-Control-Allow-Origin']).toBe('*');
    expect(result?.headers?.['Content-Type']).toBe('application/json');
  });
});

describe('when the service rejects', () => {
  beforeEach(() => {
    jest.spyOn(metricsService, 'getMetrics').mockRejectedValue(new Error('DB failure'));
  });

  it('returns 500', async () => {
    const result = await handler(mockAPIGatewayEvent(), {} as never, () => undefined);
    expect(result?.statusCode).toBe(500);
  });

  it('responds with application/problem+json', async () => {
    const result = await handler(mockAPIGatewayEvent(), {} as never, () => undefined);
    expect(result?.headers?.['Content-Type']).toBe('application/problem+json');
  });

  it('body conforms to RFC 7807 problem detail shape', async () => {
    const result = await handler(mockAPIGatewayEvent(), {} as never, () => undefined);
    const body = JSON.parse(result?.body ?? '');
    expect(body).toMatchObject({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      instance: '/metrics',
    });
  });
});
