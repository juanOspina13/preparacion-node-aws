import { Metrics } from '../models/metrics';

export async function getMetrics(): Promise<Metrics> {
  return {
    lambdaInvocations: 120,
    s3StorageMB: 450,
    apiErrors: 3,
    responseTime: 250,
    userActivity: 75,
  };
}
