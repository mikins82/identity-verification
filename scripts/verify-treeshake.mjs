/**
 * Tree-shaking verification for @identity-verification/react.
 *
 * Bundles individual named exports via esbuild and asserts that importing
 * PhoneInput does NOT pull in camera / selfie code, and vice-versa.
 */

import { build } from "esbuild";
import { writeFile, rm, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { gzipSync } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const tmpDir = join(root, ".tmp-treeshake");
const distEntry = join(root, "packages/react/dist/index.js");

const EXTERNAL = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "@identity-verification/core",
  "@identity-verification/headless",
  "@identity-verification/headless/web",
  "@identity-verification/headless/react-native",
];

const CAMERA_MARKERS = [
  "SelfieCapture",
  "useCamera",
  "CameraController",
  "BrowserCameraAdapter",
  "getUserMedia",
  "captureFrame",
  "videoRef",
  "facingMode",
  "FaceGuide",
];

const PHONE_MARKERS = [
  "PhoneInput",
  "validatePhone",
  "dialCode",
  "phoneLength",
];

const cases = [
  {
    name: "PhoneInput only",
    code: `import { PhoneInput } from "${distEntry}";\nconsole.log(PhoneInput);`,
    forbidden: CAMERA_MARKERS,
    description: "Must not contain camera/selfie code",
  },
  {
    name: "SelfieCapture only",
    code: `import { SelfieCapture } from "${distEntry}";\nconsole.log(SelfieCapture);`,
    forbidden: PHONE_MARKERS,
    description: "Must not contain phone input code",
  },
  {
    name: "AddressForm only",
    code: `import { AddressForm } from "${distEntry}";\nconsole.log(AddressForm);`,
    forbidden: CAMERA_MARKERS,
    description: "Must not contain camera/selfie code",
  },
  {
    name: "Full SDK",
    code: `export * from "${distEntry}";`,
    forbidden: [],
    description: "Baseline — includes everything",
  },
];

async function bundleCase(tc) {
  const entry = join(tmpDir, `${tc.name.replace(/\s+/g, "-").toLowerCase()}.js`);
  await writeFile(entry, tc.code);

  const result = await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: "esm",
    external: EXTERNAL,
    minify: true,
    treeShaking: true,
    logLevel: "silent",
  });

  const output = result.outputFiles[0].text;
  const gzipped = gzipSync(output);

  // Strip import/export declarations — external package specifiers contain
  // symbol names as strings (e.g. `import { CameraController } from "..."`)
  // that don't represent actual bundled code. The regex handles both
  // unminified (`import {`) and minified (`import{`) forms.
  const codeBody = output
    .split("\n")
    .filter((line) => !/^\s*(import[\s{("']|export[\s{])/.test(line))
    .join("\n");
  const violations = tc.forbidden.filter((m) => codeBody.includes(m));

  return {
    name: tc.name,
    description: tc.description,
    rawBytes: output.length,
    gzipBytes: gzipped.length,
    violations,
    passed: violations.length === 0,
  };
}

function formatBytes(bytes) {
  return bytes < 1024
    ? `${bytes} B`
    : `${(bytes / 1024).toFixed(2)} kB`;
}

async function main() {
  await mkdir(tmpDir, { recursive: true });

  const results = [];
  for (const tc of cases) {
    results.push(await bundleCase(tc));
  }

  await rm(tmpDir, { recursive: true, force: true });

  const full = results.find((r) => r.name === "Full SDK");

  console.log("\n Tree-shaking verification\n");
  console.log("-".repeat(64));

  let allPassed = true;

  for (const r of results) {
    const status = r.passed ? "PASS" : "FAIL";
    const pct = full
      ? ` (${((r.gzipBytes / full.gzipBytes) * 100).toFixed(0)}% of full)`
      : "";
    console.log(`  ${status}  ${r.name}`);
    console.log(`        ${r.description}`);
    console.log(
      `        Raw: ${formatBytes(r.rawBytes)}  |  Gzip: ${formatBytes(r.gzipBytes)}${pct}`,
    );
    if (!r.passed) {
      console.log(`        Leaked symbols: ${r.violations.join(", ")}`);
      allPassed = false;
    }
    console.log("-".repeat(64));
  }

  console.log();
  if (!allPassed) {
    console.error("Tree-shaking verification FAILED.");
    console.error(
      "Importing a component pulls in unrelated code. Check barrel exports and side effects.",
    );
    process.exit(1);
  }

  console.log("Tree-shaking verification passed.");
  console.log("Each component can be imported independently without pulling unrelated code.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
