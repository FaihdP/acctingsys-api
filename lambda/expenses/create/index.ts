import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import HEADERS from "@constants/headers";
import RESPONSE_MESSAGES from "@constants/responseMessages";
import { ACTIVE_STATUS } from "@constants/status";
import { EXPENSES_TABLE_NAME } from "@constants/tablesNames";

interface ExpenseResponse { 
  ExpenseID: string, 
  statusCode: number, 
  message: string 
}

const client = new DynamoDBClient({});

const VALIDATORS = {
  ExpenseID: (v) => Boolean(v),
  date: (v) => Boolean(v),
  value: (v) => Boolean(v),
  title: (v) => Boolean(v)
}

function validateExpense(expense) {
  const invalidField = Object.entries(VALIDATORS).find(([key, validate]) => !validate(expense[key]))
  if (invalidField)
    throw {
      ExpenseID: expense.ExpenseID,
      statusCode: 400,
      body: RESPONSE_MESSAGES.INVALID_OR_MISSING_FIELD + invalidField[0]
    }
}

export const handler = async (event) => {
  const documentsResponse: ExpenseResponse[] = []
  const expenses = JSON.parse(event.body)
  for (const expense of expenses) {
    const { ExpenseID, date, value, title, description } = expense
    const Item: any = { ExpenseID, date, value, title, description, status: ACTIVE_STATUS }
    try {
      validateExpense(Item)

      await client.send(new PutItemCommand({ 
        TableName: EXPENSES_TABLE_NAME, 
        Item: marshall(Item, { removeUndefinedValues: true }) 
      }))

      documentsResponse.push({
        ExpenseID,
        statusCode: 200,
        message: RESPONSE_MESSAGES.DOCUMENT_SAVED
      })
    } catch (errorResponse) {
      console.error(errorResponse)
      documentsResponse.push({
        ExpenseID: errorResponse.ExpenseID,
        statusCode: errorResponse.statusCode || 500,
        message: errorResponse.body || RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR + errorResponse.message
      })
    }
  }

  return {
    headers: HEADERS,
    body: JSON.stringify(documentsResponse)
  }
}