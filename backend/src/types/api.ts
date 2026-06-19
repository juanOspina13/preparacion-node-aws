import { APIGatewayProxyResult } from 'aws-lambda';

// RFC 7807 — Problem Details for HTTP APIs
export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

export function ok<T>(data: T): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

function problem(p: ProblemDetail): APIGatewayProxyResult {
  return {
    statusCode: p.status,
    headers: { ...CORS, 'Content-Type': 'application/problem+json' },
    body: JSON.stringify(p),
  };
}

export function created<T>(data: T): APIGatewayProxyResult {
  return {
    statusCode: 201,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

export function noContent(): APIGatewayProxyResult {
  return { statusCode: 204, headers: CORS, body: '' };
}

export function badRequest(detail: string, instance?: string): APIGatewayProxyResult {
  return problem({ type: 'about:blank', title: 'Bad Request', status: 400, detail, instance });
}

export function notFound(detail: string, instance?: string): APIGatewayProxyResult {
  return problem({ type: 'about:blank', title: 'Not Found', status: 404, detail, instance });
}

export function internalError(instance?: string): APIGatewayProxyResult {
  return problem({ type: 'about:blank', title: 'Internal Server Error', status: 500, instance });
}
