import { z } from 'zod';

export const MetricsSchema = z.object({
  lambdaInvocations: z.number().int().nonnegative(),
  s3StorageMB: z.number().nonnegative(),
  apiErrors: z.number().int().nonnegative(),
  responseTime: z.number().nonnegative(),
  userActivity: z.number().int().min(0).max(100),
});

export const MetricRecordSchema = MetricsSchema.extend({
  id: z.string().uuid(),
});

export const PatchMetricsSchema = MetricsSchema.partial();

export type Metrics = z.infer<typeof MetricsSchema>;
export type MetricRecord = z.infer<typeof MetricRecordSchema>;
export type PatchMetrics = z.infer<typeof PatchMetricsSchema>;
