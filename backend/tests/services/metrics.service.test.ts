import { getMetrics } from '../../src/services/metrics.service';

describe('getMetrics service', () => {
  it('returns all required metric fields', () => {
    const metrics = getMetrics();
    expect(metrics).toEqual({
      lambdaInvocations: 120,
      s3StorageMB: 450,
      apiErrors: 3,
      responseTime: 250,
      userActivity: 75,
    });
  });

  it('returns values that satisfy the Zod schema', () => {
    const { MetricsSchema } = require('../../src/models/metrics');
    const result = MetricsSchema.safeParse(getMetrics());
    expect(result.success).toBe(true);
  });
});
