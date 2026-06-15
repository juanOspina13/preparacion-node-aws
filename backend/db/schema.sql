CREATE TABLE IF NOT EXISTS metrics (
  id                  SERIAL       PRIMARY KEY,
  lambda_invocations  INTEGER      NOT NULL CHECK (lambda_invocations >= 0),
  s3_storage_mb       NUMERIC      NOT NULL CHECK (s3_storage_mb >= 0),
  api_errors          INTEGER      NOT NULL CHECK (api_errors >= 0),
  response_time       NUMERIC      NOT NULL CHECK (response_time >= 0),
  user_activity       INTEGER      NOT NULL CHECK (user_activity BETWEEN 0 AND 100),
  recorded_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Seed row for local development
INSERT INTO metrics (lambda_invocations, s3_storage_mb, api_errors, response_time, user_activity)
VALUES (120, 450, 3, 250, 75);
