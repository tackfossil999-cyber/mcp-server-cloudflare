---
'@repo/tools': patch
---

chore: remove pnpx from wrangler deploy script

This is redundant because turbo and pnpm already add the bundled wrangler command to $PATH
