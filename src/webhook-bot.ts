import {LambdaFunctionURLEvent, LambdaFunctionURLHandler, LambdaFunctionURLResult} from 'aws-lambda';
import {echoResponse, errorResponse, methodNotAllowed} from "./responses";
import {md} from 'telegram-escape';
import {stringify} from 'yaml';

const allowedMethods = new Set(['GET', 'HEAD', 'POST']);
const supportedMessages = new Set([
  'message', 'edited_message',
  'channel_post', 'edited_channel_post',
  'message_reaction', 'message_reaction_count',
  'my_chat_member', 'chat_member', 'chat_join_request',
  'chat_boost', 'removed_chat_boost']);

export const echoHandler: LambdaFunctionURLHandler = async (event: LambdaFunctionURLEvent): Promise<LambdaFunctionURLResult> => {
  console.log(`Request: ${JSON.stringify(event, null, 2)}`);

  const method = event.requestContext.http.method;

  if (!allowedMethods.has(method.toUpperCase())) {
    return methodNotAllowed(method);
  }

  const body = event?.body;

  if (!body) {
    return errorResponse(400, 'Body is not a valid JSON body.');
  }

  try {
    const update = JSON.parse(body);
    const message: any = (Object.entries(update).find(([key]) => supportedMessages.has(key)) ?? [])[1];

    const id: number | undefined = message?.chat?.id;

    if (!id) {
      return errorResponse(400, 'Body is not a valid Telegram message.');
    }

    const markupMessage = stringify(update);
    const echoMessage = md`\`\`\`yaml\n${markupMessage}\n\`\`\``;

    console.log(`YAML: ${markupMessage}`);

    return echoResponse(id, echoMessage);
  } catch (error) {
    return errorResponse(400, 'Body is not a valid JSON body.');
  }
}