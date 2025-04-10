import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import HEADERS from "../../headers";

const client = new DynamoDBClient({});

const TABLE_NAME = "invoices"
const INVOICE_TYPES = new Set(["BUY", "SALE"])
const INVOICE_STATUS = new Set(["Pagada", "En deuda"])
const VALIDATORS = {
  InvoiceID: (v) => Boolean(v),
  date: (v) => Boolean(v),
  value: (v) => Boolean(v),
  type: (v) => INVOICE_TYPES.has(v),
  status: (v) => INVOICE_STATUS.has(v)
}

function validateInvoice(invoice) {
  const invalidField = Object.entries(VALIDATORS).find(([key, validate]) => !validate(invoice[key]))
  if (invalidField)
    throw {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid or missing fields: " + invalidField[0] })
    }
}

export const handler = async (event) => {
  let response = {}
  const { InvoiceID, date, value, type, status, person } = JSON.parse(event.body)
  const Item: any = { InvoiceID, date, value, type, status }
  if (person) Item.person = person
  
  try {
    validateInvoice(Item)
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