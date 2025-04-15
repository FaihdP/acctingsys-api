import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import HEADERS from "../../constants/headers";
import RESPONSE_MESSAGES from "@constants/responseMessages";
import { ACTIVE_STATUS } from "@constants/status";
import { PAYMENTS_TABLE_NAME } from "@constants/tablesNames";

const client = new DynamoDBClient({});

interface PaymentResponse { 
  PaymentID: string, 
  statusCode: number, 
  message: string 
}

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
      PayemntID: payment.InvoiceID,
      statusCode: 400,
      body: RESPONSE_MESSAGES.INVALID_OR_MISSING_FIELD + invalidField[0]
    }
}

export const handler = async (event) => {
  const documentsResponse: PaymentResponse[] = []
  const payments = JSON.parse(event.body)
  for (const payment of payments) {
    const { PaymentID, date, value, type, bank } = payment
    const Item: any = { PaymentID, date, value, type, bank, tatus: ACTIVE_STATUS }
    
    try {
      validatePayment(Item)

      await client.send(new PutItemCommand({ 
        TableName: PAYMENTS_TABLE_NAME, 
        Item: marshall(Item, { removeUndefinedValues: true }) 
      }))

      documentsResponse.push({
        PaymentID,
        statusCode: 200,
        message: RESPONSE_MESSAGES.DOCUMENT_SAVED
      })
    } catch (errorResponse) {
      console.error(errorResponse)
      documentsResponse.push({
        PaymentID: errorResponse.PaymentID,
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