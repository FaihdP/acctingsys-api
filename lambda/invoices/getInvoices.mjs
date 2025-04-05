import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb"

const client = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(client)

const TABLE_NAME = "invoices";

export const handler = async (event) => {
  const query = { TableName: TABLE_NAME }

  if (event.limit) query.Limit ??= event.limit
  if (event.query) query.KeyConditionExpression ??= event.query
  if (event.queryParams) query.ExpressionAttributeValues ??= event.queryParams
  
  try {
    return await dynamo.send(new QueryCommand(query))
  } catch (error) {
    const errorMessage = `Can't execute the query '${event.query}', params: [${event.queryParams}]: \n${error}`
    console.error(errorMessage)
    return {
      statusCode: 500,
      body: { message: errorMessage },
    }
  }
}