/**
 * Genera los PNGs de ícono de la PWA a partir del SVG fuente.
 *
 * Requisito previo: npm install sharp --save-dev
 * Uso:             npm run pwa:icons
 *
 * Salida:
 *   public/pwa-192x192.png          — ícono estándar 192×192
 *   public/pwa-512x512.png          — ícono estándar 512×512
 *   public/pwa-512x512-maskable.png — ícono maskable con safe-area 20%
 */

import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const publicDir = resolve(root, 'public')
const svgSource = readFileSync(resolve(publicDir, 'pwa-icon.svg'))

mkdirSync(publicDir, { recursive: true })

async function generate(svgBuffer, size, outputPath, maskable = false) {
  let pipeline = sharp(svgBuffer, { density: 300 }).resize(size, size)

  if (maskable) {
    // Para maskable: añadir 15% de padding en todos los lados con fondo #4a7c59
    const innerSize = Math.round(size * 0.7)
    const padding = Math.round((size - innerSize) / 2)

    const resizedInner = await sharp(svgBuffer, { density: 300 })
      .resize(innerSize, innerSize)
      .toBuffer()

    pipeline = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 74, g: 124, b: 89, alpha: 1 },
      },
    }).composite([{ input: resizedInner, top: padding, left: padding }])
  }

  await pipeline.png({ compressionLevel: 9 }).toFile(outputPath)
  console.log(`✓ ${outputPath}`)
}

await Promise.all([
  generate(svgSource, 192, resolve(publicDir, 'pwa-192x192.png')),
  generate(svgSource, 512, resolve(publicDir, 'pwa-512x512.png')),
  generate(svgSource, 512, resolve(publicDir, 'pwa-512x512-maskable.png'), true),
])

console.log('\nÍconos PWA generados correctamente en public/')
