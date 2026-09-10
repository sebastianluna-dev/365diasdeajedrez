import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import nextra from "nextra";

const root = dirname(fileURLToPath(import.meta.url));

const withNextra = nextra({
  // Code blocks are long (schemas, SQL): keep them out of the search index.
  search: { codeblocks: false },
  defaultShowCopyCode: true,
});

export default withNextra({
  reactStrictMode: true,
  // This app lives inside the main repository, which has its own lockfile.
  // Pin the root so Next does not walk up and pick the parent project.
  outputFileTracingRoot: root,
  turbopack: { root },
});
