export default function handleError(error) {
  const errorMessage = `Can't execute the query: \n${error}`
  console.error(errorMessage)
  return {
    statusCode: 500,
    body: JSON.stringify({ message: errorMessage }),
  }
}
  