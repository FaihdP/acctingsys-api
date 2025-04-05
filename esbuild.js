import esbuild from "esbuild"

esbuild.build({
  entryPoints: ["lambda/invoices/create/index.mjs"],
  bundle: true,
  minify: true,
  platform: "node",
  target: "node22",
  outfile: "dist/index.js",
  sourcemap: false,
  external: ["@aws-sdk/client-dynamodb", "@aws-sdk/util-dynamodb"],
}).catch(() => process.exit(1));
