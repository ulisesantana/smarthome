import S from 'fluent-json-schema'

export const generateInternalServerErrorSchema = generateErrorSchema(
  500,
  'Internal server error.'
)

export const generateNotFoundErrorSchema = generateErrorSchema(
  404,
  'Not found.'
)

function generateErrorSchema (statusCode: number, error: string) {
  return (message: string) => S.object()
    .description(error)
    .examples([{ statusCode, error, message }])
    .prop('statusCode', S.integer().const(statusCode))
    .prop('error', S.string().const(error))
    .prop('message', S.string().const(message))
}
