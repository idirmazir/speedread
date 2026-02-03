export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    const { extractText } = await import('unpdf')
    const result = await extractText(uint8Array)

    const fullText = Array.isArray(result.text) ? result.text.join(' ') : String(result.text || '')

    if (!fullText.trim()) {
      return Response.json(
        { error: 'No text found in PDF. The file may be image-based or scanned.' },
        { status: 400 }
      )
    }

    return Response.json({
      text: fullText.trim(),
      pages: result.totalPages,
      filename: file.name,
    })
  } catch (error) {
    console.error('PDF extraction error:', error)
    return Response.json(
      { error: 'Failed to process PDF. The file may be corrupted or password protected.' },
      { status: 500 }
    )
  }
}