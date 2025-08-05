export default function setBranchExpression(
  queryStringParameters: any, 
  branches: string[],
  expressions: string[], 
  expressionValues: any,
  isScanCommand: boolean
) {
  if (queryStringParameters.branch) {
    if (queryStringParameters.branch === "all") {
      expressionValues[":branchPrefix"] = { S: "BRANCH#" }
      expressions.push("begins_with(branchId, :branchPrefix)")
    } else if (Array.isArray(branches) && branches.length > 0) {

      const branchPlaceholders: string[] = [];
      branches.forEach((branch, i) => {
        const placeholder = `:b${i}`
        branchPlaceholders.push(placeholder)
        expressionValues[placeholder] = { S: `BRANCH#${branch}` }
      })
      
      expressions.push(`branchId IN (${branchPlaceholders.join(", ")})`)
    } else {
      isScanCommand = false
      expressionValues[":branchId"] = { S: `BRANCH#${branches[0]}` }
      expressions.push("branchId = :branchId")
    }
  }
}