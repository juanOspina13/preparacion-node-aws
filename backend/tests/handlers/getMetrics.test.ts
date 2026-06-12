import { handler } from '../../src/handlers/getMetrics';
import { mockAPIGatewayEvent } from '../helpers';

describe('getMetrics handler', () => {
  it('returns 200 with the fixed metrics payload', async () => {
    const result = await handler(mockAPIGatewayEvent(), {} as never, () => undefined);

    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result?.body ?? '')).toEqual({
      lambdaInvocations: 120,
      s3StorageMB: 450,
      apiErrors: 3,
      responseTime: 250,
      userActivity: 75,
    });
  });

  it('sets CORS headers', async () => {
    const result = await handler(mockAPIGatewayEvent(), {} as never, () => undefined);

    expect(result?.headers?.['Access-Control-Allow-Origin']).toBe('*');
    expect(result?.headers?.['Content-Type']).toBe('application/json');
  });
});
