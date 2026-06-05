# React Playground: Serverless & Cloud Concepts

## Overview
A single scrollable React app with **full‑width blocks** for each backend/cloud concept.  
Each block displays **fixed numeric metrics** and includes **one simple interactive element**.

---

## Backend Specification

### API Endpoint
- **Route**: `/metrics`
- **Method**: `GET`
- **Response (fixed JSON)**:
```json
{
  "lambdaInvocations": 120,
  "s3StorageMB": 450,
  "apiErrors": 3,
  "responseTime": 250,
  "userActivity": 75
}
