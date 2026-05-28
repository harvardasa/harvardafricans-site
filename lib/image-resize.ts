// Client-side image downscale. Runs in the browser before the upload fetch
// so we don't waste bandwidth + storage on the original 5MB phone-camera
// images. Works in all modern browsers via canvas + toBlob.

const MAX_LONG_SIDE = 1600 // px
const JPEG_QUALITY = 0.85

export async function resizeImage(file: File): Promise<File> {
  // Pass through non-images (the upload route will reject them anyway).
  if (!file.type.startsWith('image/')) return file

  // GIFs and SVGs lose meaning when canvas-rasterized. Skip them.
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file

  // If it's already small enough, skip the resize step.
  if (file.size < 600 * 1024) return file

  const bitmap = await loadImage(file)
  try {
    const { width, height } = bitmap
    const longest = Math.max(width, height)
    if (longest <= MAX_LONG_SIDE) return file

    const scale = MAX_LONG_SIDE / longest
    const targetW = Math.round(width * scale)
    const targetH = Math.round(height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, targetW, targetH)

    // Always re-encode as JPEG for predictable size (WebP and PNG transparency
    // edge cases get tricky for non-technical admins; JPEG is universally fine
    // for event/board photos).
    const blob = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY)
    if (!blob) return file

    // Preserve original-ish filename but mark it as resized.
    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() })
  } finally {
    if ('close' in bitmap) (bitmap as ImageBitmap).close()
  }
}

async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file)
    } catch {
      // fall through to <img> path
    }
  }
  const url = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Could not decode image'))
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}
