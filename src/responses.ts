export const echoResponse = (id: number, message: string)=> ({
  body: JSON.stringify({
    chat_id: id,
    disable_notification: true,
    method: 'sendMessage',
    parse_mode: 'MarkdownV2',
    text: message,
  }),
});

export const errorResponse = (code: number, message: string) => ({
  body: message,
  headers: {
    'content-type': 'text/plain',
    'cache-control': 'no-store',
  },
  statusCode: code,
});

export const methodNotAllowed = (method: string) => ({
  body: `Method ${method} Not Allowed.`,
  headers: {
    'content-type': 'text/plain',
    'cache-control': 'no-store',
    'allow': 'GET, HEAD, POST'
  },
  statusCode: 405,
});
