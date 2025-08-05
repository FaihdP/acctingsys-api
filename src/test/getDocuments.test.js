import { handler as getInvoices } from '../lambda/{table}/getDocuments.ts'

describe('getInvoices', () => {
  test('Call with empty event', async () => {
    const response = await getInvoices({})
    expect(response.statusCode).toBe(400)
    expect(response.body).toBe(JSON.stringify({ message: "Invalid request" }))
  })

  test('Call without end date', async () => {
    const response = await getInvoices({
      queryStringParameters: {
        start: "2022-01-01",
        branch: "all"
      },
      pathParameters: {
        table: "invoices"
      }
    })
    expect(response.statusCode).toBe(400)
    expect(response.body).toBe(JSON.stringify({ message: "Invalid request" }))
  })
  
  test('Call without date range', async () => {
  
    const response2 = await getInvoices({
      queryStringParameters: {
        branch: "all"
      },
      pathParameters: {
        table: "invoices"
      }
    })

    expect(response2.statusCode).toBe(400)
    expect(response2.body).toBe(JSON.stringify({ message: "Invalid request" }))
  })

  test('Call without branch', async () => {
    const response3 = await getInvoices({
      queryStringParameters: {
        start: "2022-01-01",
        end: "2022-01-01"
      },
      pathParameters: {
        table: "invoices"
      }
    })

    expect(response3.statusCode).toBe(400)
    expect(response3.body).toBe(JSON.stringify({ message: "Invalid request" }))
  })

  test('Call without table', async () => {
    const response3 = await getInvoices({
      queryStringParameters: {
        start: "2022-01-01",
        end: "2022-01-01",
        branch: "all"
      }
    })

    expect(response3.statusCode).toBe(400)
    expect(response3.body).toBe(JSON.stringify({ message: "Invalid request" }))
  })

  test('Call with date range and all branches', async () => {
    const response = await getInvoices({
      queryStringParameters: {
        start: "2022-01-01",
        end: "2022-01-01",
        branch: "all"
      },
      pathParameters: {
        table: "invoices"
      }
    })
    expect(response.statusCode).toBe(200)
    expect(Array.isArray(JSON.parse(response.body))).toBe(true)
  })

  test('Call with date range and multiple branches', async () => {
    const response = await getInvoices({
      queryStringParameters: {
        start: "2022-01-01",
        end: "2022-01-01",
        // The last branch in multiValueQueryStringParameters is placed as the branch in queryStringParameters
        branch: "0002"
      },
      multiValueQueryStringParameters: {
        branch: ["0001", "0002"]
      },
      pathParameters: {
        table: "invoices"
      }
    })
    expect(response.statusCode).toBe(200)
    expect(Array.isArray(JSON.parse(response.body))).toBe(true)
  })

  test('Call with date range and one branch', async () => {
    const response = await getInvoices({
      queryStringParameters: {
        start: "2022-01-01",
        end: "2022-01-01",
        branch: "0001"
      },
      multiValueQueryStringParameters: {
        branch: ["0001"]
      },
      pathParameters: {
        table: "invoices"
      }
    })
    expect(response.statusCode).toBe(200)
    expect(Array.isArray(JSON.parse(response.body))).toBe(true)
  })
})

