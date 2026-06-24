import { z } from 'zod';

export const MetricsItemSchema = z.object({
  lambdaInvocations: z.number().int().nonnegative(),
  s3StorageMB: z.number().nonnegative(),
  apiErrors: z.number().int().nonnegative(),
  responseTime: z.number().nonnegative(),
  userActivity: z.number().int().min(0).max(100),
});

export const MetricsSchema = z.array(MetricsItemSchema);

export const MetricRecordSchema = MetricsItemSchema.extend({
  id: z.string().uuid(),
});

export const PatchMetricsSchema = MetricsItemSchema.partial();

export type Metrics = z.infer<typeof MetricsItemSchema>;
export type MetricRecord = z.infer<typeof MetricRecordSchema>;
export type PatchMetrics = z.infer<typeof PatchMetricsSchema>;
