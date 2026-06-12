import { z } from 'zod';

export const MetricsSchema = z.object({
  lambdaInvocations: z.number().int().nonnegative(),
  s3StorageMB: z.number().nonnegative(),
  apiErrors: z.number().int().nonnegative(),
  responseTime: z.number().nonnegative(),
  userActivity: z.number().int().min(0).max(100),
});

export type Metrics = z.infer<typeof MetricsSchema>;
