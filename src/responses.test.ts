import {echoResponse, errorResponse, methodNotAllowed} from "./responses";
import {describe, expect, test} from '@jest/globals';

describe('Responses', () => {

  test('Echo response', () => {
    const result = echoResponse(123, 'qwerty');

    expect(result).toEqual({
      body: '{\"chat_id\":123,\"disable_notification\":true,\"method\":\"sendMessage\",\"parse_mode\":\"MarkdownV2\",\"text\":\"qwerty\"}'
    });
  });

  test('Error response', () => {
    const result = errorResponse(123, "error message");

    expect(result).toEqual({
      statusCode: 123,
      headers: {'content-type': 'text/plain', 'cache-control': 'no-store'},
      body: 'error message'
    });
  });

  test('Method not allowed', () => {
    const result = methodNotAllowed("Qwerty");

    expect(result).toEqual({
      statusCode: 405,
      headers: {'content-type': 'text/plain', 'cache-control': 'no-store', 'allow': 'GET, HEAD, POST'},
      body: 'Method Qwerty Not Allowed.',
    })
  });

})
