import esbuild from "esbuild"
import fs from "fs"
import archiver from "archiver"
import { execSync } from "child_process"

const entryFile = process.argv[2]
const funcName = process.argv[3]

if (!entryFile && !funcName) {
  console.error("❌ You must indicate the function path and lambda function name (ej: node build-lambda.js lambda/invoices/create/index.ts createInvoice)")
  process.exit(1)
}

const paths = entryFile.split(entryFile.includes("/") ? "/" : "\\")
paths[0] = "dist"
paths[paths.length - 1] = "index.mjs"
const outFile = paths.join("/")
const zipPath = `zip/${funcName}.zip`;

esbuild.build({
  entryPoints: [entryFile],
  bundle: true,
  minify: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: outFile,
  sourcemap: false,
  external: ["@aws-sdk/client-dynamodb", "@aws-sdk/util-dynamodb"],
}).then(() => {
  console.log(`✅ Compiled (${outFile})`)

  fs.mkdirSync("zip", { recursive: true })
  const output = fs.createWriteStream(zipPath)
  const archive = archiver("zip", { zlib: { level: 9 } })

  archive.pipe(output)
  archive.file(outFile, { name: "index.mjs" })
  archive.finalize()

  output.on("close", () => {
    console.log(`📦 Compressed (${zipPath}) (${archive.pointer()} bytes)`)

    try {
      execSync(
       `aws lambda update-function-code --function-name ${funcName} --zip-file fileb://${zipPath}`, {
        stdio: "inherit"
      })
      console.log("🚀 Successful Lambda deployment")
    } catch (err) {
      console.error("❌ Error uploading Lambda:", err.message)
    }
  })

}).catch(() => process.exit(1));
