import { APIGatewayProxyEvent } from 'aws-lambda';

export function mockAPIGatewayEvent(
  overrides: Partial<APIGatewayProxyEvent> = {},
): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/metrics',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '123456789012',
      apiId: 'test-api-id',
      authorizer: {},
      httpMethod: 'GET',
      identity: {} as APIGatewayProxyEvent['requestContext']['identity'],
      path: '/metrics',
      protocol: 'HTTP/1.1',
      requestId: 'test-request-id',
      requestTimeEpoch: Date.now(),
      resourceId: 'test-resource-id',
      resourcePath: '/metrics',
      stage: 'dev',
    },
    resource: '/metrics',
    ...overrides,
  };
}
