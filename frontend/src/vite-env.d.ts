/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface WorkboxManifestEntry {
  integrity?: string
  revision: string | null
  url: string
}
declare const self: ServiceWorkerGlobalScope
declare const __WB_MANIFEST: WorkboxManifestEntry[]
