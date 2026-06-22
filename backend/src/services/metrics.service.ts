import { randomUUID } from 'crypto';
import { Metrics, MetricRecord, PatchMetrics } from '../models/metrics';

// Module-level store persists across warm Lambda invocations
const store = new Map<string, MetricRecord>([
  ['seed-1', { id: 'seed-1', lambdaInvocations: 125, s3StorageMB: 4.5, apiErrors: 2, responseTime: 85, userActivity: 72 }],
  ['seed-2', { id: 'seed-2', lambdaInvocations: 340, s3StorageMB: 12.1, apiErrors: 0, responseTime: 42, userActivity: 95 }],
]);

export async function getMetrics(): Promise<MetricRecord[]> {
  return Array.from(store.values());
}

export async function getMetricById(id: string): Promise<MetricRecord | undefined> {
  return store.get(id);
}

export async function createMetric(data: Metrics): Promise<MetricRecord> {
  const record: MetricRecord = { id: randomUUID(), ...data };
  store.set(record.id, record);
  return record;
}

export async function replaceMetric(id: string, data: Metrics): Promise<MetricRecord | undefined> {
  if (!store.has(id)) return undefined;
  const record: MetricRecord = { id, ...data };
  store.set(id, record);
  return record;
}

export async function patchMetric(id: string, data: PatchMetrics): Promise<MetricRecord | undefined> {
  const existing = store.get(id);
  if (!existing) return undefined;
  const updated: MetricRecord = { ...existing, ...data };
  store.set(id, updated);
  return updated;
}

export async function deleteMetric(id: string): Promise<boolean> {
  return store.delete(id);
}
