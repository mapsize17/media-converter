export async function trackError(error: Error | unknown, source: string = 'media-converter') {
  try {
    const trackerUrl = process.env.NEXT_PUBLIC_ERROR_TRACKER_URL || 'http://localhost:3000/api/log';
    
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    await fetch(trackerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName: 'media-converter',
        message,
        stack,
        source,
      }),
    });
  } catch (err) {
    console.error('Failed to send error to tracker:', err);
  }
}
