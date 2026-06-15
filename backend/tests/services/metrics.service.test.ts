import { getMetrics } from '../../src/services/metrics.service';

jest.mock('../../src/libs/db');
import { getPool } from '../../src/libs/db';

const mockQuery = jest.fn();
(getPool as jest.Mock).mockReturnValue({ query: mockQuery });

const DB_ROW = {
  lambda_invocations: 120,
  s3_storage_mb: 450,
  api_errors: 3,
  response_time: 250,
  user_activity: 75,
};

beforeEach(() => {
  mockQuery.mockResolvedValue({ rows: [DB_ROW], rowCount: 1 });
});

afterEach(() => {
  mockQuery.mockReset();
});

describe('getMetrics service', () => {
  it('maps snake_case DB columns to camelCase Metrics type', async () => {
    const metrics = await getMetrics();
    expect(metrics).toEqual({
      lambdaInvocations: 120,
      s3StorageMB: 450,
      apiErrors: 3,
      responseTime: 250,
      userActivity: 75,
    });
  });

  it('queries the metrics table ordered by recorded_at DESC', async () => {
    await getMetrics();
    const sql: string = mockQuery.mock.calls[0][0];
    expect(sql).toMatch(/ORDER BY recorded_at DESC/);
    expect(sql).toMatch(/LIMIT 1/);
  });

  it('returns values that satisfy the Zod schema', async () => {
    const { MetricsSchema } = require('../../src/models/metrics');
    const result = MetricsSchema.safeParse(await getMetrics());
    expect(result.success).toBe(true);
  });

  it('throws when no row is returned', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    await expect(getMetrics()).rejects.toThrow('No metrics record found');
  });
});
