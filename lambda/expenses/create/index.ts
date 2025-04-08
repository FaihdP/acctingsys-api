import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import HEADERS from "../../headers";

const client = new DynamoDBClient({});

const TABLE_NAME = "expenses"
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
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid or missing fields: " + invalidField[0] })
    }
}

export const handler = async (event) => {
  let response = {}
  const { ExpenseID, date, value, title, description } = JSON.parse(event.body)
  const Item: any = { ExpenseID, date, value, title, description }
  
  try {
    validateExpense(Item)
    await client.send(new PutItemCommand({ TableName: TABLE_NAME, Item: marshall(Item, { removeUndefinedValues: true }) }))
    response = {
      statusCode: 200,
      body: JSON.stringify({ message: "Document saved correctly" })
    }
  } catch (errorResponse) {
    console.error(errorResponse)
    response = {
      statusCode: errorResponse.statusCode || 500,
      body: errorResponse.body || JSON.stringify({ message: "Internal server error: " + errorResponse.message })
    }
  }

  return {
    headers: HEADERS,
    ...response
  }
}