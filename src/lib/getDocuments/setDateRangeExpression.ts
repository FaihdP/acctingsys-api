export default function setDateRangeExpression(
  queryStringParameters: any, 
  expressions: string[], 
  expressionValues: any
) {
  if (queryStringParameters.start && queryStringParameters.end) {
    expressions.push("entryKey BETWEEN :start AND :end")
    expressionValues[":start"] = { S: queryStringParameters.start }
    expressionValues[":end"] = { S: queryStringParameters.end }
  }
}
  