import { DynamoDBClient, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb"
import { unmarshall } from "@aws-sdk/util-dynamodb"

const client = new DynamoDBClient({})

export default async function executeCommand(query, isScanCommand) {
  const response = await client.send(
    isScanCommand
      ? new ScanCommand(query)
      : new QueryCommand(query)
  )

  return {
    statusCode: 200,
    body: JSON.stringify(response.Items.map(item => unmarshall(item)))
  }
}