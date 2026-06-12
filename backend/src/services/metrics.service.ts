import { Metrics } from '../models/metrics';

// In production this would query RDS via getPool(); fixed values mirror the project spec.
export function getMetrics(): Metrics {
  return {
    lambdaInvocations: 120,
    s3StorageMB: 450,
    apiErrors: 3,
    responseTime: 250,
    userActivity: 75,
  };
}
