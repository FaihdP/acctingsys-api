import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "invoices"
const INVOICE_TYPES = ["BUY", "SALE"]
const INVOICE_STATUS = ["Pagada", "En deuda"]

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Headers" : "Content-Type,X-Api-Key",
    "Access-Control-Allow-Origin": "https://localhost:3000",
    "Access-Control-Allow-Methods": "OPTIONS,POST"
  }

  const validators = {
    InvoiceID: (v) => Boolean(v),
    date: (v) => Boolean(v),
    value: (v) => Boolean(v),
    type: (v) => INVOICE_TYPES.includes(v),
    status: (v) => INVOICE_STATUS.includes(v),
  }

  const { InvoiceID, date, value, type, status, person } = event
  const invoice = { InvoiceID, date, value, type, status, ...(person && { person }) }

  const invalidFields = Object.entries(validators).filter(([key, validate]) => !validate(invoice[key]))

  if (invalidFields.length > 0) {
    console.error("Invalid or missing fields: ", JSON.stringify(invalidFields))
    return {
      statusCode: 400,
      headers,
      body: { message: "Invalid or missing fields" },
    }
  }
  
  try {
    await dynamo.send(new PutCommand({ TableName: TABLE_NAME, Item: invoice }))
    return {
      statusCode: 200,
      headers,
      body: { message: "Document saved correctly" },
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      headers,
      body: { message: "Document can't be saved", error },
    }
  }
};
