import validateEvent, { ValidatedQuery } from "@utils/validateEvent";
import setDateRangeExpression from "@lib/getDocuments/setDateRangeExpression";
import setBranchExpression from "@lib/getDocuments/setBranchExpression";
import executeCommand from "@lib/getDocuments/executeCommand";
import handleError from "@lib/getDocuments/handleError";
import { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log(event)
  try { validateEvent(event) } catch (error) { return error }

  const query: QueryCommandInput = { TableName: event.pathParameters.table }
  const branches = event.multiValueQueryStringParameters?.branch
  const queryStringParameters: ValidatedQuery = event.queryStringParameters
  
  const expressions = []
  const expressionValues: any = {}
  let isScanCommand: boolean = true

  setBranchExpression(
    queryStringParameters, 
    branches, 
    expressions, 
    expressionValues, 
    isScanCommand
  )
  
  setDateRangeExpression(
    queryStringParameters, 
    expressions, 
    expressionValues
  )
  
  // Depends the command the expression will be different (Query: KeyConditionExpression, Scan: FilterExpression)
  query[isScanCommand ? "FilterExpression" : "KeyConditionExpression"] = expressions.join(" AND ")
  query.ExpressionAttributeValues = expressionValues

  console.log(query)

  try {
    return executeCommand(query, isScanCommand)
  } catch (error) {
    return handleError(error)
  }
}