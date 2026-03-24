import { createWorker } from 'tesseract.js'

export const runtime = 'nodejs'

/** Vercel Pro / configurable; default 10s may be too low for first OCR cold start */
export const maxDuration = 60

const MAX_BYTES = 10 * 1024 * 1024

const IMAGE_MIME = /^image\/(png|jpeg|jpg|webp|gif)$/i

function looksLikeImage(file) {
  if (IMAGE_MIME.test(file.type || '')) return true
  const n = file.name || ''
  return /\.(png|jpe?g|webp|gif)$/i.test(n)
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return Response.json({ error: 'No image provided' }, { status: 400 })
    }

    if (!looksLikeImage(file)) {
      return Response.json({ error: 'Unsupported file type. Use PNG, JPG, WebP, or GIF.' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return Response.json({ error: 'Image too large – max 10MB.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const worker = await createWorker('eng')
    let text
    try {
      const result = await worker.recognize(buffer)
      text = result?.data?.text
    } finally {
      await worker.terminate()
    }

    const trimmed = (text || '').trim()
    if (!trimmed) {
      return Response.json(
        { error: 'No readable text found. Try a sharper, well-lit screenshot with larger text.' },
        { status: 422 }
      )
    }

    const wordCount = trimmed.split(/\s+/).filter(Boolean).length
    if (wordCount < 5) {
      return Response.json(
        { error: 'Very little text detected. Crop closer to the paragraph or use a higher-resolution image.' },
        { status: 422 }
      )
    }

    const baseName = (file.name || 'screenshot').replace(/\.[^.]+$/, '')

    return Response.json({
      text: trimmed,
      filename: baseName || 'screenshot',
      wordCount,
    })
  } catch (err) {
    console.error('extract-image error:', err)
    return Response.json(
      { error: 'Could not read text from this image. Try another file or format.' },
      { status: 500 }
    )
  }
}
