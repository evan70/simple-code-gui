// Voice-related utility functions

/**
 * Build sample audio URL from Piper voice key
 * Pattern: https://huggingface.co/rhasspy/piper-voices/resolve/main/{lang}/{lang_region}/{name}/{quality}/samples/speaker_0.mp3
 */
export function getSampleUrl(voiceKey: string): string | null {
  // Parse key like "en_US-lessac-medium" or "de_DE-thorsten-medium"
  const match = voiceKey.match(/^([a-z]{2})_([A-Z]{2})-(.+)-([a-z_]+)$/)
  if (!match) return null
  const [, lang, region, name, quality] = match
  return `https://huggingface.co/rhasspy/piper-voices/resolve/main/${lang}/${lang}_${region}/${name}/${quality}/samples/speaker_0.mp3`
}
