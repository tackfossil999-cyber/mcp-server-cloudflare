---
'workers-observability': patch
'cloudflare-casb-mcp-server': patch
'cloudflare-browser-mcp-server': patch
'containers-mcp': patch
'workers-bindings': patch
'docs-vectorize': patch
'workers-builds': patch
'@repo/mcp-common': patch
'dns-analytics': patch
'dex-analysis': patch
'docs-autorag': patch
'cloudflare-ai-gateway-mcp-server': patch
'auditlogs': patch
'demo-day': patch
'cloudflare-autorag-mcp-server': patch
'logpush': patch
'cloudflare-radar-mcp-server': patch
---

chore: add suffixes to common files in apps and packages

It can be confusing switching between 16 files named 'index.ts', or 3 files named workers.ts. This change renames common files to have suffixes such as .types.ts, .api.ts, etc. to make it easier to work across files in the monorepo.
