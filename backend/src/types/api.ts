import { APIGatewayProxyResult } from 'aws-lambda';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

export function ok<T>(data: T): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(data),
  };
}

export function badRequest(message: string): APIGatewayProxyResult {
  return {
    statusCode: 400,
    headers: CORS_HEADERS,
    body: JSON.stringify({ message }),
  };
}

export function internalError(message = 'Internal server error'): APIGatewayProxyResult {
  return {
    statusCode: 500,
    headers: CORS_HEADERS,
    body: JSON.stringify({ message }),
  };
}
