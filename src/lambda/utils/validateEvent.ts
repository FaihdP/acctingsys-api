import { APIGatewayProxyEvent } from "aws-lambda"

export type ValidatedQuery = {
  branch: string
  start: string
  end: string
}

type ValidatedEvent = APIGatewayProxyEvent & {
  queryStringParameters: ValidatedQuery
  pathParameters: { table: 'invoices' | 'expenses' | 'payments' }
}

export default function validateEvent(event: APIGatewayProxyEvent): asserts event is ValidatedEvent {
  if (
    !event ||
    !event.queryStringParameters ||
    !event.queryStringParameters.start ||
    !event.queryStringParameters.end ||
    !event.queryStringParameters.branch ||
    !event.pathParameters?.table
  ) {
    throw {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid request" })
    }
  }
  
  if (!["invoices", "expenses", "payments"].includes(event.pathParameters.table)) {
    throw {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid request. Don't exist " + event.pathParameters.table + " table" })
    }
  }
}
