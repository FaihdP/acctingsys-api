import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import HEADERS from "../../headers";

const client = new DynamoDBClient({});

const TABLE_NAME = "payments"
const INVOICE_TYPES = new Set(["DIGITAL", "CASH"])
const VALIDATORS = {
  PaymentID: (v) => Boolean(v),
  date: (v) => Boolean(v),
  value: (v) => Boolean(v),
  type: (v) => INVOICE_TYPES.has(v),
}

function validatePayment(payment) {
  const invalidField = Object.entries(VALIDATORS).find(([key, validate]) => !validate(payment[key]))
  if (invalidField)
    throw {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid or missing fields: " + invalidField[0] })
    }
}

export const handler = async (event) => {
  let response = {}
  const { PaymentID, date, value, type, bank } = JSON.parse(event.body)
  const Item: any = { PaymentID, date, value, type, bank }
  
  try {
    validatePayment(Item)
    await client.send(new PutItemCommand({ TableName: TABLE_NAME, Item: marshall(Item, { removeUndefinedValues: true }) }))
    response = {
      statusCode: 200,
      body: JSON.stringify({ message: "Document saved correctly" })
    }
  } catch (errorResponse) {
    console.error(errorResponse)
    response = {
      statusCode: errorResponse.statusCode || 500,
      body: errorResponse.body || JSON.stringify({ message: "Internal server error" })
    }
  }

  return {
    headers: HEADERS,
    ...response
  }
}