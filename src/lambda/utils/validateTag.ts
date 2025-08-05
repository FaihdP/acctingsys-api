export default function validateTag(text: string, tag: string) {
  if (typeof text !== "string") return false
  return text.includes(tag)
}