import { createRequire } from "module";
import { build } from "esbuild";

const pkg = createRequire(import.meta.url)("./package.json");

await build({
  entryPoints: [
    "src/index.ts",
    "src/middleware-server.ts",
    "src/middleware-static.ts",
    "src/utils.ts",
  ],
  outdir: "dist",
  format: "esm",
  platform: "node",
  target: "node18",
  bundle: true,
  external: [...Object.keys(pkg.dependencies)],
});
