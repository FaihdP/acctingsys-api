import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({});

const TABLE_NAME = "invoices"
const INVOICE_TYPES = new Set(["BUY", "SALE"])
const INVOICE_STATUS = new Set(["Pagada", "En deuda"])
const HEADERS = {
  "Access-Control-Allow-Headers" : "Content-Type,X-Api-Key",
  "Access-Control-Allow-Origin": "https://localhost:3000",
  "Access-Control-Allow-Methods": "OPTIONS,POST"
}
const VALIDATORS = {
  InvoiceID: (v) => Boolean(v),
  date: (v) => Boolean(v),
  value: (v) => Boolean(v),
  type: (v) => INVOICE_TYPES.has(v),
  status: (v) => INVOICE_STATUS.has(v)
}

function validateInvoice(invoice) {
  const invalidFields = Object.entries(VALIDATORS).filter(([key, validate]) => !validate(invoice[key])).map(([key]) => key)
  if (invalidFields.length > 0)
    throw {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid or missing fields " + invalidFields.join(", ") })
    }
}

export const handler = async (event) => {
  let response = {}
  const { InvoiceID, date, value, type, status, person } = event
  const Item = { InvoiceID, date, value, type, status }
  if (person) Item.person = person
  
  try {
    validateInvoice(Item)
    await client.send(new PutItemCommand({ TableName: TABLE_NAME, Item: marshall(Item) }))
    response = {
      statusCode: 200,
      body: JSON.stringify({ message: "Document saved correctly" })
    }
  } catch (errorResponse) {
    response = {
      statusCode: err.statusCode || 500,
      body: err.body || JSON.stringify({ message: "Internal server error" })
    }
  }

  return {
    headers: HEADERS,
    ...response
  }
}