import esbuild from "esbuild"

esbuild.build({
  entryPoints: ["lambda/invoices/create/index.ts"],
  bundle: true,
  minify: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: "dist/invoices/create/index.mjs",
  sourcemap: false,
  external: ["@aws-sdk/client-dynamodb", "@aws-sdk/util-dynamodb"],
}).catch(() => process.exit(1));
