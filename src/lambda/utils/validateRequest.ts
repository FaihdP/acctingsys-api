import Data from "./interfaces/Data";
import HEADERS from "../constants/headers";

export default function validateRequest(request: Data) {
  if (
    !request.branchId 
    || !request.documents 
    || !Array.isArray(request.documents)
    || request.documents.length === 0
  ) return { 
    headers: HEADERS,
    statusCode: 400, 
    body: "Bad request structure" 
  }
}