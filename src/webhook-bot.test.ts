import {echoHandler} from "./webhook-bot";
import {LambdaFunctionURLEvent, LambdaFunctionURLHandler} from 'aws-lambda';
import {describe, expect, it} from '@jest/globals';

describe('Error responses', () => {

  it.each([
    'PUT',
    'DELETE',
    'CONNECT',
    'OPTIONS',
    'TRACE',
    'PATCH',
    'FAKE'])('Method not allowed: %s', async (methodName) => {
    const event: LambdaFunctionURLEvent = {
      requestContext: {
        http: {
          method: methodName
        }
      }
    } as any;
    const parameters = mockHandlerParameters(event);
    const result = echoHandler(...parameters);

    await expect(result).resolves.toEqual({
      statusCode: 405, headers: {
        'content-type': 'text/plain',
        'cache-control': 'no-store',
        'allow': 'GET, HEAD, POST'
      }, body: 'Method ' + methodName + ' Not Allowed.'
    });
  });

  it.each(['post', 'Head', 'GET'])('Body is missing, method %s', async (methodName) => {
    const event: LambdaFunctionURLEvent = {
      requestContext: {
        http: {
          method: methodName
        }
      }
    } as any;
    const parameters = mockHandlerParameters(event);
    const result = echoHandler(...parameters);

    await expect(result).resolves.toEqual({
      statusCode: 400, headers: {
        'content-type': 'text/plain',
        'cache-control': 'no-store'
      }, body: 'Body is not a valid JSON body.'
    });
  });

  it('Body is not JSON', async () => {
    const event: LambdaFunctionURLEvent = {
      requestContext: {
        http: {
          method: 'POST'
        }
      },
      body: 'qwerty'
    } as any;
    const parameters = mockHandlerParameters(event);
    const result = echoHandler(...parameters);

    await expect(result).resolves.toEqual({
      statusCode: 400, headers: {
        'content-type': 'text/plain',
        'cache-control': 'no-store'
      }, body: 'Body is not a valid JSON body.'
    });
  });

  it.each([
    '{"fruit":"Apple","size":"Large","color":"Red"}',
    '{"message":"Hello world"}',
    '{"message":{"chat":"rumors"}}',
    '{"message":{"chat":{"type":"group"}}}'])('Body is not a Telegram message: %s', async (message) => {
    const event: LambdaFunctionURLEvent = {
      requestContext: {
        http: {
          method: 'POST'
        }
      },
      body: message
    } as any;
    const parameters = mockHandlerParameters(event);
    const result = echoHandler(...parameters);

    await expect(result).resolves.toEqual({
      statusCode: 400, headers: {
        'content-type': 'text/plain',
        'cache-control': 'no-store'
      }, body: 'Body is not a valid Telegram message.'
    });
  });

})

describe('Happy path', () => {

  it('Make YAML echo of a received message', async () => {
    const event: LambdaFunctionURLEvent = {
      requestContext: {
        http: {
          method: 'POST'
        }
      },
      body: '{"message":{"chat":{"id":123},"text":"Hello world"}}'
    } as any;
    const parameters = mockHandlerParameters(event);
    const result = echoHandler(...parameters);

    await expect(result).resolves.toEqual({
      body: '{\"chat_id\":123,\"disable_notification\":true,\"method\":\"sendMessage\",\"parse_mode\":\"MarkdownV2\",\"text\":\"\\\\`\\\\`\\\\`yaml\\\\nmessage:\\n  chat:\\n    id: 123\\n  text: Hello world\\n\\\\n\\\\`\\\\`\\\\`\"}'
    });
  })

});

/*
test('Body is missing', (t) => {
  function callback: Callback<APIGatewayProxyResultV2> = (error, data) => {
    if (error) {
      throw error;
    }

    expect(data).toEqual({
      statusCode: 400, headers: {
        'content-type': 'text/plain',
        'cache-control': 'no-store',
      }, body: 'Body is not a valid JSON body'
    });
  }
  const parameters = mockHandlerParameters({isBase64Encoded: false}, callback);
  const result = echo(...parameters);

  expect(result).resolves.toEqual({
    statusCode: 400, headers: {
      'content-type': 'text/plain',
      'cache-control': 'no-store',
    }, body: 'Body is not a valid JSON body'
  });
});


 */
function mockHandlerParameters(partial: Partial<LambdaFunctionURLEvent> = {}): Parameters<LambdaFunctionURLHandler> {
  return [
    {...partial},
    undefined,
    undefined
  ] as unknown as Parameters<LambdaFunctionURLHandler>;
}