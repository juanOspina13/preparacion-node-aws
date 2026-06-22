import { randomUUID } from 'crypto';
import { Metrics, MetricRecord, PatchMetrics } from '../models/metrics';

// TODO: replace with a shared db client, e.g.:
//   import { pool } from '../libs/db';
//   const pool = new Pool({ host, port, user, password, database, ssl });

// In-memory store standing in for the database
const store = new Map<string, MetricRecord>([
  ['seed-1', { id: 'seed-1', lambdaInvocations: 125, s3StorageMB: 4.5, apiErrors: 2, responseTime: 85, userActivity: 72 }],
  ['seed-2', { id: 'seed-2', lambdaInvocations: 340, s3StorageMB: 12.1, apiErrors: 0, responseTime: 42, userActivity: 95 }],
]);

export async function getMetrics(): Promise<MetricRecord[]> {
  // DB: SELECT id, lambda_invocations, s3_storage_mb, api_errors, response_time, user_activity, recorded_at FROM metrics;
  return Array.from(store.values());
}

export async function getMetricById(id: string): Promise<MetricRecord | undefined> {
  // DB: SELECT ... FROM metrics WHERE id = $1;
  return store.get(id);
}

export async function createMetric(data: Metrics): Promise<MetricRecord> {
  const record: MetricRecord = { id: randomUUID(), ...data };
  // DB: INSERT INTO metrics (lambda_invocations, s3_storage_mb, ...) VALUES ($1, $2, ...) RETURNING *;
  store.set(record.id, record);
  return record;
}

export async function replaceMetric(id: string, data: Metrics): Promise<MetricRecord | undefined> {
  if (!store.has(id)) return undefined;
  const record: MetricRecord = { id, ...data };
  // DB: UPDATE metrics SET lambda_invocations=$1, s3_storage_mb=$2, ... WHERE id=$3 RETURNING *;
  //     returns undefined (no rows) when the id doesn't exist
  store.set(id, record);
  return record;
}

export async function patchMetric(id: string, data: PatchMetrics): Promise<MetricRecord | undefined> {
  const existing = store.get(id);
  if (!existing) return undefined;
  const updated: MetricRecord = { ...existing, ...data };
  // DB: UPDATE metrics SET <only the provided fields> WHERE id=$n RETURNING *;
  //     dynamically build SET clause from the keys present in `data`
  store.set(id, updated);
  return updated;
}

export async function deleteMetric(id: string): Promise<boolean> {
  // DB: DELETE FROM metrics WHERE id=$1;
  //     return true if rowCount > 0, false otherwise
  return store.delete(id);
}
