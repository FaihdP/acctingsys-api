import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import HEADERS from "../../constants/headers";
import RESPONSE_MESSAGES from "@constants/responseMessages";
import { ACTIVE_STATUS } from "@constants/status";
import { PAYMENTS_TABLE_NAME } from "@constants/tablesNames";
import getDate from "../../utils/utils";
import Data from "../../utils/interfaces/Data";

const client = new DynamoDBClient({});

interface PaymentResponse { 
  PaymentID: string, 
  statusCode: number, 
  message: string 
}

const INVOICE_TYPES = new Set(["DIGITAL", "CASH"])
const VALIDATORS = {
  branchId: (v) => Boolean(v),
  entryKey: (v) => {
    if (typeof v !== "string") return false
    return v.includes("#PAYMENTID#")
  },
  date: (v) => Boolean(v),
  value: (v) => Boolean(v),
  type: (v) => INVOICE_TYPES.has(v),
}

function validatePayment(payment) {
  const invalidField = Object.entries(VALIDATORS).find(([key, validate]) => !validate(payment[key]))
  if (invalidField)
    throw {
      PaymentID: payment.PaymentID,
      statusCode: 400,
      body: RESPONSE_MESSAGES.INVALID_OR_MISSING_FIELD + invalidField[0]
    }
}

export const handler = async (event) => {
  const documentsResponse: PaymentResponse[] = []
  const data: Data = JSON.parse(event.body)
  const payments = data.documents
  for (const payment of payments) {
    const { paymentId, date, value, type, bank } = payment
    const Item: any = { 
      branchId: data.branchId, 
      entryKey: `${getDate(date)}#PAYMENTID#${paymentId}`,
      date, 
      value, 
      type, 
      bank, 
      status: ACTIVE_STATUS 
    }
    
    try {
      validatePayment(Item)

      await client.send(new PutItemCommand({ 
        TableName: PAYMENTS_TABLE_NAME, 
        Item: marshall(Item, { removeUndefinedValues: true }) 
      }))

      documentsResponse.push({
        PaymentID: paymentId,
        statusCode: 200,
        message: RESPONSE_MESSAGES.DOCUMENT_SAVED
      })
    } catch (errorResponse) {
      console.error(errorResponse)
      documentsResponse.push({
        PaymentID: errorResponse.PaymentID,
        statusCode: errorResponse.statusCode || 500,
        message: errorResponse.body || RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR + ". " + errorResponse.message
      })
    }
  }

  return {
    headers: HEADERS,
    body: JSON.stringify(documentsResponse)
  }
}