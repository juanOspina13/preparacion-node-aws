const request = require('supertest');
const app = require('../src/server');

describe('GET /metrics', () => {
  it('returns HTTP status 200', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
  });

  it('responds with application/json content type', async () => {
    const res = await request(app).get('/metrics');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('lambdaInvocations is 120', async () => {
    const res = await request(app).get('/metrics');
    expect(res.body.lambdaInvocations).toBe(120);
  });

  it('s3StorageMB is 450', async () => {
    const res = await request(app).get('/metrics');
    expect(res.body.s3StorageMB).toBe(450);
  });

  it('apiErrors is 3', async () => {
    const res = await request(app).get('/metrics');
    expect(res.body.apiErrors).toBe(3);
  });

  it('responseTime is 250', async () => {
    const res = await request(app).get('/metrics');
    expect(res.body.responseTime).toBe(250);
  });

  it('userActivity is 75', async () => {
    const res = await request(app).get('/metrics');
    expect(res.body.userActivity).toBe(75);
  });

  it('response body has exactly 5 keys', async () => {
    const res = await request(app).get('/metrics');
    expect(Object.keys(res.body)).toHaveLength(5);
  });
});
