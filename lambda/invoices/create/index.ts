import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import HEADERS from "../../constants/headers";
import RESPONSE_MESSAGES from "@constants/responseMessages";
import { INVOICES_TABLE_NAME } from "@constants/tablesNames";

interface InvoiceResponse { 
  InvoiceID: string, 
  statusCode: number, 
  message: string 
}

const client = new DynamoDBClient({});

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
      InvoiceID: invoice.InvoiceID,
      statusCode: 400,
      body: RESPONSE_MESSAGES.INVALID_OR_MISSING_FIELD + invalidField[0]
    }
}

export const handler = async (event) => {
  const documentsResponse: InvoiceResponse[] = []
  const invoices = JSON.parse(event.body)
  for (const invoice of invoices) {
    const { InvoiceID, date, value, type, status, person } = invoice
    const Item: any = { InvoiceID, date, value, type, status }
    if (person) {
      Item.person = person.name + " " + person.lastname
    }
    
    try {
      validateInvoice(Item)

      await client.send(new PutItemCommand({ 
        TableName: INVOICES_TABLE_NAME, 
        Item: marshall(Item, { removeUndefinedValues: true }) 
      }))
      
      documentsResponse.push({
        InvoiceID,
        statusCode: 200,
        message: RESPONSE_MESSAGES.DOCUMENT_SAVED
      })
    } catch (errorResponse) {
      console.error(errorResponse)
      documentsResponse.push({
        InvoiceID: errorResponse.InvoiceID,
        statusCode: errorResponse.statusCode || 500,
        message: errorResponse.body || RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR + errorResponse.message
      })
    }
    
    return {
      headers: HEADERS,
      body: JSON.stringify(documentsResponse)
    }
  }
}