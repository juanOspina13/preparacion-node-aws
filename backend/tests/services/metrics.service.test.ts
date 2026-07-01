import {
  getMetrics,
  getMetricById,
  createMetric,
  replaceMetric,
  patchMetric,
  deleteMetric,
} from '../../src/services/metrics.service';
import { MetricRecord } from '../../src/models/metrics';

const SEED_1: MetricRecord = { id: 'seed-1', lambdaInvocations: 125, s3StorageMB: 4.5, apiErrors: 2, responseTime: 85, userActivity: 72 };
const SEED_2: MetricRecord = { id: 'seed-2', lambdaInvocations: 340, s3StorageMB: 12.1, apiErrors: 0, responseTime: 42, userActivity: 95 };

describe('getMetrics', () => {
  it('returns all seeded dummy records', async () => {
    const metrics = await getMetrics();
    expect(metrics).toEqual(expect.arrayContaining([SEED_1, SEED_2]));
  });

  it('returns values that satisfy the Zod schema', async () => {
    const { MetricsSchema } = require('../../src/models/metrics');
    const result = MetricsSchema.safeParse(await getMetrics());
    expect(result.success).toBe(true);
  });
});

describe('getMetricById', () => {
  it('returns the record for a known id', async () => {
    expect(await getMetricById('seed-1')).toEqual(SEED_1);
  });

  it('returns undefined for an unknown id', async () => {
    expect(await getMetricById('nonexistent')).toBeUndefined();
  });
});

describe('createMetric', () => {
  it('creates a record with a generated uuid', async () => {
    const data = { lambdaInvocations: 50, s3StorageMB: 1.0, apiErrors: 0, responseTime: 100, userActivity: 50 };
    const record = await createMetric(data);
    expect(record.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(record).toMatchObject(data);
  });

  it('created record is retrievable by id', async () => {
    const data = { lambdaInvocations: 10, s3StorageMB: 0.5, apiErrors: 1, responseTime: 200, userActivity: 30 };
    const created = await createMetric(data);
    expect(await getMetricById(created.id)).toEqual(created);
  });
});

describe('replaceMetric', () => {
  it('replaces an existing record', async () => {
    const original = await createMetric({ lambdaInvocations: 1, s3StorageMB: 1, apiErrors: 0, responseTime: 10, userActivity: 10 });
    const newData = { lambdaInvocations: 999, s3StorageMB: 99.9, apiErrors: 9, responseTime: 999, userActivity: 99 };
    const result = await replaceMetric(original.id, newData);
    expect(result).toEqual({ id: original.id, ...newData });
  });

  it('returns undefined for a non-existent id', async () => {
    const data = { lambdaInvocations: 0, s3StorageMB: 0, apiErrors: 0, responseTime: 0, userActivity: 0 };
    expect(await replaceMetric('nonexistent', data)).toBeUndefined();
  });
});

describe('patchMetric', () => {
  it('updates only the provided fields', async () => {
    const original = await createMetric({ lambdaInvocations: 100, s3StorageMB: 5, apiErrors: 1, responseTime: 50, userActivity: 60 });
    const result = await patchMetric(original.id, { apiErrors: 5 });
    expect(result).toEqual({ ...original, apiErrors: 5 });
  });

  it('returns undefined for a non-existent id', async () => {
    expect(await patchMetric('nonexistent', { apiErrors: 5 })).toBeUndefined();
  });
});

describe('deleteMetric', () => {
  it('returns true when deleting an existing record', async () => {
    const created = await createMetric({ lambdaInvocations: 1, s3StorageMB: 0, apiErrors: 0, responseTime: 0, userActivity: 0 });
    expect(await deleteMetric(created.id)).toBe(true);
  });

  it('returns false for a non-existent id', async () => {
    expect(await deleteMetric('nonexistent')).toBe(false);
  });
});
